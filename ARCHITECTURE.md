# Architecture Documentation - Smart Healthcare Platform

## System Overview

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
```

## Service Architecture

### 1. Consultation Service

**Responsibilities:**
- Manage consultation lifecycle (pending → active → completed)
- Generate video session links using Jitsi
- Store consultation notes and prescriptions
- Track consultation history per patient/doctor

**Key Endpoints:**
```
POST   /api/consultations              - Create consultation
POST   /api/consultations/:id/start   - Start consultation (generate video link)
POST   /api/consultations/:id/end     - End consultation
PUT    /api/consultations/:id/notes   - Add/update notes and prescription
GET    /api/consultations/:id         - Get consultation details
GET    /api/consultations/patient/:id - Get patient history
GET    /api/consultations/doctor/:id  - Get doctor history
```

**Database Model:**
```
Consultation {
  appointmentId (unique)
  patientId
  doctorId
  status: "pending" | "active" | "completed"
  videoSessionId (UUID)
  videoLink
  notes
  prescription
  startedAt
  completedAt
  createdAt
  updatedAt
}
```

**Video Integration:**
- Uses Jitsi Meet (no backend complexity)
- Generates meeting link: `https://meet.jit.si/{videoSessionId}`
- Frontend opens link in new window/tab

### 2. Payment-Notification Service

**Responsibilities:**
- Handle payment initiation and status tracking
- Process payment success/failure callbacks
- Send email notifications
- Manage notification records

**Key Endpoints:**
```
POST   /api/payments/initiate                    - Initiate payment
POST   /api/payments/success                     - Payment success callback
POST   /api/payments/failure                     - Payment failure callback
GET    /api/payments/status/:appointmentId      - Get payment status
POST   /api/payments/notifications/send         - Send notification
GET    /api/payments/notifications/user/:userId - Get user notifications
PUT    /api/payments/notifications/:id/read     - Mark as read
```

**Database Models:**
```
Payment {
  appointmentId (unique)
  patientId
  doctorId
  amount
  currency: "LKR"
  status: "pending" | "paid" | "failed" | "cancelled"
  paymentGateway: "payhere" | "stripe"
  transactionId
  paymentLink
  failureReason
  createdAt
  updatedAt
}

Notification {
  userId
  type: "email" | "sms"
  title
  message
  eventType: "appointment_booked" | "payment_success" | "consultation_reminder" | "consultation_completed"
  relatedId
  status: "pending" | "sent" | "failed"
  readAt
  createdAt
  updatedAt
}
```

**Email Notifications:**
- Appointment Booked: Patient + Doctor
- Payment Success: Patient
- Consultation Reminder: Patient + Doctor
- Consultation Completed: Patient

## End-to-End Data Flow

### Scenario: Patient Books & Pays for Appointment

```
1. APPOINTMENT BOOKING
   ├─ Patient selects doctor & time slot
   ├─ Appointment created in Appointment Service
   └─ Notification sent (email/SMS)

2. PAYMENT INITIATION
   ├─ POST /api/payments/initiate
   │  ├─ Create Payment record (status: pending)
   │  ├─ Generate payment link
   │  └─ Return payment link to frontend
   └─ Frontend redirects to payment gateway

3. PAYMENT PROCESSING
   ├─ User completes payment on gateway
   ├─ Payment gateway calls: POST /api/payments/success
   │  ├─ Update Payment status to "paid"
   │  ├─ Send success email
   │  └─ Create notification record
   └─ Frontend receives status → shows success message

4. CONSULTATION CREATION
   ├─ Frontend or backend creates consultation
   ├─ POST /api/consultations
   │  ├─ Create Consultation record (status: pending)
   │  └─ Return consultation ID
   └─ Frontend navigates to ConsultationPage

5. CONSULTATION PREPARATION
   ├─ Doctor & Patient receive reminder emails
   └─ System ready for video consultation

6. CONSULTATION EXECUTION
   ├─ Patient initiates: POST /api/consultations/:id/start
   │  ├─ Generate Jitsi video link
   │  └─ Update status to "active"
   ├─ Jitsi link opens in browser
   ├─ Both participants join video
   ├─ Doctor adds notes: PUT /api/consultations/:id/notes
   └─ Either party ends: POST /api/consultations/:id/end
      └─ Status changes to "completed"

7. POST-CONSULTATION
   ├─ Patient receives email with prescription
   └─ Consultation marked complete
```

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

## Technology Stack

```
Frontend:
├─ React 18+
├─ Vite
├─ Axios
└─ React Router

Backend:
├─ Node.js 18+
├─ Express.js
├─ MongoDB 6.0
├─ Mongoose ODM
├─ JWT Authentication
├─ Nodemailer
├─ UUID

DevOps:
├─ Docker
├─ Kubernetes
├─ Docker Compose
└─ Git
```

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

---

**Last Updated**: January 15, 2024
**Version**: 1.0.0
