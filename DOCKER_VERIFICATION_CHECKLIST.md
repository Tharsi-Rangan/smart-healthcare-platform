# Docker Setup Verification Checklist

Complete this checklist to verify your Docker setup is ready for use.

## Prerequisites ✓
- [ ] Docker installed and running
- [ ] Docker Compose installed (version 1.29+)
- [ ] At least 4GB RAM allocated to Docker
- [ ] 10GB free disk space
- [ ] .env file created (copied from .env.example)

## Files Created ✓
- [ ] docker-compose.yml updated with all 9 services
- [ ] docker-compose.prod.yml created
- [ ] api-gateway/Dockerfile created
- [ ] patient-service/Dockerfile created
- [ ] .env file exists with configuration
- [ ] .dockerignore file exists
- [ ] DOCKER_SETUP.md documentation exists
- [ ] DOCKER_HEALTH_CHECK.md documentation exists
- [ ] docker-setup.sh script exists (Linux/Mac)
- [ ] docker-setup.bat script exists (Windows)

## Build Verification ✓

### Check Prerequisites
```bash
docker --version
docker-compose --version
```
- [ ] Docker version 20.10+
- [ ] Docker Compose version 1.29+

### Build All Images
```bash
docker-compose build
```
- [ ] All images build without errors
- [ ] No "failed" messages in output
- [ ] Includes these services:
  - [ ] mongodb
  - [ ] api-gateway
  - [ ] auth-service
  - [ ] patient-service
  - [ ] appointment-service
  - [ ] consultation-service
  - [ ] payment-service
  - [ ] doctor-service
  - [ ] symptom-checker-service
  - [ ] notification-service
  - [ ] frontend

## Service Startup ✓

### Start All Services
```bash
docker-compose up -d
```

### Verify Services Are Running
```bash
docker-compose ps
```
- [ ] All 11 containers show "Up" status
- [ ] No containers in "Exited" state
- [ ] All ports mapped correctly:
  - [ ] mongodb:27017
  - [ ] api-gateway:5000
  - [ ] auth-service:5001
  - [ ] patient-service:5002
  - [ ] appointment-service:5003
  - [ ] consultation-service:5004
  - [ ] payment-service:5005
  - [ ] doctor-service:5006
  - [ ] symptom-checker-service:5007
  - [ ] notification-service:5008
  - [ ] frontend:5173

## Network Verification ✓

### Check Network Creation
```bash
docker network ls | grep smart-healthcare
docker network inspect smart-healthcare-network
```
- [ ] Network "smart-healthcare-network" exists
- [ ] All 11 containers are connected to network
- [ ] Network driver is "bridge"

### Test Service-to-Service Communication
```bash
docker exec smart-healthcare-api-gateway curl http://auth-service:5001/api/health
docker exec smart-healthcare-appointment curl http://doctor-service:5006/api/health
```
- [ ] Services can communicate via network names
- [ ] No "connection refused" errors

## Database Verification ✓

### Check MongoDB Is Running
```bash
docker-compose logs mongodb | tail -20
```
- [ ] No error messages
- [ ] Shows "waiting for connections" or similar

### Test MongoDB Connection
```bash
docker exec smart-healthcare-mongodb mongosh --eval "db.adminCommand('ping')"
```
- [ ] Returns: { ok: 1 }
- [ ] No connection errors

### Verify MongoDB Volume
```bash
docker volume ls | grep mongodb_data
docker exec smart-healthcare-mongodb du -sh /data/db
```
- [ ] mongodb_data volume exists
- [ ] Can read database size

## Service Health Checks ✓

### Windows
```bash
docker-setup.bat test
```

### Linux/Mac
```bash
./docker-setup.sh test
```

Verify all services report "accessible":
- [ ] API Gateway accessible
- [ ] MongoDB accessible
- [ ] Frontend accessible

## Frontend Verification ✓

### Access Frontend
```bash
# Open in browser
http://localhost:5173
```
- [ ] Page loads without 404 errors
- [ ] No console errors in browser dev tools
- [ ] Cyan/sky color theme visible

### Test API Connection
Check browser console for fetch errors:
```javascript
// In browser console, test:
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('API Status:', d))
```
- [ ] API responds successfully
- [ ] No CORS errors

## API Gateway Verification ✓

### Test API Gateway
```bash
curl http://localhost:5000/api/health
```
- [ ] Returns health check response
- [ ] HTTP status 200

### Test Service Routing
```bash
curl http://localhost:5000/api/auth/health
curl http://localhost:5000/api/patient/health
curl http://localhost:5000/api/appointments/health
```
- [ ] Routes to individual services work
- [ ] All return successful responses

## Environment Configuration ✓

### Verify Environment Variables
```bash
docker exec smart-healthcare-api-gateway env | grep -i jwt
docker exec smart-healthcare-auth env | grep mongodb
docker exec smart-healthcare-notification env | grep smtp
```
- [ ] JWT_SECRET is set (not empty)
- [ ] MONGODB_URI points to mongodb:27017
- [ ] Service URLs point to correct containers

### Check Sensitive Data (Security)
```bash
cat .env | grep -i secret
cat .env | grep -i key
```
- [ ] JWT_SECRET values are set
- [ ] Stripe keys are configured
- [ ] Not using default/example values

## Volume Verification ✓

### Check All Volumes
```bash
docker volume ls | grep smart-healthcare
```
- [ ] mongodb_data volume exists
- [ ] Volume can be inspected

### Check Uploads Directories
```bash
docker exec smart-healthcare-patient ls -la /app/uploads
docker exec smart-healthcare-doctor ls -la /app/uploads
```
- [ ] Directories exist and are writable

## Log Verification ✓

### Check for Startup Errors
```bash
docker-compose logs | grep -i error
```
- [ ] No critical errors in logs
- [ ] No authentication failures
- [ ] No connection refused messages

### Check Individual Service Logs
```bash
docker-compose logs api-gateway | tail -20
docker-compose logs auth-service | tail -20
```
- [ ] Services starting normally
- [ ] No repeated error patterns

## Performance Verification ✓

### Check Resource Usage
```bash
docker stats --no-stream
```
- [ ] Memory usage reasonable (< 2GB total)
- [ ] CPU usage < 50% at idle
- [ ] No memory leaks (steady usage)

### Check Disk Space
```bash
docker system df
```
- [ ] Total disk space < 10GB
- [ ] Unused images listed (can be cleaned if needed)

## Docker Compose File Verification ✓

### Syntax Check
```bash
docker-compose config > /dev/null && echo "Valid"
```
- [ ] docker-compose.yml syntax is valid
- [ ] No parsing errors
- [ ] Can be displayed with `docker-compose config`

### Service Definitions
```bash
docker-compose config | grep -A5 "services:"
```
Verify all services present:
- [ ] mongodb
- [ ] api-gateway
- [ ] auth-service
- [ ] patient-service
- [ ] appointment-service
- [ ] consultation-service
- [ ] payment-service
- [ ] doctor-service
- [ ] symptom-checker-service
- [ ] notification-service
- [ ] frontend

## Cleanup and Persistence ✓

### Test Stop/Restart
```bash
docker-compose stop
docker-compose start
```
- [ ] All services stop gracefully
- [ ] All services restart successfully
- [ ] MongoDB data persists after restart

### Verify MongoDB Data Persistence
```bash
# Before stopping, check data exists
docker exec smart-healthcare-mongodb mongosh --eval "db.test.insertOne({check: 'data'})"
docker-compose stop
docker-compose start
docker exec smart-healthcare-mongodb mongosh --eval "db.test.findOne()"
```
- [ ] Data exists after restart
- [ ] Persistence working correctly

## Development Workflow ✓

### Test Hot Reload
```bash
# Edit a service file (e.g., api-gateway/src/server.js)
# Change should be reflected in container within seconds
docker-compose logs -f api-gateway
```
- [ ] File changes detected by container
- [ ] Service auto-reloads
- [ ] No manual rebuild needed

### Test Rebuild
```bash
docker-compose up -d --build api-gateway
```
- [ ] Service rebuilds without errors
- [ ] Service restarts successfully
- [ ] Other services unaffected

## Security Verification ✓

### Check Secrets Are Protected
```bash
grep -r "pk_test\|sk_test\|password" .env
```
- [ ] .env file contains all secrets
- [ ] .env is in .gitignore
- [ ] Secrets not hardcoded in Dockerfiles

### Verify Network Isolation
```bash
docker network inspect smart-healthcare-network | grep Containers
```
- [ ] Only expected containers on network
- [ ] Services isolated from host network

### Check Port Exposure
```bash
docker-compose ps | grep PORTS
```
- [ ] Only necessary ports exposed
- [ ] 5000 (API) and 5173 (Frontend) publicly accessible
- [ ] Database port (27017) not exposed

## Documentation Verification ✓

- [ ] DOCKER_SETUP.md readable and comprehensive
- [ ] DOCKER_HEALTH_CHECK.md covers troubleshooting
- [ ] DOCKER_QUICK_START.md is clear
- [ ] docker-setup.sh is executable (Linux/Mac)
- [ ] docker-setup.bat is executable (Windows)

## Final System Check ✓

### Run Complete System Test
```bash
# Windows
docker-setup.bat test

# Linux/Mac
./docker-setup.sh test
```

Expected results:
- [ ] ✓ API Gateway is accessible
- [ ] ✓ MongoDB is accessible
- [ ] ✓ Frontend is accessible

### Full Service Test
```bash
curl -X GET http://localhost:5000/api/health && echo ""
curl -X GET http://localhost:5173/index.html -I | head -1
```
- [ ] API Gateway responds
- [ ] Frontend responds

## Troubleshooting Notes

If any checks fail:
1. Check logs: `docker-compose logs [service-name]`
2. Verify .env configuration: `cat .env`
3. Check network: `docker network inspect smart-healthcare-network`
4. Rebuild problematic service: `docker-compose up -d --build [service-name]`
5. See DOCKER_HEALTH_CHECK.md for detailed troubleshooting

## Sign-Off

When all checks are complete:

- [ ] Docker setup is fully verified
- [ ] All services are running and healthy
- [ ] Services can communicate with each other
- [ ] Frontend is accessible
- [ ] Database is persistent
- [ ] Environment variables are configured
- [ ] Security measures are in place
- [ ] Ready for development/deployment

**Date Completed:** _______________

**System Status:** ✓ READY FOR PRODUCTION / DEVELOPMENT
