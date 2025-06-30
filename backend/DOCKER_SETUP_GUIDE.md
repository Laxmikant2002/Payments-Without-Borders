# Docker Setup Guide - Payments Without Borders

## 🐳 Docker Installation and Setup

### Prerequisites
- Docker Desktop installed on your Windows machine
- Docker Compose included with Docker Desktop
- PowerShell or Command Prompt access

### Quick Start with Docker

#### 1. Start the Application with Docker Compose
```bash
# Navigate to the backend directory
cd c:\Users\laxmi\OneDrive\Documents\pay_hack\backend

# Start all services (MongoDB, Redis, Mojaloop Simulator, and the app)
docker-compose up -d

# Check if all services are running
docker-compose ps

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f app
```

#### 2. Stop the Application
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### Docker Services Overview

The Docker Compose setup includes:

1. **app** - Main Node.js application (Port 3000)
2. **mongodb** - MongoDB database (Port 27017)
3. **redis** - Redis cache (Port 6379)
4. **mojaloop-simulator** - Mojaloop test environment (Ports 3001-3002)

### Environment Configuration

#### Production Environment Variables
Create a `.env.docker` file for Docker-specific configuration:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://mongodb:27017/payments_without_borders

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Encryption
BCRYPT_ROUNDS=12

# External Services
MOCK_EXTERNAL_SERVICES=true
MOJALOOP_HUB_ENDPOINT=http://mojaloop-simulator:3000
MOJALOOP_DFSP_ID=paymentswithoutborders
MOJALOOP_PARTICIPANT_ID=payments-dfsp

# Logging
LOG_LEVEL=info
```

### Health Checks

#### Check Application Health
```bash
# Check if the application is healthy
curl http://localhost:3000/health

# Or using PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

#### Check Database Connections
```bash
# Connect to MongoDB container
docker exec -it backend_mongodb_1 mongosh

# Connect to Redis container
docker exec -it backend_redis_1 redis-cli
```

### Development vs Production

#### Development Mode
```bash
# Use development docker-compose file
docker-compose -f docker-compose.dev.yml up -d
```

#### Production Mode
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoring and Logs

#### View Application Logs
```bash
# Real-time logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Logs with timestamps
docker-compose logs -t app
```

#### Performance Monitoring
```bash
# Check resource usage
docker stats

# Check specific container resources
docker stats backend_app_1
```

### Troubleshooting

#### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   netstat -ano | findstr :3000
   
   # Kill process if needed
   taskkill /PID <PID_NUMBER> /F
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Redis Connection Issues**
   ```bash
   # Check Redis logs
   docker-compose logs redis
   
   # Test Redis connection
   docker exec -it backend_redis_1 redis-cli ping
   ```

4. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Rebuild the application
   docker-compose build --no-cache app
   docker-compose up -d
   ```

### Data Persistence

#### Database Backups
```bash
# Create MongoDB backup
docker exec backend_mongodb_1 mongodump --out /backup

# Copy backup from container
docker cp backend_mongodb_1:/backup ./mongodb-backup
```

#### Volume Management
```bash
# List Docker volumes
docker volume ls

# Inspect volume
docker volume inspect backend_mongodb_data

# Remove unused volumes
docker volume prune
```

### Security Considerations

#### Production Security Checklist
- [ ] Change default JWT secret
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Configure Redis password
- [ ] Use HTTPS in production
- [ ] Implement proper firewall rules
- [ ] Regular security updates

#### Network Security
```bash
# Create custom network for isolation
docker network create payments-secure-network

# Use the custom network in docker-compose.yml
```

### Scaling

#### Horizontal Scaling
```bash
# Scale the application to 3 instances
docker-compose up -d --scale app=3

# Use load balancer (nginx) for multiple instances
```

#### Resource Limits
Add resource limits to docker-compose.yml:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### CI/CD Integration

#### GitHub Actions Example
```yaml
name: Deploy with Docker

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and Deploy
      run: |
        docker-compose build
        docker-compose up -d
```

### Useful Docker Commands

#### Container Management
```bash
# List running containers
docker ps

# Stop specific container
docker stop backend_app_1

# Remove container
docker rm backend_app_1

# Execute command in container
docker exec -it backend_app_1 /bin/sh
```

#### Image Management
```bash
# List images
docker images

# Remove unused images
docker image prune

# Build specific service
docker-compose build app

# Pull latest images
docker-compose pull
```

#### System Cleanup
```bash
# Clean up everything
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused networks
docker network prune
```

## Testing with Docker

### Run Error Scenario Tests
```bash
# Ensure application is running
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run error scenario tests
./test-error-scenarios.ps1

# Run comprehensive tests
./test-all-endpoints.ps1
```

### Performance Testing
```bash
# Run load tests with Docker
docker run --rm -i loadimpact/k6 run - < /dev/stdin <<EOF
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let response = http.get('http://host.docker.internal:3000/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
EOF
```

## Conclusion

This Docker setup provides:
- **Easy deployment** with single command
- **Service isolation** with containerization
- **Scalability** with compose scaling
- **Development parity** between local and production
- **Monitoring** and logging capabilities
- **Data persistence** with named volumes

Your Payments Without Borders application is now ready for containerized deployment! 🚀
