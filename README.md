# Smart Healthcare Platform

A comprehensive microservices-based healthcare platform with Docker containerization, supporting appointments, consultations, payments, and more.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose
- 4GB RAM allocated to Docker
- 10GB free disk space

### Start All Services (One Command)

**Windows:**
```bash
docker-compose up -d
```

**Or use the setup script (recommended):**
```bash
docker-setup.bat full-setup
```

**Linux/Mac:**
```bash
docker-compose up -d
```

**Or use the setup script:**
```bash
chmod +x docker-setup.sh
./docker-setup.sh full-setup
```

### Access Services
- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017

### Verify Setup
```bash
docker-compose ps
```

All services should show "Up" status.

## 📚 Docker Documentation

Complete Docker setup and deployment guides:

| Document | Purpose |
|----------|---------|
| [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md) | 5-minute quick start guide |
| [DOCKER_SETUP.md](DOCKER_SETUP.md) | Comprehensive Docker documentation (450+ lines) |
| [DOCKER_HEALTH_CHECK.md](DOCKER_HEALTH_CHECK.md) | Health monitoring and troubleshooting |
| [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) | Common issues and solutions |
| [DOCKER_VERIFICATION_CHECKLIST.md](DOCKER_VERIFICATION_CHECKLIST.md) | Complete setup verification |

## 🏗️ Service Architecture

### Running Services (11 total)

| Service | Port | Purpose |
|---------|------|---------|
| MongoDB | 27017 | Database |
| API Gateway | 5000 | Main entry point |
| Auth Service | 5001 | Authentication & JWT |
| Patient Service | 5002 | Patient profiles |
| Appointment Service | 5003 | Appointment management |
| Consultation Service | 5004 | Video consultations |
| Payment Service | 5005 | Payment processing |
| Doctor Service | 5006 | Doctor profiles |
| Symptom Checker | 5007 | AI symptom analysis |
| Notification Service | 5008 | Email/SMS notifications |
| Frontend | 5173 | React web application |

### Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js/Express microservices
- **Database:** MongoDB with persistent volumes
- **Containerization:** Docker & Docker Compose
- **API Communication:** HTTP with JWT auth

## ⚙️ Configuration

### Environment Setup
```bash
# Copy example to .env and edit
cp .env.example .env
nano .env  # or your preferred editor
```

Key variables:
- `JWT_SECRET` - Authentication token secret
- `MONGODB_URI` - Database connection string
- `STRIPE_*` - Payment API keys
- `SMTP_*` - Email notification settings

## 🔧 Common Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose stop

# View service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose up -d --build [service-name]

# Clean everything
docker-compose down -v

# Test connectivity
docker-setup.bat test  # Windows
./docker-setup.sh test  # Linux/Mac
```

## 🛠️ Development Workflow

1. **Edit code** - Changes auto-reload via volume mounts
2. **View logs** - `docker-compose logs -f [service]`
3. **Rebuild** - `docker-compose up -d --build [service]`
4. **Database access** - `docker exec -it smart-healthcare-mongodb mongosh`

## 📦 Production Deployment

```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Features:
- Resource limits and reservations
- Automatic restart policies
- MongoDB replica set configuration
- Production logging levels

## 🐛 Troubleshooting

**Services not starting?**
```bash
docker-compose logs [service-name]
```

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

**Need help?** See [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)

---

## Additional Documentation

### Appointment Service

Purpose:
The appointment-service manages patient appointment booking and lifecycle operations in the healthcare microservices system.

Main endpoints:
- `GET /health`
- `POST /api/appointments`
- `GET /api/appointments/my`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id/cancel`
- `PUT /api/appointments/:id/reschedule`

How to run locally (without Docker):
1. Go to `services/appointment-service`.
2. Create `.env` using values from `.env.example`.
3. Install dependencies: `npm install`.
4. Run in dev mode: `npm run dev`.
5. Run in production mode: `npm start`.

Notes:
- This service expects a Bearer JWT from auth-service and reads `userId` and `role` from the token payload.
- MongoDB must be running and reachable via `MONGO_URI`.

---

## License

This project is part of the Smart Healthcare Platform initiative.

## Support

For issues or questions:
1. Check the Docker documentation files
2. Review service logs: `docker-compose logs`
3. Verify setup with: `./docker-setup.sh test` or `docker-setup.bat test`
