# Docker React Production Environment Starter
Write-Host "Building and Starting Docker React Production Environment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "Docker is available" -ForegroundColor Green
}
catch {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Build and start production environment
Write-Host "Building React application..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

Write-Host "Starting production environment..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d

# Wait for the service to be ready
Write-Host "Waiting for production server to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if service is running
$containerStatus = docker-compose -f docker-compose.prod.yml ps -q react-prod
if ($containerStatus) {
    Write-Host "React production server is running!" -ForegroundColor Green
    Write-Host "Open your browser to: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "Health check: http://localhost:8080/health" -ForegroundColor Gray
    Write-Host "View logs with: docker-compose -f docker-compose.prod.yml logs -f react-prod" -ForegroundColor Gray
    Write-Host "Stop with: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Gray
} else {
    Write-Host "Failed to start the production server" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose -f docker-compose.prod.yml logs react-prod" -ForegroundColor Yellow
}
