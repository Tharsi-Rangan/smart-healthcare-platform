# Docker Troubleshooting Guide

## Common Issues and Solutions

### 1. Services Won't Start

#### Error: "docker-compose: command not found"
**Solution:** Install Docker Compose
- Windows: Download Docker Desktop (includes Compose)
- Linux: `sudo apt-get install docker-compose`
- Mac: Download Docker Desktop

#### Error: "Cannot connect to Docker daemon"
**Solution:**
- Windows: Start Docker Desktop
- Linux: `sudo systemctl start docker`
- Mac: Start Docker Desktop application
- Ensure Docker is running: `docker ps`

#### Error: "Service [name] exited with code 1"
**Solution:**
1. Check service logs: `docker-compose logs [service-name]`
2. Look for error messages in output
3. Common causes:
   - MONGODB_URI not set correctly
   - Port already in use
   - Missing environment variables

#### Error: "Port [port] is already allocated"
**Solution:**
```bash
# Windows: Find process using port
netstat -ano | findstr :5000

# Linux/Mac: Find process using port
lsof -i :5000

# Kill the process
kill -9 [PID]

# Or change port in docker-compose.yml
```

#### Error: "MongoDB fails to start"
**Solution:**
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify mongodb_data volume
docker volume ls | grep mongodb_data

# Remove and recreate volume
docker-compose down -v
docker-compose up -d mongodb
```

---

### 2. Network and Connectivity Issues

#### Error: "Cannot reach service from another container"
**Diagnosis:**
```bash
# Check network
docker network ls | grep smart-healthcare
docker network inspect smart-healthcare-network
```

**Solution:**
- Verify service name in connection string matches docker-compose.yml
- Use format: `http://[service-name]:[port]`
- Example: `http://auth-service:5001`
- Not: `http://localhost:5001` (wrong from other containers)

#### Error: "API Gateway can't reach auth-service"
**Solution:**
```bash
# Test from API Gateway container
docker exec smart-healthcare-api-gateway curl http://auth-service:5001

# If fails, check:
# 1. Service name spelling in docker-compose.yml
# 2. Port number is correct
# 3. Both services on same network
```

#### Error: "Frontend can't connect to API Gateway"
**Solution:**
```bash
# Check VITE_API_BASE_URL environment variable
docker exec smart-healthcare-frontend env | grep VITE_API

# Should show: http://api-gateway:5000
# If wrong, update docker-compose.yml
```

#### Error: "CORS errors in browser"
**Diagnosis:** Check browser console for:
```
Access to XMLHttpRequest at 'http://localhost:5000'
from origin 'http://localhost:5173' has been blocked
```

**Solution:**
1. Verify API Gateway has CORS enabled
2. Check CLIENT_URL in api-gateway environment
3. Ensure API Gateway is responding: `curl http://localhost:5000`
4. Check browser console for actual error details

---

### 3. Database Issues

#### Error: "MongoError: connect ECONNREFUSED 127.0.0.1:27017"
**Solution:**
```bash
# Check MongoDB is running
docker-compose ps | grep mongodb

# Should show "mongodb ... Up"
# If not, check logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

#### Error: "Failed to authenticate user"
**Solution:**
```bash
# Check database exists
docker exec smart-healthcare-mongodb mongosh --eval "show databases"

# Verify connection string
docker exec smart-healthcare-auth env | grep MONGODB_URI

# Should be: mongodb://mongodb:27017/auth_db
```

#### Error: "Timeout waiting for MongoDB"
**Solution:**
```bash
# Check MongoDB health
docker exec smart-healthcare-mongodb mongosh --eval "db.adminCommand('ping')"

# Increase MongoDB memory if on low-memory system
# Edit docker-compose.yml and add:
# deploy:
#   resources:
#     limits:
#       memory: 4G
```

#### Error: "MongoDB 'wiredTiger' cannot allocate memory"
**Solution:**
1. Increase Docker memory allocation (min 4GB)
2. Or reduce MongoDB cache in docker-compose.prod.yml
3. Check available system memory: `free -h` (Linux) or Task Manager (Windows)

#### Error: "Cannot write to /data/db"
**Solution:**
```bash
# Fix permissions
docker exec smart-healthcare-mongodb chmod -R 755 /data/db

# Or recreate volume
docker-compose down -v
docker-compose up -d mongodb
```

---

### 4. Build Issues

#### Error: "No space left on device"
**Solution:**
```bash
# Check disk space
df -h  # Linux/Mac
dir    # Windows

# Clean Docker
docker system prune -f
docker volume prune -f

# Or rebuild without cache
docker-compose build --no-cache
```

#### Error: "Cannot find module 'express'"
**Solution:**
```bash
# Ensure node_modules isn't in volume mount
# Check docker-compose.yml for:
# volumes:
#   - /app/node_modules  # This isolates node_modules

# Rebuild service
docker-compose up -d --build [service-name]
```

#### Error: "npm ERR! Cannot read properties of undefined"
**Solution:**
```bash
# Check package.json exists
docker exec smart-healthcare-api-gateway ls -la package.json

# Check package-lock.json
docker exec smart-healthcare-api-gateway ls -la package-lock.json

# Rebuild
docker-compose up -d --build [service-name]
```

#### Error: "Dockerfile syntax error"
**Solution:**
1. Check Dockerfile for syntax errors
2. Validate with: `docker build .`
3. Common issues:
   - Missing FROM statement
   - Invalid RUN command
   - Typo in instruction

---

### 5. Environment Variable Issues

#### Error: "undefined secret key" or similar
**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify variables are set
cat .env | grep JWT

# Reload environment
docker-compose down
docker-compose up -d
```

#### Error: "Service-to-service URL not working"
**Solution:**
```bash
# Check environment variable
docker exec smart-healthcare-api-gateway env | grep SERVICE_URL

# Should show: AUTH_SERVICE_URL=http://auth-service:5001
# Not: http://localhost:5001
```

#### Error: "Cannot find environment variable"
**Solution:**
1. Check .env file has the variable
2. Verify spelling matches docker-compose.yml
3. Rebuild the service:
   ```bash
   docker-compose up -d --build [service-name]
   ```
4. Verify it's set:
   ```bash
   docker exec [container] env | grep VARIABLE
   ```

---

### 6. Performance Issues

#### Issue: "Services running slowly"
**Diagnosis:**
```bash
# Check resource usage
docker stats

# Check logs for errors
docker-compose logs | grep -i error
```

**Solution:**
1. Check available system resources
2. Increase Docker memory allocation
3. Check for slow database queries
4. Look for network latency issues

#### Issue: "High memory usage"
**Solution:**
```bash
# Check which container uses memory
docker stats

# If MongoDB: reduce cache size in docker-compose.prod.yml
# If service: check for memory leaks in logs
docker-compose logs [service-name] | grep -i memory
```

#### Issue: "Disk space constantly growing"
**Solution:**
```bash
# Check docker system space
docker system df

# Clean up old images
docker image prune -f

# Clean up unused volumes
docker volume prune -f

# View volume sizes
docker volume ls | while read _ vol; do 
  echo "$vol: $(docker volume inspect $vol --format='{{.Mountpoint}}' | xargs du -sh)"
done
```

---

### 7. Frontend Issues

#### Error: "Cannot GET /"
**Solution:**
```bash
# Check frontend is running
docker-compose ps | grep frontend

# Check frontend logs
docker-compose logs frontend

# Test frontend directly
curl http://localhost:5173

# Verify Vite is running in container
docker exec smart-healthcare-frontend ps aux | grep vite
```

#### Error: "API calls returning 500"
**Solution:**
1. Check API Gateway logs: `docker-compose logs api-gateway`
2. Check which service is failing: `docker-compose logs [service]`
3. Verify service URLs in environment variables
4. Test service directly: `curl http://localhost:5000/api/[endpoint]`

#### Error: "Blank page after login"
**Solution:**
```bash
# Check browser console for errors
# (Open DevTools: F12)

# Check frontend logs
docker-compose logs frontend

# Check if API is responding
curl http://localhost:5000/api/health

# Clear browser cache and refresh
```

---

### 8. Production Deployment Issues

#### Error: "Cannot connect from external IP"
**Solution:**
1. Update docker-compose.yml ports to `0.0.0.0:5000:5000`
2. Verify firewall allows ports 5000 and 5173
3. Check server's external IP configuration
4. Use reverse proxy (nginx) for HTTPS

#### Error: "Services restart constantly"
**Solution:**
```bash
# Check why services are failing
docker-compose logs [service-name] | tail -50

# Remove restart: always if debugging
# Add back only after fixing issues
```

#### Error: "MongoDB replication failing"
**Solution:**
```bash
# Check replica set status
docker exec smart-healthcare-mongodb mongosh --eval "rs.status()"

# Initialize replica set
docker exec smart-healthcare-mongodb mongosh --eval "rs.initiate()"
```

---

### 9. Debug Utilities

#### Get shell in container
```bash
docker exec -it [container] bash
```

#### Monitor logs in real-time
```bash
docker-compose logs -f --tail=20
```

#### Check running processes
```bash
docker exec [container] ps aux
```

#### Test connectivity between services
```bash
docker exec [container] curl http://[service]:port
```

#### Check network configuration
```bash
docker network inspect smart-healthcare-network
```

#### View all environment variables
```bash
docker exec [container] env
```

#### Check installed packages
```bash
docker exec [container] npm list
```

#### Run one-off command
```bash
docker-compose exec [service] [command]
```

---

### 10. Getting Help

#### Enable verbose logging
```bash
# Add DEBUG environment variable
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or edit docker-compose.yml to add:
# environment:
#   DEBUG: '*'
```

#### Save logs to file
```bash
docker-compose logs > system_logs.txt
docker-compose logs [service] > service_logs.txt
```

#### Collect diagnostics
```bash
echo "=== Docker Version ===" > diagnostics.txt
docker --version >> diagnostics.txt
echo "=== Docker Compose ===" >> diagnostics.txt
docker-compose --version >> diagnostics.txt
echo "=== Running Containers ===" >> diagnostics.txt
docker-compose ps >> diagnostics.txt
echo "=== Services Status ===" >> diagnostics.txt
docker-compose ps -a >> diagnostics.txt
echo "=== Logs ===" >> diagnostics.txt
docker-compose logs --tail=100 >> diagnostics.txt
```

#### Reset Everything
```bash
# Full cleanup and restart
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
docker-compose up -d

# Test again
docker-compose ps
```

---

## Quick Reference

| Issue | Command |
|-------|---------|
| Services not starting | `docker-compose logs` |
| Port in use | `netstat -ano \| findstr :5000` (Windows) |
| MongoDB not responding | `docker-compose logs mongodb` |
| Service not found | `docker-compose restart [service]` |
| Out of space | `docker system prune -f` |
| Verify status | `docker-compose ps` |
| Rebuild service | `docker-compose up -d --build [service]` |
| Clear everything | `docker-compose down -v` |
| Test connectivity | `docker-setup.bat test` (Windows) or `./docker-setup.sh test` (Linux) |

---

## Need More Help?

1. Check logs: `docker-compose logs [service-name]`
2. Read DOCKER_SETUP.md for detailed documentation
3. See DOCKER_HEALTH_CHECK.md for monitoring
4. Review DOCKER_VERIFICATION_CHECKLIST.md to verify setup
5. Check individual service logs for specific errors

**If all else fails:** Reset and rebuild from scratch
```bash
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```
