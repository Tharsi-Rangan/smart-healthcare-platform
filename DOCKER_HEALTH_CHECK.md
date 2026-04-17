# Docker Health Check and Verification Guide

## Quick Health Check

Run the Docker setup script with health check:

```bash
# Linux/Mac
./docker-setup.sh test

# Windows
docker-setup.bat test
```

## Manual Health Checks

### Check All Services Status

```bash
docker-compose ps
```

Expected output should show all services with status "Up" or "Running".

### Check Individual Service Health

#### API Gateway
```bash
curl -X GET http://localhost:5000/api/health
```

#### Auth Service
```bash
docker exec smart-healthcare-auth curl http://localhost:5001/api/health
```

#### Patient Service
```bash
docker exec smart-healthcare-patient curl http://localhost:5002/api/health
```

#### Appointment Service
```bash
docker exec smart-healthcare-appointment curl http://localhost:5003/api/health
```

#### Consultation Service
```bash
docker exec smart-healthcare-consultation curl http://localhost:5004/api/health
```

#### Payment Service
```bash
docker exec smart-healthcare-payment curl http://localhost:5005/api/health
```

#### Doctor Service
```bash
docker exec smart-healthcare-doctor curl http://localhost:5006/api/health
```

#### Symptom Checker Service
```bash
docker exec smart-healthcare-symptom-checker curl http://localhost:5007/api/health
```

#### Notification Service
```bash
docker exec smart-healthcare-notification curl http://localhost:5008/api/health
```

#### MongoDB
```bash
docker exec smart-healthcare-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Check Service Logs for Errors

```bash
# View last 50 lines of logs
docker-compose logs --tail=50 api-gateway

# View real-time logs
docker-compose logs -f api-gateway

# View logs since last 10 minutes
docker-compose logs --since 10m api-gateway
```

### Check Network Connectivity

```bash
# Verify all services are on the same network
docker network inspect smart-healthcare-network

# Test inter-service communication
docker exec smart-healthcare-api-gateway curl http://auth-service:5001/api/health
docker exec smart-healthcare-appointment curl http://doctor-service:5006/api/health
```

## Troubleshooting Common Issues

### Service Not Starting

1. **Check logs:**
   ```bash
   docker-compose logs [service-name]
   ```

2. **Verify environment variables:**
   ```bash
   docker exec smart-healthcare-api-gateway env | grep -i mongo
   ```

3. **Restart service:**
   ```bash
   docker-compose restart [service-name]
   ```

4. **Rebuild and restart:**
   ```bash
   docker-compose up -d --build [service-name]
   ```

### Port Already in Use

```bash
# Find what's using the port (Windows)
netstat -ano | findstr :5000

# Find what's using the port (Linux/Mac)
lsof -i :5000

# Kill the process
kill -9 [PID]
```

### MongoDB Connection Issues

```bash
# Test MongoDB connection
docker exec smart-healthcare-mongodb mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker-compose logs mongodb

# Verify MongoDB volume
docker volume ls | grep mongodb

# Check data in database
docker exec smart-healthcare-mongodb mongosh --eval "show databases"
```

### API Gateway Can't Reach Services

```bash
# Test from API Gateway to other services
docker exec smart-healthcare-api-gateway curl http://auth-service:5001

# If this fails, check:
# 1. Service names in docker-compose.yml
# 2. Network configuration
# 3. Port mappings
```

### Frontend Can't Connect to API

Check frontend logs:
```bash
docker-compose logs frontend
```

Common issues:
- `VITE_API_BASE_URL` pointing to wrong address
- API Gateway not running or accessible
- CORS issues (check API Gateway configuration)

## Performance Monitoring

### Check Resource Usage

```bash
# Real-time resource usage for all containers
docker stats

# Specific container
docker stats smart-healthcare-api-gateway

# Memory usage summary
docker stats --no-stream
```

### Database Size

```bash
# Check MongoDB size
docker exec smart-healthcare-mongodb du -sh /data/db

# Check specific database size
docker exec smart-healthcare-mongodb mongosh --eval "db.stats()"
```

## Backup and Recovery

### Backup MongoDB

```bash
# Create backup directory
mkdir ./backup

# Backup all databases
docker exec smart-healthcare-mongodb mongodump --out /backup
docker cp smart-healthcare-mongodb:/backup ./backup

# Or use mongosh for specific collection
docker exec smart-healthcare-mongodb mongosh --eval "db.collection.find().forEach(p => print(JSON.stringify(p)))" > backup.json
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ./backup smart-healthcare-mongodb:/restore

# Restore databases
docker exec smart-healthcare-mongodb mongorestore /restore

# Or restore specific collection
docker exec smart-healthcare-mongodb mongosh << EOF
db.collection.deleteMany({})
db.collection.insertMany([...data...])
EOF
```

## Cleanup and Maintenance

### Remove Unused Images

```bash
# List unused images
docker image ls -f dangling=true

# Remove unused images
docker image prune -f

# Remove all unused resources
docker system prune -f
```

### Clean Docker Cache

```bash
# Rebuild without cache
docker-compose build --no-cache

# Or for specific service
docker-compose build --no-cache api-gateway
```

### Check Disk Usage

```bash
# Docker disk usage
docker system df

# Check volume usage
docker volume ls
```

## Log Analysis

### Search for Errors

```bash
# Find errors in all logs
docker-compose logs | grep -i error

# Find errors in specific service
docker-compose logs api-gateway | grep -i error

# Find authentication errors
docker-compose logs | grep -i "auth\|unauthorized\|forbidden"
```

### Track Request Flow

```bash
# Follow API Gateway logs with timestamps
docker-compose logs --timestamps -f api-gateway

# Correlate with backend service
docker-compose logs --timestamps -f api-gateway auth-service
```

## Security Checks

### Verify Secrets Are Set

```bash
# Check if JWT secrets are configured
docker exec smart-healthcare-api-gateway env | grep JWT

# All should show values, not defaults
```

### Network Isolation

```bash
# Verify services are on isolated network
docker network inspect smart-healthcare-network

# Check that only necessary ports are exposed
docker-compose ps

# Ports 5000 and 5173 should be exposed, others not
```

### Volume Permissions

```bash
# Check uploads directory ownership
docker exec smart-healthcare-patient ls -la /app/uploads

# Fix permissions if needed
docker exec smart-healthcare-patient chmod 755 /app/uploads
```

## Performance Optimization

### Monitor Database Performance

```bash
# Check current operations
docker exec smart-healthcare-mongodb mongosh --eval "db.currentOp()"

# Check slow queries (if profiling enabled)
docker exec smart-healthcare-mongodb mongosh --eval "db.system.profile.find().pretty()"
```

### Optimize Images

```bash
# Check image sizes
docker images | grep smart-healthcare

# Rebuild with optimization
docker-compose build --compress api-gateway
```

### Connection Pool Monitoring

```bash
# Check active connections
docker exec smart-healthcare-api-gateway curl http://localhost:5000/api/connections

# Monitor from within container
docker exec smart-healthcare-mongodb mongosh --eval "db.serverStatus().connections"
```

## Automated Health Checks

### Setup Cron Job (Linux/Mac)

Create `health-check.sh`:
```bash
#!/bin/bash
cd /path/to/smart-healthcare-platform
docker-compose logs --tail=100 | grep -i error > health_report.txt
docker stats --no-stream >> health_report.txt
```

Add to crontab:
```bash
# Check health every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

### Setup Scheduled Task (Windows)

Create `health-check.bat` and schedule in Task Scheduler to run every 5 minutes.

## Alerting

### Monitor Service Crashes

```bash
# Check restart count
docker-compose ps | grep -v "Up"

# Setup alert on restart
docker events --filter 'type=container' --filter 'status=die' | while read event; do
    # Send alert/notification
    echo "Container died: $event"
done
```

### Monitor Disk Usage

```bash
# Alert if docker disk usage > 80%
USAGE=$(docker system df | grep "Local Volumes" | awk '{print $NF}' | sed 's/%//')
if [ "$USAGE" -gt 80 ]; then
    echo "Docker disk usage is high: $USAGE%"
fi
```
