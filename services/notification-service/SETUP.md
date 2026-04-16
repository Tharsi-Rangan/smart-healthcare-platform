# Notification Service Documentation

## Overview
The Notification Service is a dedicated microservice that handles all patient and doctor notifications via **Email** and **SMS** channels for critical healthcare events.

**Service Port:** `5007`

## Features

### Notification Types
- ✉️ **Email Notifications** - HTML-formatted emails via Gmail SMTP
- 📱 **SMS Notifications** - Text messages via Twilio
- 📋 **Notification History** - Track all sent notifications with status

### Supported Events
1. **Appointment Booked** - Patient & Doctor confirmation
2. **Consultation Completed** - Patient report & prescription delivery
3. **Appointment Cancelled** - Cancellation confirmation
4. **Payment Received** - Receipt confirmation

## Setup Instructions

### 1. Install Dependencies
```bash
cd services/notification-service
npm install
```

### 2. Configure Email (Gmail SMTP)

**Enable Gmail App Password:**
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Navigate to **Security** > **App passwords**
3. Select **Mail** and **Windows Computer** (or your device)
4. Generate a password (16 characters)
5. Copy and save this password

**Update `.env` file:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=MediConnect
```

### 3. Configure SMS (Twilio)

**Get Twilio Credentials:**
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your **Account SID** and **Auth Token**
3. Create a Twilio Phone Number (or use trial number)

**Update `.env` file:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Start the Service
```bash
npm run dev
```

Expected output:
```
Notification service running on port 5007
MongoDB Connected: cluster0-shard-00-01.niave.mongodb.net
```

---

## API Endpoints

### Send Appointment Booked Notification
```
POST /api/notifications/appointment-booked
```

**Request Body:**
```json
{
  "patientId": "user_id_123",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorId": "doctor_id_456",
  "doctorName": "Dr. Smith",
  "appointmentId": "appointment_789",
  "appointmentDate": "2026-04-20",
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
      "type": "appointment_booked",
      "status": "sent",
      "channels": {
        "email": { "sent": true, "sentAt": "2026-04-16T12:00:00Z" },
        "sms": { "sent": true, "sentAt": "2026-04-16T12:00:00Z" }
      }
    }
  }
}
```

---

### Send Consultation Completed Notification
```
POST /api/notifications/consultation-completed
```

**Request Body:**
```json
{
  "patientId": "user_id_123",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorName": "Dr. Smith",
  "consultationId": "consultation_id",
  "prescriptionLink": "https://mediconnect.app/prescriptions/abc123"
}
```

---

### Send Appointment Cancelled Notification
```
POST /api/notifications/appointment-cancelled
```

**Request Body:**
```json
{
  "patientId": "user_id_123",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorName": "Dr. Smith",
  "appointmentId": "appointment_789",
  "appointmentDate": "2026-04-20"
}
```

---

### Send Payment Received Notification
```
POST /api/notifications/payment-received
```

**Request Body:**
```json
{
  "patientId": "user_id_123",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorName": "Dr. Smith",
  "amount": 1500,
  "transactionId": "TXN-20260416-001",
  "paymentId": "payment_id_123"
}
```

---

### Get User Notifications
```
GET /api/notifications/:userId?limit=20&skip=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "appointment_booked",
        "status": "sent",
        "subject": "Appointment Confirmation with Dr. Smith",
        "createdAt": "2026-04-16T12:00:00Z",
        "channels": {
          "email": { "sent": true },
          "sms": { "sent": true }
        }
      }
    ],
    "total": 15
  }
}
```

---

## Integration with Other Services

### Appointment Service
After creating an appointment, call:
```javascript
import { notifyAppointmentBooked } from '../../services/notificationApi';

await notifyAppointmentBooked({
  patientId: appointment.patientId,
  patientName: patient.name,
  patientEmail: patient.email,
  patientPhone: patient.phone,
  doctorId: appointment.doctorId,
  doctorName: doctor.name,
  appointmentId: appointment._id,
  appointmentDate: appointment.date,
  appointmentTime: appointment.time,
});
```

### Consultation Service
After completing a consultation:
```javascript
import { notifyConsultationCompleted } from '../../services/notificationApi';

await notifyConsultationCompleted({
  patientId: consultation.patientId,
  patientName: patient.name,
  patientEmail: patient.email,
  patientPhone: patient.phone,
  doctorName: doctor.name,
  consultationId: consultation._id,
  prescriptionLink: `${APP_URL}/patient/prescriptions/${consultation._id}`,
});
```

### Payment Service
After successful payment:
```javascript
import { notifyPaymentReceived } from '../../services/notificationApi';

await notifyPaymentReceived({
  patientId: payment.patientId,
  patientName: patient.name,
  patientEmail: patient.email,
  patientPhone: patient.phone,
  doctorName: doctor.name,
  amount: payment.amount,
  transactionId: payment.transactionId,
  paymentId: payment._id,
});
```

---

## Email Templates

### Appointment Booked
- **Subject:** Appointment Confirmation with Dr. {doctorName}
- **Contains:** Doctor name, date, time, next steps
- **HTML formatted** with MediConnect branding

### Consultation Completed
- **Subject:** Consultation Complete - Your Report from Dr. {doctorName}
- **Contains:** Report link, included documents, follow-up
- **Direct link** to prescription & report

### Appointment Cancelled
- **Subject:** Appointment Cancelled - Dr. {doctorName}
- **Contains:** Cancellation date, rebooking option
- **Clear rescheduling** instructions

### Payment Received
- **Subject:** Payment Receipt - MediConnect Consultation
- **Contains:** Doctor name, amount, transaction ID
- **Receipt** downloadable from account

---

## SMS Templates

Brief, concise SMS messages include:
- Appointment confirmation with date/time
- Consultation completion with app link
- Payment confirmation with amount
- Cancellation notice with date

Example:
```
MediConnect: Your appointment with Dr. Smith is confirmed for 2026-04-20 at 2:00 PM. Visit your app to complete payment.
```

---

## Database Schema

### Notification Document
```javascript
{
  _id: ObjectId,
  recipient: {
    userId: ObjectId,
    email: String,
    phone: String,
    name: String,
    role: "patient" | "doctor" | "admin"
  },
  type: "appointment_booked" | "consultation_completed" | "payment_received" | ...,
  subject: String,
  message: String,
  htmlContent: String,
  relatedEntity: {
    entityType: "appointment" | "consultation" | "payment" | ...,
    entityId: ObjectId
  },
  channels: {
    email: { sent: Boolean, sentAt: Date, error: String },
    sms: { sent: Boolean, sentAt: Date, error: String },
    inApp: { sent: Boolean, sentAt: Date, read: Boolean, readAt: Date }
  },
  status: "pending" | "sending" | "sent" | "failed" | "delivered",
  retryCount: Number,
  lastRetryAt: Date,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Email Not Sending
1. **Check Gmail credentials:**
   - Verify EMAIL_USER and EMAIL_PASS in `.env`
   - Ensure App Password is correctly set (16 chars, no spaces)
   - Enable "Less secure app access" if needed

2. **Check SMTP settings:**
   ```
   Service: gmail
   Host: smtp.gmail.com
   Port: 587
   ```

### SMS Not Sending
1. **Verify Twilio setup:**
   - Check TWILIO_ACCOUNT_SID in `.env`
   - Ensure TWILIO_PHONE_NUMBER is valid
   - Check account balance

2. **Phone number format:**
   - Must include country code (e.g., `+94701234567`)
   - Use E.164 format

### Notifications Tracking
Monitor notification status in MongoDB:
```javascript
db.notifications.find({ type: "appointment_booked", status: "failed" })
```

---

## Environment Variables Reference

```env
# Server
PORT=5007
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=MediConnect

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Service URLs
AUTH_SERVICE_URL=http://localhost:5001
APPOINTMENT_SERVICE_URL=http://localhost:5004
CONSULTATION_SERVICE_URL=http://localhost:5003
PATIENT_SERVICE_URL=http://localhost:5002
DOCTOR_SERVICE_URL=http://localhost:5005
```

---

## Future Enhancements

- 🔔 Push notifications via Firebase
- 📧 Email template customization UI
- ⏰ Scheduled/reminder notifications
- 📊 Notification analytics dashboard
- 🔄 Retry mechanism with exponential backoff
- 🌍 Multi-language support
- 📲 In-app notification center
- ✅ Delivery confirmation tracking

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Support:** dev@mediconnect.app
