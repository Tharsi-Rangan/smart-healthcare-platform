# 📬 Healthcare Platform - Notifications Comprehensive Guide

## System Overview

The notification system sends notifications to **three roles**: Patient, Doctor, and Admin through multiple channels (Email, SMS, In-App).

---

## 📋 Notification Types & Recipients

### 1. **APPOINTMENT_BOOKED** 📅
- **Recipient**: PATIENT
- **Triggered When**: Patient books an appointment with a doctor
- **Channels**: 
  - 📧 Email (appointment details, doctor info)
  - 📱 SMS (quick notification)
  - 🔔 In-App (notification bell)
- **Content Includes**:
  - Doctor name
  - Appointment date and time
  - Type of consultation (online/offline)

**Example Flow**:
```
Patient clicks "Book Appointment" 
    → Appointment Service creates appointment 
    → Notification Service sends EMAIL + SMS + In-App notification
    → Patient sees notification bell badge
```

---

### 2. **APPOINTMENT_CONFIRMED** ✅
- **Recipient**: PATIENT
- **Triggered When**: Admin approves the appointment request
- **Channels**: 
  - 📧 Email
  - 📱 SMS
  - 🔔 In-App
- **Content Includes**:
  - Confirmation message
  - Doctor details
  - Payment requirement information

**Workflow**:
```
Admin reviews pending appointment
    → Admin clicks "Approve/Confirm"
    → Appointment status changed to "confirmed"
    → Notification sent to patient
    → Patient can now proceed with payment
```

---

### 3. **APPOINTMENT_CANCELLED** ❌
- **Recipient**: PATIENT
- **Triggered When**: Appointment is cancelled (by doctor, admin, or patient)
- **Channels**: 
  - 📧 Email (cancellation details)
  - 📱 SMS (urgent notification)
  - 🔔 In-App
- **Content Includes**:
  - Cancellation reason (if provided)
  - Doctor name
  - Appointment date that was cancelled

**Trigger Points**:
- Doctor cancels appointment
- Admin cancels appointment  
- Patient cancels appointment
- System auto-cancels due to missed deadline

---

### 4. **PAYMENT_RECEIVED** 💰
- **Recipient**: PATIENT
- **Triggered When**: Payment for an appointment is successfully received and verified
- **Channels**: 
  - 📧 Email (payment receipt, transaction details)
  - 📱 SMS (payment confirmation)
  - 🔔 In-App
- **Content Includes**:
  - Amount paid
  - Transaction ID
  - Doctor name
  - Payment method used
  - Receipt link

**Payment Flow**:
```
Patient initiates payment
    → Payment Gateway (PayHere) processes
    → Webhook callback to Payment Service
    → Payment status updated to "completed"
    → Notification Service sends notification
    → Patient receives confirmation
```

---

### 5. **PAYMENT_APPROVED_BY_ADMIN** 👨‍💼
- **Recipient**: PATIENT
- **Triggered When**: Admin approves/verifies the payment
- **Channels**: 
  - 📧 Email
  - 📱 SMS
  - 🔔 In-App
- **Content Includes**:
  - Payment approval confirmation
  - Admin notes (if any)
  - Appointment status (ready to join)

**Admin Payment Management**:
```
Admin views TransactionsPage
    → Admin reviews payment details
    → Admin clicks "Approve Payment"
    → Payment status: "completed" → adminStatus: "approved"
    → Notification sent to patient
    → Patient can now join video consultation
```

---

### 6. **CONSULTATION_STARTED** 🎥
- **Recipient**: PATIENT
- **Triggered When**: Doctor opens/starts the video consultation session
- **Channels**: 
  - 📧 Email (optional)
  - 🔔 In-App (priority)
- **Content Includes**:
  - Doctor name
  - Join instruction
  - Session link
  - Time details

**Video Session Flow**:
```
Doctor opens video room
    → Doctor clicks "Start Session"
    → Consultation Service notifies patient
    → Patient receives "Doctor started consultation" alert
    → Patient can click "Join Session" to enter Jitsi
```

---

### 7. **PATIENT_JOINED_SESSION** 👤
- **Recipient**: DOCTOR
- **Triggered When**: Patient joins the video consultation room
- **Channels**: 
  - 🔔 In-App (real-time, important)
- **Content Includes**:
  - Patient name
  - Appointment time
  - Join instruction
  - "Please join now" message

**Real-time Notification**:
```
Patient clicks "Join Session" button
    → Patient joins Jitsi room
    → AppointmentsPage.jsx calls notifyDoctorPatientJoined()
    → API sends notification to doctor
    → Doctor receives alert: "Patient Name has joined"
    → Doctor sees notification in bell icon
```

**Code Location**:
```javascript
// frontend/src/pages/patient/AppointmentsPage.jsx (line ~120)
await notifyDoctorPatientJoined(
  appt._id,
  appt.doctorId,
  user?.name || 'Patient',
  appt.appointmentTime
);
```

---

### 8. **CONSULTATION_COMPLETED** 📋
- **Recipient**: PATIENT
- **Triggered When**: Doctor marks the consultation as completed
- **Channels**: 
  - 📧 Email (with prescription summary)
  - 📱 SMS
  - 🔔 In-App
- **Content Includes**:
  - Doctor name
  - Prescription summary
  - Link to prescription page
  - Next steps

**Post-Consultation Workflow**:
```
Doctor closes video session
    → Doctor updates appointment status to "completed"
    → Doctor issues prescription
    → Notification Service sends email with prescription link
    → Patient receives notification
    → Patient can access prescriptions in dashboard
```

---

### 9. **PRESCRIPTION_ISSUED** 💊
- **Recipient**: PATIENT
- **Triggered When**: Doctor creates and issues a new prescription after consultation
- **Channels**: 
  - 📧 Email (prescription details)
  - 🔔 In-App
- **Content Includes**:
  - Doctor name
  - Prescription items list
  - Dosage instructions
  - Duration of prescription
  - Pharmacy contact info

**Prescription Flow**:
```
Doctor completes consultation
    → Doctor navigates to prescriptions
    → Doctor adds prescription items (medicines, dosage, duration)
    → Doctor clicks "Issue Prescription"
    → Notification sent to patient
    → Patient can view in "Prescriptions" page
```

---

### 10. **DOCTOR_REGISTRATION** 📝
- **Recipient**: ADMIN
- **Triggered When**: New doctor registers on the platform
- **Channels**: 
  - 📧 Email (pending verification info)
  - 📱 SMS (optional)
- **Content Includes**:
  - Doctor name
  - Specialization
  - License number
  - Email
  - Status (Pending Verification)

**Admin Workflow**:
```
Doctor completes registration
    → Doctor submits documents
    → Notification sent to admin
    → Admin goes to "Manage Users" page
    → Admin verifies and approves doctor
    → Doctor account activated
    → Welcome email sent to doctor
```

---

### 11. **PAYMENT_REJECTED** 🚫
- **Recipient**: PATIENT
- **Triggered When**: Admin rejects a payment with a reason
- **Channels**: 
  - 📧 Email (rejection reason)
  - 🔔 In-App
- **Content Includes**:
  - Rejection reason
  - Instructions to resubmit
  - Doctor contact info

**Rejection Workflow**:
```
Admin reviews payment on TransactionsPage
    → Admin clicks "Reject Payment"
    → Admin enters rejection reason
    → Payment status: completed → "refunded"
    → adminStatus: "rejected"
    → Notification sent to patient
    → Patient sees alert to resubmit payment
```

---

### 12. **GENERAL** 📢
- **Recipient**: ANY (Patient, Doctor, Admin)
- **Triggered When**: System-wide announcements or miscellaneous notifications
- **Channels**: 
  - 📧 Email
  - 🔔 In-App
- **Content Includes**:
  - Custom message
  - System information

---

## 📊 Notification Matrix - Who Gets What?

| Notification Type | PATIENT | DOCTOR | ADMIN | Channels |
|---|---|---|---|---|
| Appointment Booked | ✅ | - | - | Email, SMS, In-App |
| Appointment Confirmed | ✅ | - | - | Email, SMS, In-App |
| Appointment Cancelled | ✅ | - | - | Email, SMS, In-App |
| Payment Received | ✅ | - | - | Email, SMS, In-App |
| Payment Approved | ✅ | - | - | Email, SMS, In-App |
| Payment Rejected | ✅ | - | - | Email, In-App |
| Consultation Started | ✅ | - | - | In-App |
| Patient Joined Session | - | ✅ | - | In-App |
| Consultation Completed | ✅ | - | - | Email, SMS, In-App |
| Prescription Issued | ✅ | - | - | Email, In-App |
| Doctor Registration | - | - | ✅ | Email, SMS |
| General Announcement | ✅ | ✅ | ✅ | Email, In-App |

---

## 🔌 Notification Channels

### **1. Email** 📧
- **Service**: Nodemailer (SMTP)
- **Configuration**: `.env` file with email provider credentials
- **Templates**: HTML formatted with branding
- **Status Tracking**: Success/Failure logged

**Example Email Addresses**:
- Patient: From appointment booking email
- Doctor: From doctor profile
- Admin: From system configuration

### **2. SMS** 📱
- **Service**: Twilio
- **Configuration**: API credentials in `.env`
- **Status**: Optional (only if phone number exists)
- **Content**: Brief, text-only format

**When Enabled**:
```env
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### **3. In-App** 🔔
- **Storage**: MongoDB Notifications collection
- **Display**: NotificationBell component in header
- **Features**:
  - Auto-polling every 30 seconds
  - Unread count badge
  - Dropdown preview
  - Full notifications page for details
  - Mark as read functionality

---

## 🎯 Notification Delivery Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTIFICATION TRIGGER                       │
│  (Appointment booked, Payment received, etc.)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            NOTIFICATION SERVICE                              │
│  - Create notification record (MongoDB)                     │
│  - Generate email template                                  │
│  - Prepare SMS content                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
      ┌────────┐ ┌────────┐ ┌────────┐
      │ EMAIL  │ │  SMS   │ │IN-APP  │
      │ SENT   │ │ SENT   │ │ STORED │
      └────────┘ └────────┘ └────────┘
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
      ┌──────────────────────────────┐
      │   RECIPIENT RECEIVES          │
      │   Notification on device      │
      └──────────────────────────────┘
```

---

## 🔄 Real-Time Notifications (In-App)

### Polling Strategy
- **Interval**: Every 30 seconds
- **Component**: NotificationBell in header layouts
- **Auto-Updates**: Without page refresh

**Frontend Implementation**:
```javascript
// frontend/src/components/common/NotificationBell.jsx
useEffect(() => {
  const interval = setInterval(fetchNotifications, 30000); // 30 seconds
  return () => clearInterval(interval);
}, []);
```

### Notification Bell Features
1. **Unread Count Badge**: Shows number of unread notifications
2. **Dropdown Menu**: Last 10 notifications quick preview
3. **Full Page**: `/admin/notifications`, `/doctor/notifications`, `/patient/notifications`
4. **Mark as Read**: Individual or bulk mark read
5. **Delete**: Remove notifications

---

## 🗄️ Notification Data Model

```javascript
{
  _id: ObjectId,
  
  // RECIPIENT DETAILS
  recipient: {
    userId: ObjectId,
    email: String,
    phone: String,
    name: String,
    role: ['patient' | 'doctor' | 'admin']
  },
  
  // NOTIFICATION CONTENT
  type: ['appointment_booked' | 'payment_received' | ...],
  subject: String,
  message: String,
  htmlContent: String,
  
  // RELATED ENTITY
  relatedEntity: {
    entityType: String,
    entityId: ObjectId
  },
  
  // DELIVERY CHANNELS
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
    inApp: {
      sent: Boolean,
      sentAt: Date,
      read: Boolean,
      readAt: Date
    }
  },
  
  status: ['sending' | 'sent' | 'failed'],
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 How to Trigger Notifications

### Example 1: Trigger Appointment Booked Notification
```javascript
// From Appointment Service after successful booking
const response = await notifyAppointmentBooked({
  patientId: patient._id,
  patientName: patient.name,
  patientEmail: patient.email,
  patientPhone: patient.phone,
  doctorId: doctor._id,
  doctorName: doctor.name,
  appointmentId: appointment._id,
  appointmentDate: appointment.appointmentDate,
  appointmentTime: appointment.appointmentTime
});
```

### Example 2: Notify Doctor When Patient Joins
```javascript
// From Patient AppointmentsPage when patient joins video
await notifyDoctorPatientJoined(
  appointmentId,
  doctorId,
  patientName,
  appointmentTime
);
```

### Example 3: Send Payment Notification
```javascript
// From Payment Service after successful payment
await notifyPaymentReceived({
  patientId: patient._id,
  patientName: patient.name,
  patientEmail: patient.email,
  patientPhone: patient.phone,
  doctorName: doctor.name,
  amount: payment.amount,
  transactionId: payment.transactionId,
  paymentId: payment._id
});
```

---

## 📱 Frontend Notification Integration

### Pages with Notification Bell
1. **Admin Dashboard** - `/admin/dashboard`
2. **Doctor Dashboard** - `/doctor/dashboard`
3. **Patient Dashboard** - `/patient/dashboard`

### Notification Pages (Full View)
1. `/admin/notifications`
2. `/doctor/notifications`
3. `/patient/notifications`

### Features
- Search notifications
- Filter by type
- Filter by status (read/unread)
- Statistics (total, by type)
- Bulk actions (mark all as read, delete all)
- Individual delete

---

## 🔐 Security & Privacy

1. **JWT Authentication**: Only authenticated users can fetch their notifications
2. **Role-Based Access**: Users only see notifications meant for their role
3. **User Isolation**: Patients can't see doctor notifications, etc.
4. **Sensitive Data**: Email addresses not exposed in frontend
5. **Error Handling**: Delivery failures logged but not revealed to users

---

## 📊 Monitoring & Logs

### Where to Check
1. **Server Logs**: Console output from notification service
2. **Database**: Check Notification records for delivery status
3. **Frontend**: Browser console shows notification fetch attempts
4. **Email Logs**: Check email service provider dashboard

### Common Log Patterns
```
[Notification] Sending appointment booked notification to patient@email.com
[Notification] Doctor registration notification sent to admin@email.com
[Notification] Patient joined consultation for doctor
[Notification] Error: SMTP connection failed
```

---

## 🛠️ Environment Variables

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Notification Service Port
NOTIFICATION_SERVICE_PORT=5005

# Disable Notifications (for development)
SEND_NOTIFICATIONS=true|false
```

---

## ✅ Testing Notifications

### Manual Testing Checklist
- [ ] Book appointment → Patient receives in-app notification
- [ ] Confirm appointment → Patient gets email + SMS + in-app
- [ ] Process payment → Payment notification sent
- [ ] Join video session → Doctor gets real-time notification
- [ ] Issue prescription → Patient receives prescription notification
- [ ] Check notification bell → Shows unread count
- [ ] Mark as read → Updates status
- [ ] Visit notifications page → All notifications displayed

### Debug Tips
1. Check browser console for API call errors
2. Check notification service logs for sending errors
3. Verify email credentials in `.env`
4. Check MongoDB for notification records
5. Use test accounts with real email addresses

---

## 🎓 Summary

The notification system is **comprehensive** with:
- ✅ **10+ notification types**
- ✅ **3 delivery channels** (Email, SMS, In-App)
- ✅ **Role-based delivery** (Patient, Doctor, Admin)
- ✅ **Real-time in-app notifications** with 30s polling
- ✅ **Persistent storage** in MongoDB
- ✅ **Status tracking** for each delivery attempt
- ✅ **Error handling** and logging
- ✅ **User-friendly UI** with bell icon and dashboard

This ensures users never miss important updates about their appointments, payments, consultations, or prescriptions!
