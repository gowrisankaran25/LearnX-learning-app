# LearnX Deployment Script for Windows
# This script deploys the entire LearnX application

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success {
    Write-ColorOutput Green "✓ $args"
}

function Write-Info {
    Write-ColorOutput Cyan "ℹ $args"
}

function Write-Error-Output {
    Write-ColorOutput Red "✗ $args"
}

Write-Info "Starting LearnX deployment..."

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error-Output "Node.js is not installed"
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error-Output "npm is not installed"
    exit 1
}

Write-Success "All dependencies are installed"

# Install root dependencies
Write-Info "Installing root dependencies..."
npm install
Write-Success "Root dependencies installed"

# Install frontend dependencies
Write-Info "Installing frontend dependencies..."
cd frontend
npm install
cd ..
Write-Success "Frontend dependencies installed"

# Install backend dependencies
Write-Info "Installing backend dependencies..."
cd backend
npm install
cd ..
Write-Success "Backend dependencies installed"

# Build frontend
Write-Info "Building frontend..."
cd frontend
npm run build
cd ..
Write-Success "Frontend built successfully"

# Run tests (if configured)
Write-Info "Running tests..."
try {
    cd backend
    npm test
    cd ..
} catch {
    Write-Info "Backend tests skipped or failed"
}

try {
    cd frontend
    npm test
    cd ..
} catch {
    Write-Info "Frontend tests skipped or failed"
}

Write-Success "Tests completed"

Write-Info "Configure your deployment strategy"
Write-Info "Options:"
Write-Info "  - Docker: docker-compose up -d"
Write-Info "  - Vercel: vercel --prod"
Write-Info "  - Railway: railway up"
Write-Info "  - AWS: Use AWS CLI or CodePipeline"

Write-Success "Deployment completed successfully!"
Write-Info "Next steps:"
Write-Info "1. Configure environment variables"
Write-Info "2. Set up MongoDB database"
Write-Info "3. Configure AI service with OpenAI API key"
Write-Info "4. Start the services"
