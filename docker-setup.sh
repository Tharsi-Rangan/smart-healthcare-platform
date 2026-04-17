#!/bin/bash

# Smart Healthcare Platform - Docker Setup and Management Script
# Usage: ./docker-setup.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed: $(docker --version)"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed: $(docker-compose --version)"
    
    # Check disk space
    AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
    REQUIRED_SPACE=$((10 * 1024 * 1024)) # 10GB in KB
    
    if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
        print_error "Not enough disk space. Required: 10GB, Available: $((AVAILABLE_SPACE / 1024 / 1024))GB"
        exit 1
    fi
    print_success "Sufficient disk space available: $((AVAILABLE_SPACE / 1024 / 1024))GB"
}

setup_env() {
    print_header "Setting up Environment"
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_info "Please edit .env with your configuration"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
}

build_images() {
    print_header "Building Docker Images"
    docker-compose build --no-cache
    print_success "All images built successfully"
}

start_services() {
    print_header "Starting Services"
    docker-compose up -d
    print_success "Services started"
}

stop_services() {
    print_header "Stopping Services"
    docker-compose stop
    print_success "Services stopped"
}

restart_services() {
    print_header "Restarting Services"
    docker-compose restart
    print_success "Services restarted"
}

view_logs() {
    print_header "Viewing Logs"
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

status() {
    print_header "Service Status"
    docker-compose ps
}

cleanup() {
    print_header "Cleaning Up"
    read -p "This will remove all containers and volumes. Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        print_success "All containers and volumes removed"
    else
        print_info "Cleanup cancelled"
    fi
}

test_connectivity() {
    print_header "Testing Service Connectivity"
    
    print_info "Testing API Gateway..."
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        print_success "API Gateway is accessible"
    else
        print_error "API Gateway is not accessible"
    fi
    
    print_info "Testing MongoDB..."
    if docker exec smart-healthcare-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is accessible"
    else
        print_error "MongoDB is not accessible"
    fi
    
    print_info "Testing Frontend..."
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
    fi
}

rebuild_service() {
    if [ -z "$1" ]; then
        print_error "Service name required"
        echo "Usage: ./docker-setup.sh rebuild [service-name]"
        exit 1
    fi
    
    print_header "Rebuilding $1 Service"
    docker-compose up -d --build "$1"
    print_success "$1 service rebuilt and restarted"
}

full_setup() {
    print_header "Smart Healthcare Platform - Full Setup"
    check_prerequisites
    setup_env
    build_images
    start_services
    print_info "Waiting for services to be ready..."
    sleep 10
    test_connectivity
    print_header "Setup Complete!"
    print_info "API Gateway: http://localhost:5000"
    print_info "Frontend: http://localhost:5173"
    print_info "MongoDB: mongodb://localhost:27017"
}

show_help() {
    cat << EOF
Smart Healthcare Platform - Docker Setup Script

Usage: ./docker-setup.sh [command]

Commands:
  full-setup          Complete setup from scratch
  check               Check prerequisites
  build               Build all Docker images
  start               Start all services
  stop                Stop all services
  restart             Restart all services
  status              Show service status
  logs                View logs (optionally: [service-name])
  test                Test service connectivity
  rebuild [service]   Rebuild specific service
  clean               Remove all containers and volumes
  help                Show this help message

Examples:
  ./docker-setup.sh full-setup
  ./docker-setup.sh logs api-gateway
  ./docker-setup.sh rebuild auth-service

EOF
}

# Main script
case "${1:-help}" in
    full-setup)
        full_setup
        ;;
    check)
        check_prerequisites
        ;;
    build)
        build_images
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        status
        ;;
    logs)
        view_logs "$2"
        ;;
    test)
        test_connectivity
        ;;
    rebuild)
        rebuild_service "$2"
        ;;
    clean)
        cleanup
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
