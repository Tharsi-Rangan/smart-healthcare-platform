@echo off
REM Smart Healthcare Platform - Docker Setup and Management Script (Windows)
REM Usage: docker-setup.bat [command]

setlocal enabledelayedexpansion

REM Colors using ANSI codes (Windows 10+)
set "BLUE=[34m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "NC=[0m"

REM Functions
:print_header
echo.
echo %BLUE%========================================%NC%
echo %BLUE%%~1%NC%
echo %BLUE%========================================%NC%
exit /b

:print_success
echo %GREEN%[+] %~1%NC%
exit /b

:print_error
echo %RED%[-] %~1%NC%
exit /b

:print_info
echo %YELLOW%[*] %~1%NC%
exit /b

:check_prerequisites
call :print_header "Checking Prerequisites"

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed"
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do (
    call :print_success "Docker is installed: %%i"
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose is not installed"
    exit /b 1
)
for /f "tokens=*" %%i in ('docker-compose --version') do (
    call :print_success "Docker Compose is installed: %%i"
)

call :print_success "All prerequisites met"
exit /b 0

:setup_env
call :print_header "Setting up Environment"

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        call :print_success "Created .env file from .env.example"
        call :print_info "Please edit .env with your configuration"
    ) else (
        call :print_error ".env.example file not found"
        exit /b 1
    )
) else (
    call :print_success ".env file already exists"
)
exit /b 0

:build_images
call :print_header "Building Docker Images"
docker-compose build --no-cache
if errorlevel 1 (
    call :print_error "Build failed"
    exit /b 1
)
call :print_success "All images built successfully"
exit /b 0

:start_services
call :print_header "Starting Services"
docker-compose up -d
if errorlevel 1 (
    call :print_error "Failed to start services"
    exit /b 1
)
call :print_success "Services started"
exit /b 0

:stop_services
call :print_header "Stopping Services"
docker-compose stop
if errorlevel 1 (
    call :print_error "Failed to stop services"
    exit /b 1
)
call :print_success "Services stopped"
exit /b 0

:restart_services
call :print_header "Restarting Services"
docker-compose restart
if errorlevel 1 (
    call :print_error "Failed to restart services"
    exit /b 1
)
call :print_success "Services restarted"
exit /b 0

:view_logs
call :print_header "Viewing Logs"
if "%~1"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %~1
)
exit /b 0

:status
call :print_header "Service Status"
docker-compose ps
exit /b 0

:cleanup
call :print_header "Cleaning Up"
setlocal enabledelayedexpansion
set /p "confirm=This will remove all containers and volumes. Continue? (y/n): "
if /i "!confirm!"=="y" (
    docker-compose down -v
    if errorlevel 1 (
        call :print_error "Cleanup failed"
        exit /b 1
    )
    call :print_success "All containers and volumes removed"
) else (
    call :print_info "Cleanup cancelled"
)
endlocal
exit /b 0

:test_connectivity
call :print_header "Testing Service Connectivity"

call :print_info "Testing API Gateway..."
timeout /t 1 /nobreak >nul
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    call :print_error "API Gateway is not accessible"
) else (
    call :print_success "API Gateway is accessible"
)

call :print_info "Testing MongoDB..."
docker exec smart-healthcare-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if errorlevel 1 (
    call :print_error "MongoDB is not accessible"
) else (
    call :print_success "MongoDB is accessible"
)

call :print_info "Testing Frontend..."
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    call :print_error "Frontend is not accessible"
) else (
    call :print_success "Frontend is accessible"
)
exit /b 0

:rebuild_service
if "%~1"=="" (
    call :print_error "Service name required"
    echo Usage: docker-setup.bat rebuild [service-name]
    exit /b 1
)

call :print_header "Rebuilding %~1 Service"
docker-compose up -d --build %~1
if errorlevel 1 (
    call :print_error "Rebuild failed"
    exit /b 1
)
call :print_success "%~1 service rebuilt and restarted"
exit /b 0

:full_setup
call :print_header "Smart Healthcare Platform - Full Setup"
call :check_prerequisites
if errorlevel 1 exit /b 1

call :setup_env
if errorlevel 1 exit /b 1

call :build_images
if errorlevel 1 exit /b 1

call :start_services
if errorlevel 1 exit /b 1

call :print_info "Waiting for services to be ready..."
timeout /t 10 /nobreak >nul

call :test_connectivity

call :print_header "Setup Complete!"
call :print_info "API Gateway: http://localhost:5000"
call :print_info "Frontend: http://localhost:5173"
call :print_info "MongoDB: mongodb://localhost:27017"
exit /b 0

:show_help
echo.
echo Smart Healthcare Platform - Docker Setup Script
echo.
echo Usage: docker-setup.bat [command]
echo.
echo Commands:
echo   full-setup          Complete setup from scratch
echo   check               Check prerequisites
echo   build               Build all Docker images
echo   start               Start all services
echo   stop                Stop all services
echo   restart             Restart all services
echo   status              Show service status
echo   logs                View logs [optional: service-name]
echo   test                Test service connectivity
echo   rebuild [service]   Rebuild specific service
echo   clean               Remove all containers and volumes
echo   help                Show this help message
echo.
echo Examples:
echo   docker-setup.bat full-setup
echo   docker-setup.bat logs api-gateway
echo   docker-setup.bat rebuild auth-service
echo.
exit /b 0

REM Main script
if "%~1"=="" (
    call :show_help
    exit /b 0
)

if /i "%~1"=="full-setup" (
    call :full_setup
) else if /i "%~1"=="check" (
    call :check_prerequisites
) else if /i "%~1"=="build" (
    call :build_images
) else if /i "%~1"=="start" (
    call :start_services
) else if /i "%~1"=="stop" (
    call :stop_services
) else if /i "%~1"=="restart" (
    call :restart_services
) else if /i "%~1"=="status" (
    call :status
) else if /i "%~1"=="logs" (
    call :view_logs %2
) else if /i "%~1"=="test" (
    call :test_connectivity
) else if /i "%~1"=="rebuild" (
    call :rebuild_service %2
) else if /i "%~1"=="clean" (
    call :cleanup
) else if /i "%~1"=="help" (
    call :show_help
) else (
    call :print_error "Unknown command: %~1"
    call :show_help
    exit /b 1
)

exit /b %errorlevel%
