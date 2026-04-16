# Frontend API Integration Guide

## 🎯 Complete API Integration Map

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
│                    (Port 5173)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Express)                         │
│                    (Port 5000)                                   │
│  Routes all requests to appropriate microservices               │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────────────────────┐
                ↓             ↓             ↓               ↓
          ┌─────────┐    ┌─────────┐  ┌─────────┐     ┌─────────┐
          │  Auth   │    │ Patient │  │ Doctor  │     │ Payment │
          │ (5001)  │    │ (5002)  │  │ (5006)  │     │ (5005)  │
          └─────────┘    └─────────┘  └─────────┘     └─────────┘
                ↓             ↓             ↓               ↓
          ┌─────────┐    ┌──────────┐ ┌──────────┐   ┌──────────┐
          │Appt-    │    │Consult   │ │Symptom   │   │Notif     │
          │ment     │    │(5004)    │ │Checker   │   │Service   │
          │(5003)   │    │          │ │(5007)    │   │(5008)    │
          └─────────┘    └──────────┘ └──────────┘   └──────────┘
                │             │             │             │
                └─────────────┴─────────────┴─────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │  MongoDB Cluster │
                    └──────────────────┘
```

## 📡 API Endpoints by Service

### 1. Authentication Service (Port 5001)

**File**: `services/authApi.js`

```javascript
// POST /api/auth/register
// Body: { email, password, name, phone, role }
// Response: { message, token, user }

// POST /api/auth/login
// Body: { email, password }
// Response: { message, token, user }

// POST /api/auth/verify-otp
// Body: { email, otp }
// Response: { message, verified }

// POST /api/auth/forgot-password
// Body: { email }
// Response: { message }

// POST /api/auth/reset-password
// Body: { token, password }
// Response: { message }

// GET /api/auth/me
// Headers: { Authorization: Bearer token }
// Response: { user }

// POST /api/auth/logout
// Headers: { Authorization: Bearer token }
// Response: { message }
```

### 2. Patient Service (Port 5002)

**File**: `services/patientService.js`

```javascript
// GET /api/patients/profile
// Headers: { Authorization: Bearer token }
// Response: { patient }

// PUT /api/patients/profile
// Headers: { Authorization: Bearer token }
// Body: { name, phone, address, bloodGroup, allergies, ... }
// Response: { message, patient }

// GET /api/patients/medical-history
// Headers: { Authorization: Bearer token }
// Response: { medicalHistory: [] }

// POST /api/patients/medical-history
// Headers: { Authorization: Bearer token }
// Body: { condition, startDate, endDate, treatment }
// Response: { message, record }

// GET /api/patients/reports
// Headers: { Authorization: Bearer token }
// Response: { reports: [] }

// GET /api/patients/:patientId
// Headers: { Authorization: Bearer token }
// Response: { patient }

// GET /api/patients/search
// Query: { name, email, phone }
// Headers: { Authorization: Bearer token }
// Response: { patients: [] }
```

### 3. Appointment Service (Port 5003)

**File**: `services/appointmentApi.js`

```javascript
// GET /api/appointments
// Query: { status, doctorId, patientId, date }
// Headers: { Authorization: Bearer token }
// Response: { appointments: [] }

// POST /api/appointments
// Headers: { Authorization: Bearer token }
// Body: { doctorId, appointmentDate, time, reason, notes }
// Response: { message, appointment }

// GET /api/appointments/:appointmentId
// Headers: { Authorization: Bearer token }
// Response: { appointment }

// PUT /api/appointments/:appointmentId
// Headers: { Authorization: Bearer token }
// Body: { appointmentDate, time, reason, notes, status }
// Response: { message, appointment }

// DELETE /api/appointments/:appointmentId
// Headers: { Authorization: Bearer token }
// Response: { message }

// POST /api/appointments/:appointmentId/reschedule
// Headers: { Authorization: Bearer token }
// Body: { newDate, newTime, reason }
// Response: { message, appointment }

// POST /api/appointments/:appointmentId/cancel
// Headers: { Authorization: Bearer token }
// Body: { reason }
// Response: { message }

// GET /api/appointments/doctor/:doctorId
// Headers: { Authorization: Bearer token }
// Response: { appointments: [] }

// GET /api/appointments/patient/:patientId
// Headers: { Authorization: Bearer token }
// Response: { appointments: [] }
```

### 4. Consultation Service (Port 5004)

**File**: `services/consultationApi.js` ✨ NEW

```javascript
// POST /api/consultations
// Headers: { Authorization: Bearer token }
// Body: { patientId, doctorId, appointmentId, type }
// Response: { message, consultation }

// GET /api/consultations
// Query: { status, type, date }
// Headers: { Authorization: Bearer token }
// Response: { consultations: [] }

// GET /api/consultations/:consultationId
// Headers: { Authorization: Bearer token }
// Response: { consultation }

// POST /api/consultations/:consultationId/start
// Headers: { Authorization: Bearer token }
// Response: { message, jitsiToken, roomName }

// POST /api/consultations/:consultationId/end
// Headers: { Authorization: Bearer token }
// Body: { notes, duration, prescription }
// Response: { message, consultation }

// POST /api/consultations/:consultationId/notes
// Headers: { Authorization: Bearer token }
// Body: { notes }
// Response: { message }

// GET /api/consultations/doctor/:doctorId
// Headers: { Authorization: Bearer token }
// Response: { consultations: [] }

// GET /api/consultations/patient/:patientId
// Headers: { Authorization: Bearer token }
// Response: { consultations: [] }
```

### 5. Payment Service (Port 5005)

**File**: `services/paymentApi.js` ✨ NEW

```javascript
// POST /api/payments/initiate
// Headers: { Authorization: Bearer token }
// Body: { appointmentId, amount, paymentMethod }
// Response: { paymentId, paymentUrl }

// POST /api/payments/verify
// Headers: { Authorization: Bearer token }
// Body: { paymentId }
// Response: { message, status, transaction }

// GET /api/payments/:paymentId
// Headers: { Authorization: Bearer token }
// Response: { payment }

// GET /api/payments/history
// Query: { status, startDate, endDate }
// Headers: { Authorization: Bearer token }
// Response: { payments: [] }

// POST /api/payments/:paymentId/refund
// Headers: { Authorization: Bearer token }
// Body: { reason }
// Response: { message, refund }

// GET /api/payments/:paymentId/invoice
// Headers: { Authorization: Bearer token }
// Response: { invoiceUrl, invoice }

// POST /api/payments/webhook
// Body: { merchant_id, order_id, payment_id, status_code, msg }
// Response: { message }
```

### 6. Doctor Service (Port 5006)

**File**: `services/doctorApi.js`

```javascript
// GET /api/doctors
// Query: { specialty, city, rating, verified, search }
// Response: { doctors: [] }

// GET /api/doctors/:doctorId
// Response: { doctor }

// GET /api/doctors/profile
// Headers: { Authorization: Bearer token }
// Response: { doctor }

// PUT /api/doctors/profile
// Headers: { Authorization: Bearer token }
// Body: { name, specialty, qualifications, experience, bio, ... }
// Response: { message, doctor }

// POST /api/doctors/availability
// Headers: { Authorization: Bearer token }
// Body: { day, startTime, endTime, slotDuration }
// Response: { message, availability }

// GET /api/doctors/:doctorId/availability
// Query: { date }
// Response: { availability }

// PUT /api/doctors/:doctorId/availability/:availabilityId
// Headers: { Authorization: Bearer token }
// Body: { status, notes }
// Response: { message }

// DELETE /api/doctors/:doctorId/availability/:availabilityId
// Headers: { Authorization: Bearer token }
// Response: { message }

// GET /api/doctors/search
// Query: { name, specialty, email }
// Response: { doctors: [] }

// GET /api/doctors/:doctorId/reviews
// Response: { reviews: [] }
```

### 7. Symptom Checker Service (Port 5007)

**File**: `services/symptomCheckerApi.js` ✨ NEW

```javascript
// POST /api/symptom-checker/analyze
// Headers: { Authorization: Bearer token }
// Body: { symptoms, duration, severity, age, gender }
// Response: {
//   possibleConditions: [{ name, probability, description }],
//   suggestedSpecialty,
//   recommendations: [],
//   emergencyWarning: boolean
// }

// GET /api/symptom-checker/history
// Headers: { Authorization: Bearer token }
// Response: { history: [] }

// GET /api/symptom-checker/:recordId
// Headers: { Authorization: Bearer token }
// Response: { record }

// DELETE /api/symptom-checker/:recordId
// Headers: { Authorization: Bearer token }
// Response: { message }

// GET /api/symptom-checker/conditions
// Response: { conditions: [] }

// GET /api/symptom-checker/specialties
// Response: { specialties: [] }
```

### 8. Notification Service (Port 5008)

**File**: `services/notificationApi.js` ✨ NEW

```javascript
// GET /api/notifications
// Query: { read, type, limit, skip }
// Headers: { Authorization: Bearer token }
// Response: { notifications: [], total, unread }

// GET /api/notifications/:notificationId
// Headers: { Authorization: Bearer token }
// Response: { notification }

// PUT /api/notifications/:notificationId/read
// Headers: { Authorization: Bearer token }
// Response: { message }

// PUT /api/notifications/read-all
// Headers: { Authorization: Bearer token }
// Response: { message, count }

// DELETE /api/notifications/:notificationId
// Headers: { Authorization: Bearer token }
// Response: { message }

// DELETE /api/notifications/delete-all
// Headers: { Authorization: Bearer token }
// Response: { message, count }

// GET /api/notifications/unread-count
// Headers: { Authorization: Bearer token }
// Response: { count }

// POST /api/notifications/subscribe
// Headers: { Authorization: Bearer token }
// Body: { token, platform }
// Response: { message, subscription }
```

## 🔐 Authentication Flow

### Login Flow

```
1. User enters credentials on LoginPage
   ↓
2. Frontend calls POST /api/auth/login
   ↓
3. Auth Service returns { token, user }
   ↓
4. Frontend stores token in localStorage
   ↓
5. Token added to Authorization header for all requests
   ↓
6. User redirected to appropriate dashboard
```

### Protected Route Flow

```
1. User navigates to protected route
   ↓
2. ProtectedRoute component checks localStorage for token
   ↓
3. Validates token with backend (optional)
   ↓
4. Checks user role matches allowedRoles
   ↓
5. Renders page if authorized, otherwise redirect to login
```

## 🔄 Complete User Workflows

### Patient Appointment Booking

```
1. Patient browses /doctors
   └─ GET /api/doctors (with filters)
   
2. Patient views doctor /doctors/:id
   └─ GET /api/doctors/:doctorId
   
3. Patient clicks "Book Appointment"
   └─ Navigate to /book-appointment
   
4. Patient fills form & submits
   └─ POST /api/appointments
   
5. System creates payment
   └─ POST /api/payments/initiate
   
6. Patient pays
   └─ PayHere payment gateway
   
7. Payment verification
   └─ POST /api/payments/verify
   
8. Appointment confirmed
   └─ GET /api/appointments/:appointmentId
   
9. Notifications sent
   └─ POST /api/notifications (internally)
```

### Patient Symptom Checking

```
1. Patient navigates to /symptoms
   └─ SymptomCheckerPage loads
   
2. Patient enters symptoms
   └─ Fills form with symptoms, duration, severity
   
3. Patient submits
   └─ POST /api/symptom-checker/analyze
   
4. AI analysis returns results
   └─ Response includes conditions, specialty, recommendations
   
5. Patient reviews results
   └─ Shows possible conditions with probabilities
   
6. Patient books appointment (optional)
   └─ Navigate to /book-appointment with pre-filled specialty
```

### Doctor Consultation

```
1. Doctor views appointments
   └─ GET /api/appointments/doctor/:doctorId
   
2. Doctor clicks consultation link
   └─ POST /api/consultations/:consultationId/start
   
3. Jitsi room created
   └─ Receives roomName & token
   
4. Video consultation with patient
   └─ Real-time video/audio/screen sharing
   
5. Doctor adds notes
   └─ POST /api/consultations/:consultationId/notes
   
6. Doctor creates prescription
   └─ POST /api/appointments/:appointmentId (add prescription)
   
7. Doctor ends consultation
   └─ POST /api/consultations/:consultationId/end
   
8. Consultation saved & notifications sent
   └─ Patient receives notification
```

### Admin Dashboard

```
1. Admin views dashboard
   └─ GET /api/admin/dashboard (or aggregated from services)
   
2. Admin verifies doctors
   └─ GET /api/doctors?verified=false
   └─ PUT /api/doctors/:doctorId/verify
   
3. Admin manages users
   └─ GET /api/patients
   └─ PUT/DELETE /api/patients/:patientId
   
4. Admin monitors transactions
   └─ GET /api/payments/history
   
5. Admin views analytics
   └─ Get aggregated data from all services
```

## 🛠️ Error Handling Strategy

### Error Codes

```javascript
{
  400: "Bad Request - Invalid data",
  401: "Unauthorized - Token invalid/expired",
  403: "Forbidden - Insufficient permissions",
  404: "Not Found - Resource doesn't exist",
  409: "Conflict - Data already exists",
  422: "Unprocessable - Validation failed",
  500: "Server Error - Backend issue",
  503: "Service Unavailable - Service down"
}
```

### Error Response Format

```javascript
{
  success: false,
  message: "Error description",
  code: "ERROR_CODE",
  errors: {
    field: ["Error message 1", "Error message 2"]
  }
}
```

### Frontend Error Handling

```javascript
try {
  const response = await api.call();
  return response.data;
} catch (error) {
  // Handle different error types
  if (error.response?.status === 401) {
    // Token expired - redirect to login
    navigate("/login");
  } else if (error.response?.status === 403) {
    // Permission denied
    showError("You don't have permission");
  } else {
    // Generic error
    showError(error.response?.data?.message || "An error occurred");
  }
  throw error;
}
```

## 📊 Data Models

### User
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  phone: String,
  role: "patient" | "doctor" | "admin",
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Patient
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  allergies: [String],
  medicalHistory: [Object],
  address: String,
  city: String,
  state: String,
  pincode: String
}
```

### Appointment
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  appointmentDate: Date,
  time: String,
  status: "scheduled" | "completed" | "cancelled",
  reason: String,
  notes: String,
  payment: {
    status: String,
    amount: Number,
    transactionId: String
  }
}
```

### Consultation
```javascript
{
  _id: ObjectId,
  appointmentId: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  startTime: Date,
  endTime: Date,
  status: "scheduled" | "ongoing" | "completed",
  roomName: String,
  notes: String,
  prescription: [Object]
}
```

---

**This guide provides complete API integration details for all services.**  
**Always refer to individual service documentation for detailed specifications.**
