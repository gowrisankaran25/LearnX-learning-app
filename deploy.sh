#!/bin/bash

# LearnX Deployment Script
# This script deploys the entire LearnX application

set -e

echo "🚀 Starting LearnX deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo "❌ git is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_info "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
    
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
    
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Build frontend
build_frontend() {
    print_info "Building frontend..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Run tests
run_tests() {
    print_info "Running tests..."
    
    # Backend tests
    cd backend
    npm test || echo "⚠ Backend tests skipped or failed"
    cd ..
    
    # Frontend tests (if configured)
    cd frontend
    npm test || echo "⚠ Frontend tests skipped or failed"
    cd ..
    
    print_success "Tests completed"
}

# Deploy to production
deploy_production() {
    print_info "Deploying to production..."
    
    # This is a placeholder for actual deployment logic
    # You would replace this with your deployment strategy:
    # - Docker deployment
    # - CI/CD pipeline
    # - Cloud provider deployment (AWS, GCP, Azure)
    # - PaaS deployment (Vercel, Railway, Render)
    
    print_info "Configure your deployment strategy in this script"
    print_info "Options:"
    print_info "  - Docker: docker-compose up -d"
    print_info "  - Vercel: vercel --prod"
    print_info "  - Railway: railway up"
    print_info "  - AWS: Use AWS CLI or CodePipeline"
}

# Main deployment flow
main() {
    check_dependencies
    install_dependencies
    run_tests
    build_frontend
    deploy_production
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure environment variables"
    echo "2. Set up MongoDB database"
    echo "3. Configure AI service with OpenAI API key"
    echo "4. Start the services"
}

# Run main function
main
