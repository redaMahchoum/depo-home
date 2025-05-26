# Agent Store Deployment Script for Windows

Write-Host "🚀 Starting Agent Store deployment..." -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not available. Please ensure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "📝 Please edit .env file with your database credentials before continuing." -ForegroundColor Cyan
    Write-Host "   Update DB_HOST with your actual server IP address." -ForegroundColor Cyan
    Read-Host "Press Enter to continue after updating .env file"
}

# Build and start the application
Write-Host "🔨 Building and starting the application..." -ForegroundColor Blue
docker-compose down
docker-compose up --build -d

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
$runningServices = docker-compose ps
if ($runningServices -match "Up") {
    Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
    Write-Host "🔧 Backend API: http://localhost:8080" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 To view logs: docker-compose logs -f" -ForegroundColor Gray
    Write-Host "🛑 To stop: docker-compose down" -ForegroundColor Gray
} else {
    Write-Host "❌ Deployment failed. Check logs with: docker-compose logs" -ForegroundColor Red
    exit 1
} 