#!/bin/bash

# Agent Store Deployment Script

echo "🚀 Starting Agent Store deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your database credentials before continuing."
    echo "   Update DB_HOST with your actual server IP address."
    read -p "Press Enter to continue after updating .env file..."
fi

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose down
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Application deployed successfully!"
    echo ""
    echo "🌐 Frontend: http://localhost:3007"
    echo "🔧 Backend API: http://localhost:8445"
    echo ""
    echo "📊 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi 