# Docker React Development Environment Starter
Write-Host "Starting Docker React Development Environment..." -ForegroundColor Green

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
docker-compose down

# Start development environment
Write-Host "Starting development environment..." -ForegroundColor Green
docker-compose up -d

# Wait for the service to be ready
Write-Host "Waiting for React dev server to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if service is running
$containerStatus = docker-compose ps -q react-dev
if ($containerStatus) {
    Write-Host "React development server is running!" -ForegroundColor Green
    Write-Host "Open your browser to: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "View logs with: docker-compose logs -f react-dev" -ForegroundColor Gray
    Write-Host "Stop with: docker-compose down" -ForegroundColor Gray
} else {
    Write-Host "Failed to start the development server" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs react-dev" -ForegroundColor Yellow
}
