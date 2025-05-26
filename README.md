# Agent Store - Full Stack Application

A full-stack application with React frontend and Spring Boot backend, containerized with Docker.

## Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Spring Boot + Java 17
- **Database**: PostgreSQL (external)
- **Containerization**: Docker + Docker Compose

## Prerequisites

- Docker and Docker Compose installed
- Access to your PostgreSQL database server
- Git (for cloning the repository)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd agentstore
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your database credentials:

```bash
cp env.example .env
```

Edit `.env` file with your actual database configuration:
```env
# Database Configuration
DB_HOST=your-actual-server-ip
DB_PORT=5432
DB_NAME=agentstoreDB
DB_USERNAME=depo
DB_PASSWORD=Kawasaki@007

# JWT Configuration
JWT_SECRET=5b96d669681c4a7682d399455a7aa8e2d657bb43bc384c528ba3fdf5170324d9

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

### 3. Build and Run the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 4. Access the Application

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html (if available)

## Development

### Running Individual Services

#### Backend Only
```bash
cd api
docker build -t agentstore-api .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://your-server-ip:5432/agentstoreDB \
  -e SPRING_DATASOURCE_USERNAME=depo \
  -e SPRING_DATASOURCE_PASSWORD=Kawasaki@007 \
  agentstore-api
```

#### Frontend Only
```bash
cd agent-store-dashboard-ui
docker build -t agentstore-frontend .
docker run -p 80:80 agentstore-frontend
```

### Local Development (without Docker)

#### Backend
```bash
cd api
./mvnw spring-boot:run
```

#### Frontend
```bash
cd agent-store-dashboard-ui
pnpm install
pnpm run dev
```

## Database Setup

### Using Your External Database
The application is configured to connect to your existing PostgreSQL database. Make sure:

1. Your PostgreSQL server is accessible from the Docker containers
2. The database `agentstoreDB` exists
3. The user `depo` has appropriate permissions

### Using Local Database (Optional)
If you want to use a local database for testing:

```bash
# Start only the database
docker-compose -f docker-compose.db.yml up -d

# Then update your .env file to use localhost
DB_HOST=localhost
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | your-server-ip |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | agentstoreDB |
| `DB_USERNAME` | Database username | depo |
| `DB_PASSWORD` | Database password | Kawasaki@007 |
| `JWT_SECRET` | JWT signing secret | (provided default) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | localhost origins |
| `SPRING_PROFILES_ACTIVE` | Spring profile | prod |

### Frontend Configuration

The frontend is configured to proxy API requests to the backend. The nginx configuration handles:
- React Router (SPA routing)
- API proxying to backend
- Static asset serving
- Security headers
- Gzip compression

## Deployment

### Production Deployment

1. Update the `.env` file with production values
2. Ensure your database is accessible from the deployment environment
3. Run the application:

```bash
docker-compose up --build -d
```

### Scaling

To scale the application:

```bash
# Scale frontend instances
docker-compose up --scale agentstore-frontend=3 -d

# Scale backend instances (requires load balancer)
docker-compose up --scale agentstore-api=2 -d
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if your PostgreSQL server is running
   - Verify the database credentials in `.env`
   - Ensure the database is accessible from Docker containers

2. **Frontend Can't Connect to Backend**
   - Check if the backend container is running: `docker ps`
   - Verify the API proxy configuration in nginx.conf

3. **Port Conflicts**
   - Change the port mappings in docker-compose.yml if needed
   - Default ports: 80 (frontend), 8080 (backend)

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs agentstore-api
docker-compose logs agentstore-frontend

# Follow logs in real-time
docker-compose logs -f
```

### Health Checks

```bash
# Check backend health
curl http://localhost:8080/actuator/health

# Check frontend
curl http://localhost/
```

## File Structure

```
agentstore/
├── agent-store-dashboard-ui/     # Frontend React application
│   ├── src/                      # Source code
│   ├── Dockerfile               # Frontend Docker configuration
│   ├── nginx.conf               # Nginx configuration
│   └── package.json             # Dependencies
├── api/                         # Backend Spring Boot application
│   ├── src/                     # Source code
│   ├── Dockerfile              # Backend Docker configuration
│   └── pom.xml                 # Maven dependencies
├── docker-compose.yml          # Main compose file (no database)
├── docker-compose.db.yml       # Database compose file (optional)
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

[Add your license information here] 