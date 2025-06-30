# Docker Setup and Testing Guide - Payments Without Borders

## Overview
This guide provides comprehensive instructions for setting up and testing the Payments Without Borders API using Docker Desktop on Windows.

## Prerequisites
1. ✅ Docker Desktop installed and running on Windows
2. ✅ PowerShell or Command Prompt
3. ✅ Git (for version control)

## Docker Setup

### 1. Build and Start Services

```powershell
# Navigate to the project directory
cd "c:\Users\laxmi\OneDrive\Documents\pay_hack\backend"

# Build and start all services using Docker Compose
docker-compose up --build
```

### 2. Alternative Development Setup (Background Mode)

```powershell
# Start services in the background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Individual Service Management

```powershell
# Start specific services
docker-compose up mongodb redis

# Rebuild specific service
docker-compose build app
docker-compose up app

# View service status
docker-compose ps
```

## Docker Services Configuration

### Main Application (app)
- **Port:** 3000
- **Environment:** Development with Docker-specific settings
- **Database:** MongoDB container
- **Cache:** Redis container

### MongoDB (mongodb)
- **Port:** 27017
- **Database:** payments_without_borders
- **Data:** Persistent volume (mongodb_data)

### Redis (redis)
- **Port:** 6379
- **Data:** Persistent volume (redis_data)

### Mojaloop Simulator (mojaloop-simulator)
- **Ports:** 3001 (API), 3002 (UI)
- **Purpose:** Mock Mojaloop hub for development

## Testing with Docker

### 1. Health Check (Docker)
```powershell
# Test API health
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

### 2. Complete Error Scenario Testing (Docker)
```powershell
# Run comprehensive tests against Docker containers
./test-error-scenarios.ps1
```

### 3. Docker-Specific Testing Script

```powershell
# Docker Test Script
Write-Host "=== DOCKER CONTAINER TESTING ===" -ForegroundColor Blue

# Test 1: Health Check
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "✅ Health Check: $($health.status)" -ForegroundColor Green
    Write-Host "   Database: $($health.services.database)" -ForegroundColor Cyan
    Write-Host "   Redis: $($health.services.redis)" -ForegroundColor Cyan
    Write-Host "   Mojaloop: $($health.services.mojaloop)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Register New User
$registerBody = @{
    email = "dockertest$(Get-Random)@example.com"
    password = "DockerTest123!"
    firstName = "Docker"
    lastName = "Test"
    phoneNumber = "+1234567890"
    countryCode = "US"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.data.token
    $headers = @{ "Authorization" = "Bearer $token" }
    Write-Host "✅ User Registration: SUCCESS" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.data.user.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ User Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Cross-Border Transfer (Multiple Currencies)
$currencyTests = @(
    @{ from = "USD"; to = "EUR"; amount = 100 },
    @{ from = "EUR"; to = "GBP"; amount = 250 },
    @{ from = "GBP"; to = "JPY"; amount = 500 }
)

foreach ($test in $currencyTests) {
    $transferBody = @{
        receiverId = "docker_test_$(Get-Random)"
        amount = $test.amount
        sourceCurrency = $test.from
        targetCurrency = $test.to
        receiverName = "Docker Test Recipient"
        receiverPhone = "+1987654321"
        description = "Docker test: $($test.from) to $($test.to)"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/cross-border/transfers" -Method POST -Body $transferBody -ContentType "application/json" -Headers $headers
        Write-Host "✅ Transfer $($test.from) → $($test.to): SUCCESS" -ForegroundColor Green
        Write-Host "   Transfer ID: $($response.data.transferId)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Transfer $($test.from) → $($test.to): FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Amount Edge Cases
$amountTests = @(0.01, 1000, 25000, 99999)

foreach ($amount in $amountTests) {
    $transferBody = @{
        receiverId = "docker_amount_test_$(Get-Random)"
        amount = $amount
        sourceCurrency = "USD"
        targetCurrency = "EUR"
        receiverName = "Docker Amount Test"
        receiverPhone = "+1987654321"
        description = "Docker amount test: `$$amount"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/cross-border/transfers" -Method POST -Body $transferBody -ContentType "application/json" -Headers $headers
        Write-Host "✅ Amount `$$amount: SUCCESS" -ForegroundColor Green
    } catch {
        Write-Host "❌ Amount `$$amount: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== DOCKER TESTING COMPLETE ===" -ForegroundColor Blue
Write-Host "All Docker container tests have been executed." -ForegroundColor Yellow
```

## Docker Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Stop the process if needed
taskkill /F /PID <process_id>
```

#### 2. Database Connection Issues
```powershell
# Check MongoDB container logs
docker-compose logs mongodb

# Restart MongoDB container
docker-compose restart mongodb
```

#### 3. Redis Connection Issues
```powershell
# Check Redis container logs
docker-compose logs redis

# Restart Redis container
docker-compose restart redis
```

#### 4. Container Build Issues
```powershell
# Clean build (no cache)
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
```

#### 5. Environment Variable Issues
```powershell
# Check if .env.docker file exists and has correct values
Get-Content .env.docker

# Restart app container with updated environment
docker-compose restart app
```

### Docker Commands Reference

```powershell
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs <container_name>

# Execute command in running container
docker exec -it payments-without-borders-app-1 /bin/sh

# View container resource usage
docker stats

# Remove unused containers, networks, images
docker system prune

# Remove specific container
docker rm <container_name>

# Remove specific image
docker rmi <image_name>

# View Docker volumes
docker volume ls

# Remove Docker volume
docker volume rm <volume_name>
```

## Performance Testing with Docker

### Load Testing Script
```powershell
# Load Test with Docker
$concurrent = 10
$requests = 100

Write-Host "Starting load test: $concurrent concurrent users, $requests requests each" -ForegroundColor Yellow

# Simulate concurrent users
$jobs = @()
for ($i = 1; $i -le $concurrent; $i++) {
    $job = Start-Job -ScriptBlock {
        param($userIndex, $requestCount)
        
        # Register user
        $registerBody = @{
            email = "loadtest$userIndex@example.com"
            password = "LoadTest123!"
            firstName = "Load"
            lastName = "Test$userIndex"
            phoneNumber = "+123456789$userIndex"
            countryCode = "US"
            dateOfBirth = "1990-01-01"
        } | ConvertTo-Json
        
        $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
        $token = $registerResponse.data.token
        $headers = @{ "Authorization" = "Bearer $token" }
        
        # Make multiple transfer requests
        for ($j = 1; $j -le $requestCount; $j++) {
            $transferBody = @{
                receiverId = "loadtest_recipient_$userIndex_$j"
                amount = (Get-Random -Minimum 10 -Maximum 1000)
                sourceCurrency = "USD"
                targetCurrency = "EUR"
                receiverName = "Load Test Recipient"
                receiverPhone = "+1987654321"
                description = "Load test transfer $userIndex-$j"
            } | ConvertTo-Json
            
            try {
                Invoke-RestMethod -Uri "http://localhost:3000/api/cross-border/transfers" -Method POST -Body $transferBody -ContentType "application/json" -Headers $headers
                Write-Output "User $userIndex: Request $j completed"
            } catch {
                Write-Output "User $userIndex: Request $j failed - $($_.Exception.Message)"
            }
        }
    } -ArgumentList $i, $requests
    
    $jobs += $job
}

# Wait for all jobs to complete
$jobs | Wait-Job | Receive-Job

# Clean up
$jobs | Remove-Job

Write-Host "Load test completed!" -ForegroundColor Green
```

## Production Deployment Considerations

### 1. Environment Variables
- Update `.env.docker` with production values
- Use Docker secrets for sensitive data
- Configure proper database credentials

### 2. Security
- Enable HTTPS/TLS
- Configure proper CORS origins
- Implement rate limiting
- Use production JWT secrets

### 3. Scaling
- Use Docker Swarm or Kubernetes
- Configure load balancers
- Implement health checks
- Set up monitoring and alerting

### 4. Data Persistence
- Configure external database (MongoDB Atlas)
- Set up Redis cluster
- Implement backup strategies
- Configure log aggregation

## Docker Compose Commands Summary

```powershell
# Development
docker-compose up --build          # Build and start all services
docker-compose up -d               # Start in background
docker-compose down                # Stop all services
docker-compose restart             # Restart all services

# Monitoring
docker-compose logs -f             # Follow logs
docker-compose logs app            # App logs only
docker-compose ps                  # Service status
docker-compose top                 # Running processes

# Maintenance
docker-compose pull                # Pull latest images
docker-compose build --no-cache    # Clean rebuild
docker-compose down -v             # Stop and remove volumes
```

This Docker setup provides a complete, containerized development environment that mirrors production deployment while maintaining all the functionality tested in the comprehensive error scenarios.
