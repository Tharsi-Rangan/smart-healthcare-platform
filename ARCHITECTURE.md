# Architecture Documentation - Smart Healthcare Platform

## System Overview (Microservices with API Gateway)

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│              ConsultationPage | PaymentPage | Notifications │
└────────┬────────────────────────────────────────────────┬───┘
         │                                                 │
    HTTP/REST                                        HTTP/REST
         │                                                 │
┌────────▼──────────────────┐        ┌─────────────────────▼───┐
│  Consultation Service     │        │ Payment-Notification    │
│  (Port 5004)              │        │ Service (Port 5005)     │
│                           │        │                         │
│ - Create consultation     │        │ - Initiate payment      │
│ - Start/End consultation  │        │ - Handle payment status │
│ - Add notes/prescription  │        │ - Send notifications    │
│ - Generate video links    │        │ - Email service         │
└────────┬──────────────────┘        └─────────────┬───────────┘
         │                                         │
         │              MongoDB                   │
         │        (Single Database)                │
         └───────────────────┬─────────────────────┘
                             │
                   ┌─────────▼────────┐
                   │   MongoDB 6.0    │
                   │   (Port 27017)   │
                   └──────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Frontend (React + Vite)                                  │
│          Patient Portal | Doctor Portal | Admin Dashboard | Consultation | Payment           │
└───────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                │
                                            HTTP/REST
                                       (Target Port 5000)
                                                │
                                    ┌───────────▼───────────┐
                                    │      API GATEWAY      │
                                    │      (Port 5000)      │
                                    └───────────┬───────────┘
                                                │
        ┌──────────────┬──────────────┬─────────┴────┬──────────────┬──────────────┐
        │              │              │              │              │              │
┌───────▼───────┐┌─────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
│ Auth Service  ││ Patient Svc ││ Appt Service ││ Consult Svc ││ Payment Svc ││ Doctor Svc  │
│ (Port 5001)   ││ (Port 5002) ││ (Port 5003)  ││ (Port 5004)  ││ (Port 5005)  ││ (Port 5006)  │
└───────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘
                                       │
                             ┌─────────▼────────┐      ┌──────────────────────────┐
                             │   MongoDB 6.0    │      │  Symptom-Checker Service │
                             │   (Port 27017)   │      │        (Port 5007)       │
                             └──────────────────┘      └──────────────────────────┘
```

## Service Architecture

### 1. API Gateway (Port 5000)
- **Role**: The single entry point for all frontend traffic.
- **Responsibilities**: 
    - Reverse proxying requests based on URL paths.
    - Global CORS handling for the React frontend.
    - Unified request logging (Observability).
    - Simplified frontend environment configuration.
  - Public aggregation endpoints for frontend views that need doctor data without exposing doctor-service internals.

### 2. Auth Service (Port 5001)
- **Responsibilities**: JWT issuance, user login/registration, OTP verification, and role-based access control (RBAC).

### 3. Patient Service (Port 5002)
- **Responsibilities**: Patient profile management, medical history tracking, medical report uploads (Multer), and dashboard summaries.

### 4. Appointment Service (Port 5003)
- **Responsibilities**: Appointment booking, scheduling, status management, and integration with doctor availability.

### 5. Consultation Service (Port 5004)
- **Responsibilities**: 
  - Manage consultation lifecycle (pending → active → completed)
  - Generate video session links using Jitsi (meet.jit.si)
  - Store consultation notes and prescriptions
  - Generate medical passports for patients.

### 6. Payment-Notification Service (Port 5005)
- **Responsibilities**:
  - Handle payment initiation and status tracking (PayHere sandbox)
  - Process payment success/failure callbacks
  - Send email notifications (Nodemailer)
  - Manage real-time notification records for the dashboard.

### 7. Doctor Service (Port 5006)
- **Responsibilities**: Doctor profile management, availability scheduling, patient report reviews, and diagnosis history.

### 8. Symptom-Checker Service (Port 5007)
- **Responsibilities**: AI-driven symptom analysis using Google Gemini API.

## Integration Points

### Service-to-Service Communication

```
Frontend (Browser)
    ↓
[Cookie/Token-based Authentication via Auth Service]
    ↓
    ├─→ Consultation Service (Port 5004)
    │    └─→ Call Appointment Service (verify appointment exists)
    │
    └─→ Payment Service (Port 5005)
         ├─→ Initiates on Consultation Service (when payment succeeds)
         └─→ Sends Email (Nodemailer)
```

### Authentication Flow

1. **User logs in** via Auth Service
2. **JWT token** is stored in localStorage
3. **Token sent** with every API request in Authorization header
4. **Each service** verifies token using JWT_SECRET
5. **User info** (id, role, email) extracted from token claims
### Request Flow
1. **Frontend** makes a call to `http://localhost:5000/api/patients/profile`.
2. **API Gateway** receives the request, logs it, and identifies the `/api/patients` prefix.
3. **API Gateway** proxies the request to `http://localhost:5002/api/patients/profile`.
4. **Patient Service** processes the request and returns data to the Gateway.
5. **API Gateway** sends the response back to the Frontend.

### Public Doctor Flow
1. **Frontend** calls `http://localhost:5000/api/public/doctors` or `http://localhost:5000/api/public/doctors/:id`.
2. **API Gateway** authenticates the internal service request to doctor-service using a short-lived service JWT.
3. **API Gateway** fetches doctor records from the protected doctor-service admin endpoints.
4. **API Gateway** filters the results to approved, active doctors before returning them to the Frontend.
5. **Frontend** renders the live doctor list, doctor details, and booking flow from backend data instead of local mocks.

## Technology Stack

- **API Gateway**: Node.js, Express, `http-proxy-middleware`, `morgan`.
- **Frontend**: React 18, Vite, Framer Motion, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).

## Deployment Architecture

### Local Development
```
docker-compose up
├─ MongoDB (volume)
├─ Consultation Service (port 5004, nodemon watch)
├─ Payment Service (port 5005, nodemon watch)
└─ Frontend (port 5173, Vite dev server)
```

### Kubernetes Production
```
Services:
├─ consultation-service
│  ├─ Deployment (2 replicas)
│  ├─ Service (ClusterIP:5004)
│  ├─ ConfigMap (mongodb_uri)
│  └─ Secret (jwt_secret)
│
├─ payment-notification-service
│  ├─ Deployment (2 replicas)
│  ├─ Service (ClusterIP:5005)
│  ├─ ConfigMap...
│  └─ Secret...
│
└─ MongoDB
   ├─ Deployment (1 replica)
   ├─ Service (ClusterIP:27017)
   └─ PersistentVolume (data persistence)
```

## Security Considerations

1. **JWT Tokens**: Signed with service-specific secrets
2. **Role-Based Access Control**: Patient, Doctor, Admin roles
3. **CORS**: Configured to allow frontend domain only
4. **HTTPS**: Use in production (enforce SSL/TLS)
5. **Environment Variables**: Sensitive data not in code
6. **Database**: MongoDB Atlas recommended for production
7. **Email**: App-specific passwords for Gmail (not main password)

## Error Handling

```javascript
// Centralized error handling
try {
  // Business logic
} catch (error) {
  if (error instanceof AppError) {
    // Custom app error
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  } else {
    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}
```

## Logging & Monitoring

Recommended additions:
- Winston or Bunyan for structured logging
- Prometheus for metrics
- Grafana for visualization
- Sentry for error tracking

## Scaling Considerations

1. **Horizontal Scaling**: Kubernetes replicas for both services
2. **Database Scaling**: MongoDB sharding for large datasets
3. **Caching**: Redis for frequently accessed data
4. **Message Queue**: RabbitMQ/Kafka for async operations
5. **Load Balancer**: Nginx or cloud provider LB

## Testing Strategy

```
Unit Tests:
├─ Service logic
├─ Controller handlers
└─ Middleware functions

Integration Tests:
├─ API endpoints
├─ Database operations
└─ Service-to-service calls

E2E Tests:
├─ Full workflow
├─ Payment flow
└─ Consultation flow
```
### Kubernetes Production
- **Ingress Controller**: Acts as the production API Gateway.
- **Internal Services**: Mapped via K8s Service names (e.g., `http://auth-service:5001`).

---

**Last Updated**: April 15, 2026
**Version**: 3.0.0 (API Gateway Integrated)
