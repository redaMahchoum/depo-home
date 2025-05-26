#!/bin/bash

# Agent Store Ubuntu Server Deployment Script

set -e  # Exit on any error

echo "🚀 Starting Agent Store deployment on Ubuntu Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed successfully"
    print_warning "Please logout and login again, then re-run this script"
    exit 0
fi

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    print_warning "Adding user to docker group..."
    sudo usermod -aG docker $USER
    print_warning "Please logout and login again, then re-run this script"
    exit 0
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_warning "Docker daemon is not running. Starting Docker..."
    sudo systemctl start docker
    sudo systemctl enable docker
    print_status "Docker daemon started"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_info "Please edit .env file with your database credentials:"
    print_info "  - Update DB_HOST with your database server IP"
    print_info "  - Update CORS_ALLOWED_ORIGINS with your server IP/domain"
    echo ""
    read -p "Press Enter to open .env file for editing..."
    ${EDITOR:-nano} .env
fi

# Validate environment file
if grep -q "your-server-ip" .env; then
    print_warning "Please update DB_HOST in .env file with your actual database server IP"
    read -p "Press Enter to edit .env file..."
    ${EDITOR:-nano} .env
fi

# Check if ports are available
if netstat -tuln 2>/dev/null | grep -q ":80 "; then
    print_error "Port 80 is already in use. Please stop the service using port 80 or change the port in docker-compose.yml"
    exit 1
fi

if netstat -tuln 2>/dev/null | grep -q ":8080 "; then
    print_error "Port 8080 is already in use. Please stop the service using port 8080 or change the port in docker-compose.yml"
    exit 1
fi

# Create necessary directories
mkdir -p logs

# Stop any existing containers
print_info "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
print_info "Building and starting the application..."
docker-compose up --build -d

# Wait for services to start
print_info "Waiting for services to start..."
sleep 15

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "Application deployed successfully!"
    echo ""
    print_info "🌐 Frontend: http://$(hostname -I | awk '{print $1}')"
    print_info "🌐 Frontend (localhost): http://localhost"
    print_info "🔧 Backend API: http://$(hostname -I | awk '{print $1}'):8080"
    print_info "🔧 Backend API (localhost): http://localhost:8080"
    echo ""
    print_info "📊 To view logs: docker-compose logs -f"
    print_info "🛑 To stop: docker-compose down"
    print_info "🔄 To restart: docker-compose restart"
    echo ""
    
    # Test connectivity
    print_info "Testing application connectivity..."
    sleep 5
    if curl -s http://localhost:80 > /dev/null; then
        print_status "Frontend is responding"
    else
        print_warning "Frontend might not be ready yet. Check logs: docker-compose logs agentstore-frontend"
    fi
    
    if curl -s http://localhost:8080 > /dev/null; then
        print_status "Backend is responding"
    else
        print_warning "Backend might not be ready yet. Check logs: docker-compose logs agentstore-api"
    fi
    
else
    print_error "Deployment failed. Checking logs..."
    docker-compose logs
    exit 1
fi

# Setup firewall rules (optional)
read -p "Do you want to configure UFW firewall rules? (y/N): " configure_firewall
if [[ $configure_firewall =~ ^[Yy]$ ]]; then
    print_info "Configuring firewall rules..."
    sudo ufw allow 80/tcp
    sudo ufw allow 8080/tcp
    sudo ufw allow 22/tcp  # SSH
    print_status "Firewall rules configured"
fi

print_status "Deployment completed successfully!"
print_info "Your application is now running on the server." 