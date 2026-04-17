# 📧 Nodemailer & SMS Notification Setup - Complete Guide

## Overview
The notification service is fully configured with:
- ✅ **Email Notifications** via Nodemailer (Gmail SMTP)
- ✅ **SMS Notifications** via Twilio
- ✅ **WhatsApp Notifications** via Twilio (optional)
- ✅ **Professional HTML Templates** for all notification types
- ✅ **Audit Trail** - All notifications logged to MongoDB

---

## 🚀 Configuration

### 1. Environment Variables (`.env`)
```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password  # NOT your Gmail password!
EMAIL_FROM_NAME=MediConnect

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Service URLs
FRONTEND_BASE_URL=http://localhost:5173
API_GATEWAY_URL=http://localhost:5000

# Feature Flags
SEND_EMAIL_ON_BOOKING=true
SEND_EMAIL_ON_COMPLETION=true
SEND_SMS_ON_BOOKING=true
SEND_SMS_ON_COMPLETION=true
TWILIO_WHATSAPP_ENABLED=false
```

### 2. Gmail SMTP Setup

**Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account](https://myaccount.google.com)
2. Select "Security" from left menu
3. Enable "2-Step Verification"

**Step 2: Create App Password**
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Google generates a 16-character password
4. Copy and paste into `.env` as `EMAIL_PASS`

**Step 3: Verify**
- Email will be sent from: `MediConnect <your-email@gmail.com>`
- If getting "App Verification" error, [allow less secure apps](https://support.google.com/accounts/answer/6010255)

---

### 3. Twilio SMS Setup

**Step 1: Create Twilio Account**
1. Sign up at [Twilio](https://www.twilio.com/console)
2. Verify your phone number

**Step 2: Get API Credentials**
1. Dashboard → Account Info
2. Copy `ACCOUNT SID` and `AUTH TOKEN`
3. Paste into `.env`

**Step 3: Get Phone Number**
1. Console → Phone Numbers
2. Buy a Twilio number (supports SMS)
3. Paste into `TWILIO_PHONE_NUMBER`

**Step 4: Test SMS**
```bash
# Run test script
node test-sms.js
```

---

## 📨 Notification Endpoints

### 1. Appointment Booked
```http
POST /api/notifications/appointment-booked
Content-Type: application/json

{
  "patientId": "patient_id_here",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94771234567",
  "doctorId": "doctor_id_here",
  "doctorName": "Dr. Smith",
  "appointmentId": "appointment_id_here",
  "appointmentDate": "2026-04-25",
  "appointmentTime": "2:00 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment notification sent",
  "data": {
    "notification": {
      "_id": "notification_id",
      "recipient": {
        "email": "john@example.com",
        "phone": "+94771234567",
        "name": "John Doe",
        "role": "patient"
      },
      "type": "appointment_booked",
      "subject": "Appointment Confirmation with Dr. Smith",
      "channels": {
        "email": {
          "sent": true,
          "sentAt": "2026-04-17T10:30:00Z"
        },
        "sms": {
          "sent": true,
          "sentAt": "2026-04-17T10:30:01Z"
        }
      },
      "status": "sent"
    }
  }
}
```

---

### 2. Consultation Completed
```http
POST /api/notifications/consultation-completed
Content-Type: application/json

{
  "patientId": "patient_id_here",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94771234567",
  "doctorName": "Dr. Smith",
  "consultationId": "consultation_id_here",
  "prescriptionLink": "http://localhost:5173/patient/prescriptions/id"
}
```

---

### 3. Payment Received
```http
POST /api/notifications/payment-received
Content-Type: application/json

{
  "patientId": "patient_id_here",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94771234567",
  "doctorName": "Dr. Smith",
  "amount": "2500",
  "transactionId": "PH_TXN_123456",
  "paymentId": "payment_id_here"
}
```

---

### 4. Appointment Cancelled
```http
POST /api/notifications/appointment-cancelled
Content-Type: application/json

{
  "patientId": "patient_id_here",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94771234567",
  "doctorName": "Dr. Smith",
  "appointmentId": "appointment_id_here",
  "appointmentDate": "2026-04-25"
}
```

---

### 5. Doctor Registration (Admin Notification)
```http
POST /api/notifications/doctor-registration
Content-Type: application/json

{
  "doctorId": "doctor_id_here",
  "doctorName": "Dr. Sarah Johnson",
  "doctorEmail": "sarah@example.com",
  "doctorPhone": "+94771234567",
  "specialization": "Cardiology",
  "licenseNumber": "LK-DOC-2024-001",
  "adminEmail": "admin@mediconnect.com"
}
```

---

## 🔧 Integration Points

### From Payment Service
When payment is confirmed via PayHere webhook:
```javascript
// services/payment-service/src/controllers/paymentController.js
await axios.post('http://localhost:5000/api/notifications/payment-received', {
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  amount,
  transactionId,
  paymentId
});
```

### From Appointment Service
After appointment is booked:
```javascript
// services/appointment-service/src/controllers/appointmentController.js
await axios.post('http://localhost:5000/api/notifications/appointment-booked', {
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorId,
  doctorName,
  appointmentId,
  appointmentDate,
  appointmentTime
});
```

### From Consultation Service
After consultation ends:
```javascript
// services/consultation-service/src/controllers/consultationController.js
await axios.post('http://localhost:5000/api/notifications/consultation-completed', {
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  consultationId,
  prescriptionLink
});
```

---

## 📊 Notification Database Schema

```javascript
{
  _id: ObjectId,
  recipient: {
    userId: String,
    email: String,
    phone: String,
    name: String,
    role: 'patient' | 'doctor' | 'admin'
  },
  type: 'appointment_booked' | 'consultation_completed' | 'payment_received' | 'appointment_cancelled' | 'doctor_registration',
  subject: String,
  message: String,
  htmlContent: String,
  relatedEntity: {
    entityType: 'appointment' | 'consultation' | 'payment' | 'doctor',
    entityId: String
  },
  channels: {
    email: {
      sent: Boolean,
      sentAt: Date,
      error: String
    },
    sms: {
      sent: Boolean,
      sentAt: Date,
      error: String
    },
    whatsapp: {
      sent: Boolean,
      sentAt: Date,
      error: String
    }
  },
  status: 'sending' | 'sent' | 'failed',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Test Email Only
```bash
curl -X POST http://localhost:5008/api/notifications/appointment-booked \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "test_patient_1",
    "patientName": "Test User",
    "patientEmail": "your-email@gmail.com",
    "patientPhone": "+94771234567",
    "doctorId": "test_doctor_1",
    "doctorName": "Dr. Test",
    "appointmentId": "test_appointment_1",
    "appointmentDate": "2026-04-25",
    "appointmentTime": "2:00 PM"
  }'
```

### Check Notification Logs
```bash
# MongoDB
db.notifications.find().pretty()

# Terminal
tail -f notification-service.log
```

---

## ✅ Checklist

- [ ] Gmail SMTP configured with App Password
- [ ] Twilio Account created with verified phone
- [ ] `.env` file updated with all credentials
- [ ] Nodemailer installed (`npm install nodemailer`)
- [ ] Twilio SDK installed (`npm install twilio`)
- [ ] Notification service running on port 5008
- [ ] Test email sent successfully
- [ ] Test SMS sent successfully
- [ ] API Gateway routing to notification service
- [ ] Appointment service calling notification endpoint
- [ ] Payment service calling notification endpoint
- [ ] Consultation service calling notification endpoint
- [ ] Database notifications collection created
- [ ] WhatsApp optional (enabled in .env if needed)

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check `.env` credentials
2. Verify Gmail 2FA enabled
3. Check App Password (must be 16 characters)
4. Look for error logs: `[Email] Error:`

### SMS Not Sending
1. Verify Twilio credentials in `.env`
2. Check phone number format: `+94771234567`
3. Ensure Twilio account has credits
4. Look for error logs: `[SMS] Error:`

### Logs Not Appearing
1. Ensure MongoDB connected
2. Check Notification model in `models/`
3. Verify database name: `notification_db`

---

## 📞 Support
For issues, check logs:
```bash
# Terminal output
npm run dev

# MongoDB
db.notifications.find({ status: 'failed' }).pretty()
```
