# Notification Service

> Dedicated microservice for handling all patient and doctor notifications via Email and SMS channels.

## 📋 Overview

The Notification Service is a critical component of the MediConnect healthcare platform that ensures timely delivery of confirmations, reminders, and important updates to patients and doctors via multiple channels.

**Service Port:** `5007`  
**Technology Stack:** Node.js, Express, MongoDB, Nodemailer, Twilio

## ✨ Features

### Multi-Channel Notifications
- ✉️ **Email** - HTML-formatted emails via Gmail SMTP
- 📱 **SMS** - Text messages via Twilio  
- 📋 **In-App** - Track notification history with status

### Supported Notification Types
1. **Appointment Booked** - Confirmation to patient and doctor
2. **Consultation Completed** - Report delivery notification
3. **Appointment Cancelled** - Cancellation confirmation
4. **Payment Received** - Receipt confirmation

### Built-in Features
- ✅ Automatic retry mechanism for failed notifications
- ✅ Multiple channel support (email, SMS, in-app)
- ✅ Notification history and tracking
- ✅ MongoDB persistence for audit trail
- ✅ Comprehensive error handling and logging
- ✅ Professional HTML email templates with branding
- ✅ Development fallback for SMS testing

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd services/notification-service
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in credentials:
```bash
cp .env.example .env
```

Update with your credentials:
```env
# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Start the Service
```bash
npm run dev
# or
npm start
```

Expected output:
```
Notification service running on port 5007
MongoDB Connected: cluster0-shard-00-01...
```

### 4. Test the Service
```bash
curl http://localhost:5007/api/notifications/health
# Response: { "status": "ok", "service": "Notification Service" }
```

---

## 📡 API Endpoints

### Health Check
```http
GET /api/notifications/health
```

### Send Appointment Booked Notification
```http
POST /api/notifications/appointment-booked
Content-Type: application/json

{
  "patientId": "user_id",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorId": "doctor_id",
  "doctorName": "Dr. Smith",
  "appointmentId": "appointment_id",
  "appointmentDate": "2026-04-20",
  "appointmentTime": "2:00 PM"
}
```

### Send Consultation Completed Notification
```http
POST /api/notifications/consultation-completed
Content-Type: application/json

{
  "patientId": "user_id",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorName": "Dr. Smith",
  "consultationId": "consultation_id",
  "prescriptionLink": "https://mediconnect.app/prescriptions/abc123"
}
```

### Send Appointment Cancelled Notification
```http
POST /api/notifications/appointment-cancelled
Content-Type: application/json

{
  "patientId": "user_id",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorName": "Dr. Smith",
  "appointmentId": "appointment_id",
  "appointmentDate": "2026-04-20"
}
```

### Send Payment Received Notification
```http
POST /api/notifications/payment-received
Content-Type: application/json

{
  "patientId": "user_id",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+94701234567",
  "doctorName": "Dr. Smith",
  "amount": 1500,
  "transactionId": "TXN-20260416-001",
  "paymentId": "payment_id"
}
```

### Get User Notifications
```http
GET /api/notifications/:userId?limit=20&skip=0
```

Response:
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

## 📁 Project Structure

```
notification-service/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express app setup
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   └── Notification.js    # MongoDB schema
│   ├── services/
│   │   ├── emailService.js    # Email sending (Nodemailer)
│   │   └── smsService.js      # SMS sending (Twilio)
│   ├── controllers/
│   │   └── notificationController.js  # Business logic
│   └── routes/
│       └── notificationRoutes.js      # API endpoints
├── package.json
├── .env
├── Dockerfile
├── .gitignore
├── SETUP.md                   # Detailed setup guide
└── README.md                  # This file
```

---

## 🔌 Integration Guide

### With Appointment Service

After creating an appointment, trigger notification:

```javascript
import { notifyAppointmentBooked } from '../../services/notificationApi';

// In appointment creation handler
const appointment = await Appointment.create({ /* ... */ });

await notifyAppointmentBooked({
  patientId: appointment.patientId,
  patientName: appointmentPatient.name,
  patientEmail: appointmentPatient.email,
  patientPhone: appointmentPatient.phone,
  doctorId: appointment.doctorId,
  doctorName: appointmentDoctor.name,
  appointmentId: appointment._id,
  appointmentDate: appointment.date,
  appointmentTime: appointment.time,
});
```

### With Consultation Service

After consultation completion:

```javascript
import { notifyConsultationCompleted } from '../../services/notificationApi';

// In consultation completion handler
const consultation = await Consultation.findByIdAndUpdate(
  consultationId,
  { status: 'completed' }
);

await notifyConsultationCompleted({
  patientId: consultation.patientId,
  patientName: patient.name,
  patientEmail: patient.email,
  patientPhone: patient.phone,
  doctorName: doctor.name,
  consultationId: consultation._id,
  prescriptionLink: `https://mediconnect.app/patient/prescriptions/${consultation._id}`,
});
```

### With Payment Service

After successful payment:

```javascript
import { notifyPaymentReceived } from '../../services/notificationApi';

// In payment success handler
const payment = await Payment.create({ /* ... */ });

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

## 🔐 Email Setup (Gmail)

### Generate App-Specific Password

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App passwords** (appears after 2FA is enabled)
4. Select "Mail" and "Windows Computer"
5. Generate a 16-character password
6. Copy and save this password

### Update `.env`
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=MediConnect
```

---

## 📲 SMS Setup (Twilio)

### Create Twilio Account

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Verify your email and phone number
3. Go to **Console Dashboard**
4. Copy your **Account SID**
5. Generate **Auth Token**
6. Get or create a **Phone Number**

### Update `.env`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx...
TWILIO_AUTH_TOKEN=your_auth_token...
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 💾 Database Schema

**Notification Collection:**

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `recipient.userId` | ObjectId | User ID |
| `recipient.email` | String | Email address |
| `recipient.phone` | String | Phone number |
| `type` | String | Notification type |
| `status` | String | pending, sending, sent, failed |
| `channels` | Object | Email/SMS/In-app status |
| `channels.email.sent` | Boolean | Email sent successfully |
| `channels.sms.sent` | Boolean | SMS sent successfully |
| `relatedEntity` | Object | Link to appointment/consultation/payment |
| `retryCount` | Number | Number of retry attempts |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Update timestamp |

---

## 🐛 Troubleshooting

### Email Not Sending

**Problem:** Emails not being delivered

**Solutions:**
1. Check `.env` credentials are correct
2. Verify Gmail App Password (no spaces, 16 characters)
3. Ensure 2FA is enabled for Gmail account
4. Check spam/junk folder
5. Review service logs: `npm run dev`

### SMS Not Sending

**Problem:** SMS messages not delivered

**Solutions:**
1. Verify Twilio credentials in `.env`
2. Check Twilio account has balance
3. Ensure phone numbers include country code (+94, +1, etc.)
4. Verify phone number format (E.164): `+[country code][number]`
5. Check Twilio SMS logs in dashboard

### MongoDB Connection Failing

**Problem:** Cannot connect to MongoDB

**Solutions:**
1. Verify `MONGODB_URI` in `.env`
2. Check MongoDB cluster whitelist IP
3. Ensure credentials are URL-encoded
4. Test connection string in MongoDB Compass

### Port Already in Use

**Problem:** Port 5007 already in use

**Solutions:**
```bash
# Find process using port 5007 (Windows)
netstat -ano | findstr :5007

# Kill process
taskkill /PID <PID> /F
```

---

## 📊 Monitoring & Logs

### View Service Logs
```bash
npm run dev
```

### Check Notification Status
```bash
# MongoDB shell
db.notifications.find({ type: "appointment_booked" }).sort({ createdAt: -1 }).limit(10)

# Failed notifications
db.notifications.find({ status: "failed" })

# Notifications by user
db.notifications.find({ "recipient.userId": ObjectId("...") })
```

### Gmail Logs
- Check Gmail "Activity on your Google Account" section
- Review less secure app access logs

### Twilio Logs
- Dashboard → Logs → Message Logs
- Check SMS delivery status and error codes

---

## 🚢 Docker Deployment

### Build Docker Image
```bash
docker build -t notification-service:latest .
```

### Run in Docker
```bash
docker run \
  -p 5007:5007 \
  -e MONGODB_URI=mongodb://... \
  -e EMAIL_USER=... \
  -e EMAIL_PASS=... \
  -e TWILIO_ACCOUNT_SID=... \
  -e TWILIO_AUTH_TOKEN=... \
  -e TWILIO_PHONE_NUMBER=... \
  notification-service:latest
```

### Docker Compose
Already configured in root `docker-compose.yml`

---

## 🔒 Security Considerations

1. **Always use environment variables** for credentials
2. **Never commit `.env` file** - use `.env.example`
3. **Use HTTPS** for production API calls
4. **Rate limit** notification endpoints (prevent spam)
5. **Validate all inputs** before sending notifications
6. **Add authentication middleware** to protect endpoints
7. **Encrypt sensitive data** in MongoDB
8. **Monitor service logs** for suspicious activity

---

## 📈 Performance Tips

1. **Use async/await** for non-blocking operations
2. **Batch notifications** if sending multiple
3. **Index MongoDB** on frequently queried fields
4. **Cache frequently accessed data**
5. **Use connection pooling** for SMS/Email services
6. **Monitor service memory** usage

---

## 🧪 Testing

### Test Email Sending
```javascript
// In your test file
const { notifyAppointmentBooked } = require('./services/notificationApi');

await notifyAppointmentBooked({
  patientId: 'test-user-1',
  patientName: 'Test Patient',
  patientEmail: 'your-test-email@gmail.com',
  patientPhone: '+94701234567',
  doctorId: 'test-doctor-1',
  doctorName: 'Dr. Test',
  appointmentId: 'test-apt-1',
  appointmentDate: '2026-04-20',
  appointmentTime: '2:00 PM',
});
```

### Test SMS Sending
Check Twilio console for delivery status

---

## 🤝 Contributing

1. Follow existing code style
2. Add comments for complex logic
3. Test before committing
4. Update documentation for API changes
5. Keep security best practices

---

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [API_CONTRACT.md](../docs/API_CONTRACT.md) - API specifications
- [Nodemailer Docs](https://nodemailer.com/)
- [Twilio Docs](https://www.twilio.com/docs/)

---

## 📞 Support

For issues or questions:
- Check [SETUP.md](./SETUP.md) troubleshooting section
- Review service logs with `npm run dev`
- Check MongoDB documents for notification status
- Verify credentials in `.env`

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready ✅
