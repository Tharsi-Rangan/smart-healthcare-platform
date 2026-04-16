# Smart Healthcare Platform - Setup Guide

## Complete Integration Setup

This guide covers the setup and integration of the Consultation, Payment, and Notification services.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (optional)
- Git

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd smart-healthcare-platform

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:5173
- Consultation Service: http://localhost:5004
- Payment Service: http://localhost:5005
- MongoDB: localhost:27017

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
# Consultation Service
cd services/consultation-service
npm install

# Payment-Notification Service
cd ../payment-notification-service
npm install

# Frontend
cd ../../frontend
npm install
```

#### 2. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name smart-healthcare-mongodb mongo:6.0

# Or use local MongoDB installation
mongod
```

#### 3. Configure Environment Variables

**Consultation Service** (.env)
```env
MONGODB_URI=mongodb://localhost:27017/consultation_db
JWT_SECRET=your_consultation_service_secret
PORT=5004
APPOINTMENT_SERVICE_URL=http://localhost:3002
PATIENT_SERVICE_URL=http://localhost:5005
DOCTOR_SERVICE_URL=http://localhost:3005
JITSI_DOMAIN=meet.jit.si
```

**Payment Service** (.env)
```env
MONGODB_URI=mongodb://localhost:27017/payment_notification_db
JWT_SECRET=your_payment_service_secret
PORT=5005
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONSULTATION_SERVICE_URL=http://localhost:5004
APPOINTMENT_SERVICE_URL=http://localhost:3002
```

#### 4. Start Services

```bash
# Terminal 1: Consultation Service
cd services/consultation-service
npm run dev

# Terminal 2: Payment-Notification Service
cd services/payment-notification-service
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## 📋 API Documentation

### Consultation Service (Port 5004)

#### 1. Create Consultation

```http
POST /api/consultations
Content-Type: application/json
Authorization: Bearer <token>

{
  "appointmentId": "apt_123",
  "patientId": "pat_456",
  "doctorId": "doc_789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consultation created successfully",
  "data": {
    "_id": "consultationId",
    "appointmentId": "apt_123",
    "patientId": "pat_456",
    "doctorId": "doc_789",
    "status": "pending",
    "videoSessionId": "uuid",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### 2. Start Consultation

```http
POST /api/consultations/:id/start
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Consultation started",
  "data": {
    "consultation": { ... },
    "meetingLink": "https://meet.jit.si/video-session-id"
  }
}
```

#### 3. End Consultation

```http
POST /api/consultations/:id/end
Authorization: Bearer <token>
```

#### 4. Add Notes & Prescription

```http
PUT /api/consultations/:id/notes
Content-Type: application/json
Authorization: Bearer <token>

{
  "notes": "Patient shows signs of...",
  "prescription": "Medication XYZ, 2 tablets..."
}
```

#### 5. Get Consultation Details

```http
GET /api/consultations/:id
Authorization: Bearer <token>
```

#### 6. Get Patient Consultations

```http
GET /api/consultations/patient/:patientId
Authorization: Bearer <token>
```

#### 7. Get Doctor Consultations

```http
GET /api/consultations/doctor/:doctorId
Authorization: Bearer <token>
```

---

### Payment Service (Port 5005)

#### 1. Initiate Payment

```http
POST /api/payments/initiate
Content-Type: application/json
Authorization: Bearer <token>

{
  "appointmentId": "apt_123",
  "patientId": "pat_456",
  "doctorId": "doc_789",
  "amount": 2500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "_id": "payment_id",
    "appointmentId": "apt_123",
    "transactionId": "TXN-abc123",
    "amount": 2500,
    "status": "pending",
    "paymentLink": "https://...",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### 2. Payment Success Callback

```http
POST /api/payments/success
Content-Type: application/json

{
  "appointmentId": "apt_123",
  "transactionId": "TXN-abc123",
  "patientEmail": "patient@example.com"
}
```

#### 3. Payment Failure Callback

```http
POST /api/payments/failure
Content-Type: application/json

{
  "appointmentId": "apt_123",
  "failureReason": "Insufficient funds"
}
```

#### 4. Get Payment Status

```http
GET /api/payments/status/:appointmentId
Authorization: Bearer <token>
```

#### 5. Send Notification

```http
POST /api/payments/notifications/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user_123",
  "type": "email",
  "title": "Appointment Reminder",
  "message": "Your appointment is scheduled for...",
  "eventType": "consultation_reminder",
  "relatedId": "apt_123"
}
```

#### 6. Get User Notifications

```http
GET /api/payments/notifications/user/:userId
Authorization: Bearer <token>
```

#### 7. Mark Notification as Read

```http
PUT /api/payments/notifications/:notificationId/read
Authorization: Bearer <token>
```

---

## 🔄 End-to-End Flow

### 1. Patient Books Appointment
- Appointment created in appointment service
- Notification sent to patient and doctor

### 2. Payment Flow
```
POST /api/payments/initiate
  ↓
User redirects to payment gateway
  ↓
User completes payment
  ↓
POST /api/payments/success (callback)
  ↓
Consultation created
  ↓
Email notification sent
```

### 3. Consultation Flow
```
Appointment confirmed
  ↓
Patient initiates consultation
  ↓
POST /api/consultations/:id/start
  ↓
Generate Jitsi meeting link
  ↓
Patient & Doctor join video
  ↓
Doctor adds notes & prescription
  ↓
POST /api/consultations/:id/end
  ↓
Consultation marked as completed
  ↓
Notification sent
```

---

## 🔐 Authentication

All endpoints (except payment callbacks) require JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token should contain:
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "patient|doctor|admin"
}
```

---

## 🗄️ Database Schemas

### Consultation Collection
```javascript
{
  _id: ObjectId,
  appointmentId: String (unique),
  patientId: String,
  doctorId: String,
  status: "pending" | "active" | "completed",
  videoSessionId: String,
  videoLink: String,
  notes: String,
  prescription: String,
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Collection
```javascript
{
  _id: ObjectId,
  appointmentId: String (unique),
  patientId: String,
  doctorId: String,
  amount: Number,
  currency: "LKR",
  status: "pending" | "paid" | "failed" | "cancelled",
  paymentGateway: "payhere" | "stripe",
  transactionId: String,
  paymentLink: String,
  failureReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  type: "email" | "sms",
  title: String,
  message: String,
  eventType: "appointment_booked" | "payment_success" | "consultation_reminder" | "consultation_completed",
  relatedId: String,
  status: "pending" | "sent" | "failed",
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Frontend Integration

### Routes to Add

```javascript
import ConsultationPage from "./pages/shared/ConsultationPage";
import PaymentPage from "./pages/shared/PaymentPage";
import NotificationsPage from "./pages/shared/NotificationsPage";

// Add to router
<Route path="/consultation/:consultationId" element={<ConsultationPage />} />
<Route path="/payment/:appointmentId" element={<PaymentPage />} />
<Route path="/notifications" element={<NotificationsPage />} />
```

### Environment Variables

```env
VITE_CONSULTATION_SERVICE_URL=http://localhost:5004
VITE_PAYMENT_SERVICE_URL=http://localhost:5005
```

---

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Step Verification
2. Create App Password
3. Add to .env:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

---

## 🧪 Testing with Postman

1. Import the Postman collection (if provided)
2. Set environment variables:
   - `base_url`: http://localhost:3000 (API Gateway)
   - `token`: JWT token
3. Test endpoints in sequence

---

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>
```

### Database connection error
```bash
# Verify MongoDB is running
docker ps | grep mongodb

# Check MongoDB is accessible
mongo --eval "db.adminCommand('ping')"
```

### Consultation service can't reach payment service
```bash
# Check if both containers are in same network
docker network ls
docker network inspect smart-healthcare_smart-healthcare-network
```

---

## 📚 Additional Resources

- [Jitsi Meet API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [PayHere API](https://www.payhere.lk/developer/)
- [Nodemailer](https://nodemailer.com/)
- [MongoDB Driver](https://www.mongodb.com/docs/drivers/node/)
- [Express.js](https://expressjs.com/)

---

## 📝 Notes

- For production deployment, update all secrets
- Implement rate limiting on payment endpoints
- Add request validation using express-validator
- Implement proper error handling and logging
- Use environment-specific configurations
- Add unit and integration tests
- Implement API versioning (/api/v1/...)
- Set up CI/CD pipeline

---

**Last Updated**: January 15, 2024
**Version**: 1.0.0
