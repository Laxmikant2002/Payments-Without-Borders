# Payments Without Borders - Quick Start Script for Windows
# Run this script in PowerShell to set up your development environment

Write-Host "🚀 Setting up Payments Without Borders development environment..." -ForegroundColor Green

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Blue
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if Kubernetes is enabled
Write-Host "Checking Kubernetes..." -ForegroundColor Yellow
try {
    kubectl version --client --short | Out-Null
    Write-Host "✅ Kubernetes client found" -ForegroundColor Green
} catch {
    Write-Host "⚠️ kubectl not found. Enable Kubernetes in Docker Desktop settings." -ForegroundColor Yellow
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please review and update as needed." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker services started successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "Checking service health..." -ForegroundColor Yellow

# Check MongoDB
try {
    $mongoResponse = Invoke-WebRequest -Uri "http://localhost:27017" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ MongoDB is accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️ MongoDB might still be starting up" -ForegroundColor Yellow
}

# Check Redis
Write-Host "✅ Redis should be running on port 6379" -ForegroundColor Green

# Check Mojaloop Simulator
try {
    $mojaloopResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Mojaloop Simulator is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Mojaloop Simulator might still be starting up" -ForegroundColor Yellow
}

# Display next steps
Write-Host "`n🎉 Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Start the development server: npm run dev" -ForegroundColor White
Write-Host "2. Open your browser to: http://localhost:3000" -ForegroundColor White
Write-Host "3. API documentation: http://localhost:3000/api-docs" -ForegroundColor White
Write-Host "4. Mojaloop Simulator: http://localhost:3001" -ForegroundColor White
Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "- View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "- Stop services: docker-compose down" -ForegroundColor White
Write-Host "- Restart services: docker-compose restart" -ForegroundColor White
Write-Host "`nFor detailed Mojaloop setup, see: docs/MOJALOOP_SETUP.md" -ForegroundColor Blue
Write-Host "`nHappy coding! 🚀" -ForegroundColor Green
