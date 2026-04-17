# Complete Payment & Telemedicine Setup Guide

## Phase 1: PayHere Payment Integration

### 1.1 Environment Setup

Create/Update `.env` files:

**services/payment-service/.env:**
```env
PORT=5006
MONGODB_URI=mongodb://mongodb:27017/payment_notification_db
JWT_SECRET=677981fce62795893d6ea00b6b28fd8bb334ea1d5d33fdec504a4a3b3a32b269

# PayHere Configuration (Sri Lanka Payment Gateway)
PAYHERE_MERCHANT_ID=1226148
PAYHERE_MERCHANT_SECRET=your_merchant_secret_here
PAYHERE_SANDBOX=true

# Email Configuration (for receipts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@healthcare.com
```

**services/consultation-service/.env:**
```env
PORT=5004
MONGODB_URI=mongodb://mongodb:27017/consultation_db
JWT_SECRET=677981fce62795893d6ea00b6b28fd8bb334ea1d5d33fdec504a4a3b3a32b269

# Twilio Configuration (Video Consultation)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret

APPOINTMENT_SERVICE_URL=http://appointment-service:5003
PAYMENT_SERVICE_URL=http://payment-service:5006
DOCTOR_SERVICE_URL=http://doctor-service:5006
```

### 1.2 Get PayHere Credentials

1. **Register on PayHere:**
   - Visit: https://www.payhere.lk/
   - Sign up as merchant
   - Get `Merchant ID` and `Merchant Secret`

2. **Test Credentials:**
   ```
   Merchant ID: 1226148 (sandbox testing)
   ```

### 1.3 Get Twilio Credentials

1. **Register on Twilio:**
   - Visit: https://www.twilio.com/
   - Create account
   - Go to Console → API Keys & Tokens
   - Get `Account SID`, `Auth Token`, `API Key`, and `API Secret`

2. **Create Video API Keys:**
   - Go to Programmable Video → API Keys
   - Create new API Key pair
   - Save credentials

---

## Phase 2: Payment Flow

### 2.1 Appointment Status Flow

```
Doctor Accepts Appointment
    ↓
Appointment Status: "confirmed" (no payment required yet)
    ↓
Frontend shows "Pay Now" button
    ↓
Patient clicks "Pay Now"
    ↓
Payment initiated (status: "pending")
    ↓
PayHere payment gateway opens
    ↓
Payment completed/webhook received
    ↓
Admin notification: Payment needs approval
    ↓
Admin approves payment
    ↓
Payment Status: "approved" (not just "completed")
    ↓
Consultation link becomes available
    ↓
Patient & Doctor can start video session
```

### 2.2 Payment Status Flow

```
pending          → Patient initiated payment
completed        → Payment gateway says it's complete
admin_pending    → Awaiting admin review
admin_approved   → Admin approved, consultation can start
admin_rejected   → Admin rejected, payment refunded
failed           → Payment failed or refunded
```

---

## Phase 3: Implementation Checklist

### Backend Updates Needed:
- [ ] Add payment approval endpoints (admin-only)
- [ ] Create payment status routes
- [ ] Update appointment model to track payment
- [ ] Create Twilio video token generation endpoint
- [ ] Add consultation session management
- [ ] Create payment webhooks for admin notifications
- [ ] Add payment refund functionality

### Frontend Updates Needed:
- [ ] Create "Pay Now" button in appointment details
- [ ] Create PayHere payment modal
- [ ] Create payment status tracker
- [ ] Create admin payment approval dashboard
- [ ] Create video consultation component (Twilio)
- [ ] Add appointment status indicators

### Database Updates Needed:
- [ ] Add `paymentId` field to Appointment model
- [ ] Add `adminApproved` field to Payment model
- [ ] Create ConsultationSession model for video tracking

---

## Phase 4: PayHere Integration Details

### Payment Initiation Flow:
```javascript
// Patient initiates payment
POST /api/payments/initiate
{
  appointmentId: "appointment_id",
  doctorId: "doctor_id",
  doctorName: "Dr. Smith",
  amount: 1500,
  currency: "LKR"
}

// Returns:
{
  success: true,
  data: {
    payment: { _id, appointmentId, status: "pending", ... },
    payhereData: { merchant_id, order_id, amount, hash, ... }
  }
}
```

### PayHere Webhook (Server-to-Server):
```
POST /api/payments/notify
Receives payment status from PayHere
Updates payment status in database
Sends admin notification for approval
```

### Payment Confirmation (Admin):
```javascript
// Admin approves payment
PUT /api/payments/:paymentId/approve
// Returns:
{
  success: true,
  message: "Payment approved",
  data: {
    payment: { status: "admin_approved", ... }
  }
}
```

---

## Phase 5: Twilio Video Integration

### Video Session Flow:
```
Patient/Doctor clicks "Start Consultation"
    ↓
Check payment status (must be "admin_approved")
    ↓
Check appointment time (within valid window)
    ↓
Request video token from backend
    ↓
Backend generates unique room name
    ↓
Backend generates Twilio access token
    ↓
Frontend connects to Twilio video room
    ↓
Real-time video/audio/screen sharing
    ↓
Session ends, update appointment status
```

### Video Token Generation:
```javascript
// Frontend requests token
POST /api/consultation/video-token
{
  appointmentId: "appointment_id",
  userName: "Patient Name"
}

// Backend generates token
const token = twilio.jwt.AccessToken(
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET
);
token.addVideoGrant({ room: roomName });

// Returns token to frontend
{
  success: true,
  data: {
    token: "token_string",
    roomName: "unique_room_name"
  }
}
```

---

## Phase 6: Testing Checklist

### PayHere Testing:
- [ ] Initiate payment in sandbox mode
- [ ] Complete payment with test card
- [ ] Verify webhook is received
- [ ] Check payment status in database
- [ ] Admin approves payment
- [ ] Verify email receipt sent

### Twilio Testing:
- [ ] Generate video token
- [ ] Connect to video room
- [ ] Test audio/video
- [ ] Test screen sharing
- [ ] Verify session records
- [ ] Test multiple participants

### Integration Testing:
- [ ] Doctor accepts appointment
- [ ] Patient sees "Pay Now" button
- [ ] Patient initiates payment
- [ ] Admin reviews pending payment
- [ ] Admin approves payment
- [ ] Consultation button becomes available
- [ ] Patient/Doctor can join video call

---

## Phase 7: Payment & Consultation States

### Appointment States:
```
pending          → Awaiting doctor response
confirmed        → Doctor accepted (payment can start)
payment_pending  → Patient initiated payment
payment_approved → Admin approved payment (consultation available)
active           → Consultation in progress
completed        → Consultation finished
cancelled        → Cancelled by patient/doctor
```

### Access Control:
```
- Patient can PAY ONLY if: status = "confirmed"
- Consultation button visible ONLY if: payment status = "admin_approved"
- Doctor can join ONLY if: payment status = "admin_approved"
- Admin approves payments in dashboard
```

---

## Phase 8: API Endpoints Summary

### Payment Endpoints:
```
POST   /api/payments/initiate          (Patient) - Initiate payment
POST   /api/payments/confirm           (Any) - Manual confirmation
POST   /api/payments/notify            (PayHere) - Webhook
GET    /api/payments/patient           (Patient) - View my payments
GET    /api/payments/admin             (Admin) - View all payments
PUT    /api/payments/:id/approve       (Admin) - Approve payment
PUT    /api/payments/:id/reject        (Admin) - Reject payment
GET    /api/payments/:id/status        (Patient/Doctor) - Check status
```

### Consultation Endpoints:
```
POST   /api/consultation/video-token   (Patient/Doctor) - Get video token
GET    /api/consultation/room/:id      (Any) - Get room details
POST   /api/consultation/session       (Any) - Create session record
PUT    /api/consultation/session/:id   (Any) - End session
GET    /api/consultation/history       (Doctor) - View past sessions
```

---

## Next Steps:

1. **Update .env files** with PayHere and Twilio credentials
2. **Create payment approval model** and endpoints
3. **Create video consultation endpoints** with Twilio
4. **Create frontend payment component** with PayHere integration
5. **Create admin approval dashboard** for payments
6. **Create video consultation UI** with Twilio
7. **Test complete flow** end-to-end

All implementation files will be created in the next steps.
