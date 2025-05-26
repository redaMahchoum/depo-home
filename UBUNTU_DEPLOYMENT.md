# Ubuntu Server Deployment Guide

## 🎯 Complete Walkthrough for Ubuntu Server

### Prerequisites
- Ubuntu Server 20.04+ 
- SSH access to the server
- PostgreSQL database running (your existing setup)
- Domain name or server IP address

## 📋 Step-by-Step Deployment

### 1. Prepare Your Code (Local Machine)

```bash
# Add all files to git
git add .
git commit -m "Add Docker configuration for production deployment"

# Push to GitHub (create repository if needed)
git remote add origin https://github.com/your-username/agentstore.git
git push -u origin main
```

### 2. Server Initial Setup

```bash
# SSH into your Ubuntu server
ssh your-username@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano net-tools
```

### 3. Clone and Deploy

```bash
# Clone your repository
git clone https://github.com/your-username/agentstore.git
cd agentstore

# Make the Ubuntu deployment script executable
chmod +x deploy-ubuntu.sh

# Run the deployment script (it will install Docker if needed)
./deploy-ubuntu.sh
```

### 4. Configure Environment

The script will prompt you to edit the `.env` file. Update these values:

```env
# Your database server (if PostgreSQL is on the same server)
DB_HOST=localhost

# If PostgreSQL is on a different server
DB_HOST=your-database-server-ip

# Your server's public IP or domain
CORS_ALLOWED_ORIGINS=http://localhost,http://YOUR_SERVER_IP,http://your-domain.com
```

## 🔧 Manual Installation (Alternative)

If you prefer to install everything manually:

### Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
ssh your-username@your-server-ip
```

### Deploy Application
```bash
cd agentstore
cp env.example .env
nano .env  # Edit configuration

# Deploy
docker-compose up --build -d
```

## 🌐 Access Your Application

After successful deployment:

- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP:8080`

## 🔒 Security Considerations

### Firewall Configuration
```bash
# Enable UFW firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # Frontend
sudo ufw allow 8080/tcp # Backend API

# Check status
sudo ufw status
```

### SSL/HTTPS Setup (Recommended for Production)

Install Nginx as reverse proxy with SSL:

```bash
# Install Nginx
sudo apt install nginx

# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Update docker-compose.yml to use different ports
# Frontend: 3000, Backend: 8080
# Let Nginx handle port 80/443
```

## 📊 Monitoring and Maintenance

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f agentstore-api
docker-compose logs -f agentstore-frontend
```

### Application Management
```bash
# Stop application
docker-compose down

# Restart application
docker-compose restart

# Update application (after code changes)
git pull
docker-compose up --build -d
```

### System Monitoring
```bash
# Check Docker containers
docker ps

# Check system resources
htop
df -h
free -h

# Check application status
curl http://localhost
curl http://localhost:8080
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up --build -d

# Clean up old images (optional)
docker system prune -f
```

### Database Backup (if using local DB)
```bash
# Backup database
docker exec postgresDB pg_dump -U postgres agentstoreDB > backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i postgresDB psql -U postgres agentstoreDB < backup_20240101.sql
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 80 already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # or nginx
   ```

2. **Docker permission denied**
   ```bash
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

3. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Check database connectivity
   psql -h localhost -U depo -d agentstoreDB
   ```

4. **Frontend not loading**
   ```bash
   # Check nginx logs in container
   docker-compose logs agentstore-frontend
   
   # Check if backend is accessible
   curl http://localhost:8080
   ```

### Performance Optimization

```bash
# Increase Docker resources if needed
# Edit /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment configuration: `cat .env`
3. Test database connectivity
4. Check firewall settings: `sudo ufw status`

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Server has Docker and Docker Compose installed
- [ ] Application containers are running
- [ ] Frontend accessible via browser
- [ ] Backend API responding
- [ ] Database connection working
- [ ] Firewall configured
- [ ] SSL certificate installed (production) 