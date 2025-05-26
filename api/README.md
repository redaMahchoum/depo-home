# Agent Store API with JWT Authentication

This project is a Spring Boot backend for an Agent Store application with JWT authentication, role-based access control, PostgreSQL database, and **database-stored image management**.

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.x**
- **Spring Security** with JWT authentication
- **PostgreSQL 16** database
- **Flyway** for database migrations
- **Docker** for containerization
- **Swagger/OpenAPI** for API documentation
- **Base64 Image Storage** for agent avatars and media

## Features

- JWT-based authentication with token refresh
- Role-based access control (Admin, VIP, Regular users)
- User management (create, update, delete)
- Agent management (create, update, delete)
- **Database-stored image management** with base64 encoding
- **Multiple image format support** (JPEG, PNG, GIF, WebP, BMP, SVG)
- **Image validation and optimization** utilities
- **Dedicated image endpoints** for raw binary and data URL access
- Agent access control based on user roles
- Database migration with Flyway
- Docker support for independent deployment

## Project Structure

```
backend/
├── src/main/java/com/agentstore/api/
│   ├── config/             # Configuration classes
│   ├── controller/         # REST controllers (including ImageController)
│   ├── dto/                # Data transfer objects
│   ├── entity/             # JPA entities
│   ├── exception/          # Exception handling
│   ├── repository/         # JPA repositories
│   ├── security/           # JWT and security
│   ├── service/            # Business logic
│   └── util/               # Utility classes (ImageUtil)
└── src/main/resources/
    ├── db/migration/       # Flyway migrations
    ├── application.yml     # Common config
    ├── application-dev.yml # Dev profile
    └── application-prod.yml # Prod profile
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Docker and Docker Compose (for containerized deployment)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/agentstore.git
   cd agentstore
   ```

2. Start PostgreSQL database:
   ```bash
   docker-compose -f docker-compose-db.yml up -d
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

4. Access the API:
   - API: http://localhost:8080/api/v1
   - Swagger UI: http://localhost:8080/api/v1/swagger-ui.html

### Running with Docker

1. Start the database:
   ```bash
   docker-compose -f docker-compose-db.yml up -d
   ```

2. Build and start the application:
   ```bash
   docker-compose -f docker-compose-app.yml up -d
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user

### User Management

- `GET /api/v1/users` - List all users (Admin only)
- `GET /api/v1/users/{id}` - Get user details
- `POST /api/v1/users` - Create user (Admin only)
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user (Admin only)
- `POST /api/v1/users/{userId}/roles` - Assign roles (Admin only)

### Agent Management

- `GET /api/v1/agents` - Get agents (filtered by permissions)
- `GET /api/v1/agents/{id}` - Get agent details
- `POST /api/v1/agents` - Create agent with image (Admin only)
- `PUT /api/v1/agents/{id}` - Update agent with image (Admin only)
- `DELETE /api/v1/agents/{id}` - Delete agent (Admin only)
- `POST /api/v1/agents/users/{userId}/agents/{agentId}` - Assign agent access (Admin only)
- `DELETE /api/v1/agents/users/{userId}/agents/{agentId}` - Revoke agent access (Admin only)

### Image Management

- `GET /api/v1/images/agents/{agentId}` - Get agent image as raw binary data
- `GET /api/v1/images/agents/{agentId}/data-url` - Get agent image as data URL

### Profile Management

- `GET /api/v1/profile` - Get current user profile
- `PUT /api/v1/profile` - Update current user profile

## Image Storage System

### Overview
Images are stored directly in the PostgreSQL database as **base64-encoded strings**, eliminating the need for external file storage or CDN services. This approach provides:

- **Self-contained deployment** - No external dependencies for image storage
- **Transactional consistency** - Images are part of database transactions
- **Simplified backup/restore** - Images included in database backups
- **Access control** - Images inherit the same security model as other data

### Supported Image Formats
- **JPEG** (`.jpg`, `.jpeg`) - `image/jpeg`
- **PNG** (`.png`) - `image/png`
- **GIF** (`.gif`) - `image/gif`
- **WebP** (`.webp`) - `image/webp`
- **BMP** (`.bmp`) - `image/bmp`
- **SVG** (`.svg`) - `image/svg+xml`

### Image Limitations
- **Maximum size**: 16MB (as base64 encoded)
- **Recommended size**: Under 2MB for optimal performance
- **Recommended dimensions**: 512x512 pixels or smaller for agent avatars

### Creating Agents with Images

#### Using Data URL (Recommended)
```json
{
    "id": "NEW_AGENT",
    "title": "My New Agent",
    "description": "Description of the agent",
    "imageDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHOLF1ZXwAAAABJRU5ErkJggg==",
    "linkUrl": "https://example.com/agent"
}
```

#### Using Separate Fields
```json
{
    "id": "NEW_AGENT",
    "title": "My New Agent", 
    "description": "Description of the agent",
    "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHOLF1ZXwAAAABJRU5ErkJggg==",
    "mimeType": "image/png",
    "linkUrl": "https://example.com/agent"
}
```

### Image Response Format
When fetching agents, the API returns both formats for maximum flexibility:

```json
{
    "id": "AGENT_ID",
    "title": "Agent Title",
    "description": "Agent description",
    "imageData": "base64_encoded_data",
    "mimeType": "image/png",
    "imageDataUrl": "data:image/png;base64,base64_encoded_data",
    "linkUrl": "https://example.com/agent",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
}
```

## Configuration

The application uses different configuration profiles:

- **Default**: Base configuration
- **Development**: Enhanced logging, Flyway cleans database
- **Production**: Minimal logging, Flyway preserves data

### Environment Variables

You can customize the application using these environment variables:

- `SPRING_PROFILES_ACTIVE`: Set to `dev` or `prod`
- `SPRING_DATASOURCE_URL`: JDBC connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT signing
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins

## Security

- Passwords are stored using BCrypt encoding
- JWTs contain minimal claims (username, roles)
- Token validation on every request
- Proper CORS configuration
- Role-based access control
- **Image validation** - Format and size validation for uploaded images
- **Base64 encoding validation** - Ensures data integrity

## Database Schema

### Agents Table
The agents table includes dedicated columns for image storage:
- `image_data` (TEXT) - Base64 encoded image data
- `mime_type` (VARCHAR) - MIME type of the stored image
- Indexed for efficient image queries

## Performance Considerations

### Image Storage
- **Database size**: Base64 encoding increases storage by ~33%
- **Memory usage**: Large images consume more memory during processing
- **Network transfer**: Base64 images increase JSON payload size
- **Caching**: Image endpoints include cache headers for optimization

### Optimization Tips
- Compress images before converting to base64
- Use appropriate image formats (JPEG for photos, PNG for graphics)
- Consider lazy loading for image-heavy interfaces
- Monitor database growth due to image storage

## Documentation

For detailed image handling instructions, see:
- `IMAGE_FORMAT_GUIDE.md` - Comprehensive guide for image preparation and usage
- Swagger UI at `/api/v1/swagger-ui.html` - Interactive API documentation

## License

This project is licensed under the MIT License.

## Notes

Default admin credentials:
- Username: admin
- Password: password 