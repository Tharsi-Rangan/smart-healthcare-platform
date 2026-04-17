# Docker Setup Guide for Smart Healthcare Platform

This guide explains how to build and run the Smart Healthcare Platform using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)
- At least 4GB of RAM allocated to Docker
- 10GB of disk space for images and volumes

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd smart-healthcare-platform

# Create environment file from example
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 2. Build and Start All Services

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Start specific service
docker-compose up -d api-gateway

# Restart services
docker-compose restart
```

### 3. Verify Services are Running

```bash
# Check service status
docker-compose ps

# Check specific service logs
docker-compose logs notification-service

# Test API Gateway
curl http://localhost:5000/api/health
```

### 4. Stop Services

```bash
# Stop all services (preserve data)
docker-compose stop

# Stop and remove containers (preserve volumes)
docker-compose down

# Stop, remove containers, and remove volumes
docker-compose down -v
```

## Service Architecture

### Running Services

| Service | Port | Container Name | URL |
|---------|------|-----------------|-----|
| MongoDB | 27017 | smart-healthcare-mongodb | mongodb://mongodb:27017 |
| API Gateway | 5000 | smart-healthcare-api-gateway | http://localhost:5000 |
| Auth Service | 5001 | smart-healthcare-auth | http://localhost:5001 |
| Patient Service | 5002 | smart-healthcare-patient | http://localhost:5002 |
| Appointment Service | 5003 | smart-healthcare-appointment | http://localhost:5003 |
| Consultation Service | 5004 | smart-healthcare-consultation | http://localhost:5004 |
| Payment Service | 5005 | smart-healthcare-payment | http://localhost:5005 |
| Doctor Service | 5006 | smart-healthcare-doctor | http://localhost:5006 |
| Symptom Checker | 5007 | smart-healthcare-symptom-checker | http://localhost:5007 |
| Notification Service | 5008 | smart-healthcare-notification | http://localhost:5008 |
| Frontend | 5173 | smart-healthcare-frontend | http://localhost:5173 |

## Accessing Services

### API Gateway (Main Entry Point)
```
http://localhost:5000
```

### Frontend Application
```
http://localhost:5173
```

### MongoDB
```
mongodb://localhost:27017/healthcare_db
```

### Service Logs

View logs for all services:
```bash
docker-compose logs
```

View logs for specific service:
```bash
docker-compose logs -f [service-name]
# Example: docker-compose logs -f api-gateway
```

Real-time logs with follow:
```bash
docker-compose logs -f --tail=100
```

## Development Workflow

### Making Changes

1. **Edit source code** - Services use volume mounts for live reload
2. **Changes are automatically reflected** - No rebuild needed for most cases
3. **If you modify dependencies** - Rebuild the service:

```bash
docker-compose up -d --build [service-name]
```

### Rebuild Specific Service

```bash
# Rebuild without removing other containers
docker-compose up -d --build api-gateway

# Rebuild all services
docker-compose up -d --build
```

## Database Management

### Access MongoDB

```bash
# Connect to MongoDB container
docker exec -it smart-healthcare-mongodb mongosh

# View databases
show databases

# Use healthcare_db
use healthcare_db

# View collections
show collections

# Query data
db.users.find().limit(5)
```

### Backup Database

```bash
# Backup all databases
docker exec smart-healthcare-mongodb mongodump --out /backup

# Copy backup to host
docker cp smart-healthcare-mongodb:/backup ./backup

# Restore database
docker cp ./backup smart-healthcare-mongodb:/restore
docker exec smart-healthcare-mongodb mongorestore /restore
```

## Environment Configuration

### Update Environment Variables

1. Edit `.env` file with your values
2. Restart containers:

```bash
docker-compose down
docker-compose up -d
```

### Important Configuration

```env
# Change JWT secrets in production
JWT_SECRET=change_this_secure_random_string

# Configure email service
SMTP_HOST=your-email-provider
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configure payment (Stripe)
STRIPE_PUBLIC_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx

# Frontend API URL
VITE_API_BASE_URL=http://api-gateway:5000
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Container Fails to Start

```bash
# Check logs
docker-compose logs [service-name]

# Verify environment variables
docker exec smart-healthcare-api-gateway env

# Restart service
docker-compose restart [service-name]
```

### Database Connection Issues

```bash
# Test MongoDB connection
docker exec smart-healthcare-mongodb mongosh --eval "db.adminCommand('ping')"

# Verify network
docker network inspect smart-healthcare-network
```

### Out of Disk Space

```bash
# Clean up unused images
docker system prune

# Remove all containers and volumes
docker-compose down -v

# Rebuild fresh
docker-compose build
```

## Production Deployment

### Before Going to Production

1. **Update all JWT secrets** in `.env` with secure random values
2. **Configure SMTP** with your email service
3. **Set up Stripe** account and keys
4. **Use MongoDB Atlas** or managed database instead of container
5. **Enable SSL/TLS** with reverse proxy (nginx/HAProxy)
6. **Set NODE_ENV=production** in all services
7. **Configure proper logging** and monitoring

### Production Docker Compose

Create `docker-compose.prod.yml` for production:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Scale Services

```bash
# Scale a service to multiple instances
docker-compose up -d --scale payment-service=3

# View replicas
docker-compose ps
```

## Health Checks

All services include health checks. Monitor them:

```bash
# View health status
docker-compose ps

# Check specific service health
docker exec smart-healthcare-api-gateway curl http://localhost:5000/api/health
```

## Useful Commands

```bash
# Get bash shell in container
docker exec -it smart-healthcare-api-gateway bash

# View resource usage
docker stats

# Clean up all stopped containers
docker container prune

# Remove all unused networks
docker network prune

# Inspect network
docker network inspect smart-healthcare-network
```

## Performance Optimization

### Increase Resources

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Enable Caching

Dockerfile optimizations are already applied for:
- Layer caching
- Alpine Linux base images (smaller)
- Production dependencies only
- Multi-stage builds (where applicable)

## Security Best Practices

1. **Change all default secrets** - Update JWT_SECRET, passwords
2. **Use .env files** - Never commit secrets
3. **Enable authentication** - All APIs require valid tokens
4. **Network isolation** - Services run on isolated network
5. **Regular updates** - Keep Docker and images updated
6. **Audit logs** - Monitor service logs regularly

## Support and Issues

For issues or questions:

1. Check service logs: `docker-compose logs [service-name]`
2. Verify environment: `cat .env`
3. Test connectivity: `docker exec -it [container] bash`
4. Review service configuration in `docker-compose.yml`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)
- [Node.js Best Practices](https://github.com/nodejs/docker-node)
