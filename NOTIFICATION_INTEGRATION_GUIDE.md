# 🔗 Notification Service Integration Guide

This guide shows how to integrate the notification service with other microservices (Appointment, Payment, Consultation).

---

## 📋 Integration Checklist

- [ ] Add notification helper to `shared/utils/notificationHelper.js`
- [ ] Add calls to appointment service
- [ ] Add calls to payment service
- [ ] Add calls to consultation service
- [ ] Test end-to-end flow
- [ ] Enable/disable notifications via environment flags

---

## 🔧 Step 1: Shared Notification Helper

Create a reusable helper to send notifications from any service:

**File:** `shared/utils/notificationHelper.js`

```javascript
import axios from 'axios';

const notificationClient = axios.create({
  baseURL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5008/api',
  timeout: 5000,
});

/**
 * Send appointment booked notification
 */
export const notifyAppointmentBooked = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorId,
  doctorName,
  appointmentId,
  appointmentDate,
  appointmentTime,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('[Notification] Skipped (disabled via env)');
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/appointment-booked', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName,
      appointmentId,
      appointmentDate,
      appointmentTime,
    });
    return response.data;
  } catch (error) {
    console.error('[notifyAppointmentBooked] Error:', error.message);
    // Don't throw - notifications shouldn't block main flow
    return { success: false, error: error.message };
  }
};

/**
 * Send consultation completed notification
 */
export const notifyConsultationCompleted = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  consultationId,
  prescriptionLink,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('[Notification] Skipped (disabled via env)');
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/consultation-completed', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      consultationId,
      prescriptionLink,
    });
    return response.data;
  } catch (error) {
    console.error('[notifyConsultationCompleted] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment cancelled notification
 */
export const notifyAppointmentCancelled = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  appointmentId,
  appointmentDate,
  cancellationReason,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/appointment-cancelled', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      appointmentId,
      appointmentDate,
      cancellationReason,
    });
    return response.data;
  } catch (error) {
    console.error('[notifyAppointmentCancelled] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment received notification
 */
export const notifyPaymentReceived = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  amount,
  transactionId,
  paymentId,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/payment-received', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      amount,
      transactionId,
      paymentId,
    });
    return response.data;
  } catch (error) {
    console.error('[notifyPaymentReceived] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send doctor registration notification to admin
 */
export const notifyDoctorRegistration = async ({
  doctorId,
  doctorName,
  doctorEmail,
  doctorPhone,
  specialization,
  licenseNumber,
  adminEmail,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/doctor-registration', {
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone,
      specialization,
      licenseNumber,
      adminEmail,
    });
    return response.data;
  } catch (error) {
    console.error('[notifyDoctorRegistration] Error:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  notifyAppointmentBooked,
  notifyConsultationCompleted,
  notifyAppointmentCancelled,
  notifyPaymentReceived,
  notifyDoctorRegistration,
};
```

---

## 🏥 Step 2: Appointment Service Integration

**File:** `services/appointment-service/src/controllers/appointmentController.js`

```javascript
import { notifyAppointmentBooked, notifyAppointmentCancelled } from '../../../shared/utils/notificationHelper.js';

/**
 * Create appointment controller
 */
export const createAppointmentController = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;
    const patientId = req.user.id;

    // ... existing validation code ...

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      status: 'pending',
      // ... other fields
    });

    // Get patient and doctor details
    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    // Send notification (async - don't wait for it)
    notifyAppointmentBooked({
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorId: doctor._id,
      doctorName: doctor.name,
      appointmentId: appointment._id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
    }).catch(error => console.error('[Notification] Failed to send:', error));

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment controller
 */
export const cancelAppointmentController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const patientId = req.user.id;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    await appointment.save();

    // Get patient and doctor details
    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(appointment.doctorId);

    // Send cancellation notification
    notifyAppointmentCancelled({
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorName: doctor.name,
      appointmentId: appointment._id,
      appointmentDate: appointment.appointmentDate,
      cancellationReason: reason,
    }).catch(error => console.error('[Notification] Failed to send:', error));

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 💳 Step 3: Payment Service Integration

**File:** `services/payment-service/src/controllers/paymentController.js`

```javascript
import { notifyPaymentReceived } from '../../../shared/utils/notificationHelper.js';

/**
 * PayHere webhook handler
 */
export const payhereNotify = async (req, res, next) => {
  try {
    const { merchant_id, order_id, payhere_amount, payment_id, status_code } = req.body;

    // ... existing validation code ...

    // Update payment status
    const payment = await Payment.findByIdAndUpdate(
      payment_id,
      {
        status: status_code === 2 ? 'completed' : 'failed',
        transactionId: merchant_id,
        paidAt: new Date(),
      },
      { new: true }
    );

    // If payment successful, send notification
    if (payment.status === 'completed') {
      const patient = await Patient.findById(payment.patientId);
      const doctor = await Doctor.findById(payment.doctorId);

      notifyPaymentReceived({
        patientId: payment.patientId,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        doctorName: doctor.name,
        amount: payment.amount,
        transactionId: merchant_id,
        paymentId: payment._id,
      }).catch(error => console.error('[Notification] Failed to send:', error));
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📹 Step 4: Consultation Service Integration

**File:** `services/consultation-service/src/controllers/consultationController.js`

```javascript
import { notifyConsultationCompleted } from '../../../shared/utils/notificationHelper.js';

/**
 * End consultation controller
 */
export const endConsultationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { doctorNotes } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // End consultation
    consultation.status = 'completed';
    consultation.endedAt = new Date();
    consultation.doctorNotes = doctorNotes;
    await consultation.save();

    // Get patient and doctor details
    const patient = await Patient.findById(consultation.patientId);
    const doctor = await Doctor.findById(consultation.doctorId);

    // Build prescription link
    const prescriptionLink = `${process.env.FRONTEND_BASE_URL}/patient/prescriptions/${consultation._id}`;

    // Send consultation completed notification
    notifyConsultationCompleted({
      patientId: consultation.patientId,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorName: doctor.name,
      consultationId: consultation._id,
      prescriptionLink,
    }).catch(error => console.error('[Notification] Failed to send:', error));

    res.status(200).json({
      success: true,
      message: 'Consultation ended',
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🌍 Step 5: Environment Configuration

Add to `.env` files:

**`services/appointment-service/.env`**
```env
NOTIFICATION_SERVICE_URL=http://localhost:5008/api
SEND_NOTIFICATIONS=true
```

**`services/payment-service/.env`**
```env
NOTIFICATION_SERVICE_URL=http://localhost:5008/api
SEND_NOTIFICATIONS=true
```

**`services/consultation-service/.env`**
```env
NOTIFICATION_SERVICE_URL=http://localhost:5008/api
SEND_NOTIFICATIONS=true
```

---

## ✅ Testing Integration

### 1. Create Appointment → Notification Sent
```bash
# Terminal 1
cd services/notification-service
npm run dev

# Terminal 2
cd services/appointment-service
npm run dev

# Terminal 3: Test API
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "doctor_id",
    "appointmentDate": "2026-04-25",
    "appointmentTime": "2:00 PM",
    "reason": "Checkup"
  }'
```

### 2. Complete Payment → Notification Sent
When PayHere webhook is called → Patient gets notification

### 3. End Consultation → Notification Sent
```bash
curl -X POST http://localhost:5000/api/consultations/123/end \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorNotes": "Patient is healthy. Continue medication."
  }'
```

---

## 📊 Monitoring

Check sent notifications in MongoDB:

```bash
# Connect to MongoDB
mongo

# Show all sent notifications
db.notifications.find({ status: 'sent' }).pretty()

# Show failed notifications
db.notifications.find({ status: 'failed' }).pretty()

# Count by type
db.notifications.aggregate([
  { $group: { _id: '$type', count: { $sum: 1 } } }
])
```

---

## 🐛 Debugging

Enable detailed logging:

```env
DEBUG=notification:*
LOG_LEVEL=debug
```

Check service logs:

```bash
# Appointment service logs
tail -f logs/appointment-service.log | grep -i notif

# Payment service logs
tail -f logs/payment-service.log | grep -i notif

# Notification service logs
tail -f logs/notification-service.log
```

---

## 🎯 Complete Flow

```
1. Patient books appointment
   ↓
2. Appointment Service → Create in DB
   ↓
3. Appointment Service → Call Notification Service
   ↓
4. Notification Service → Send Email + SMS
   ↓
5. Patient receives confirmation email & SMS
   ↓
6. Patient completes payment via PayHere
   ↓
7. PayHere → Payment Service webhook
   ↓
8. Payment Service → Call Notification Service
   ↓
9. Notification Service → Send payment receipt
   ↓
10. Patient receives payment confirmation
    ↓
11. Patient & Doctor join consultation
    ↓
12. Doctor completes consultation
    ↓
13. Consultation Service → Call Notification Service
    ↓
14. Notification Service → Send completion notification
    ↓
15. Patient receives consultation report & prescription
```

---

## ✨ Success Criteria

- [ ] Emails arrive in patient inbox
- [ ] SMS arrives on patient phone
- [ ] WhatsApp optional (can enable if needed)
- [ ] Notification logs stored in MongoDB
- [ ] Retries work if first attempt fails
- [ ] System continues if notification fails
- [ ] Can disable notifications via env flag
- [ ] All templates branded with MediConnect
- [ ] Links in emails working correctly
- [ ] Phone numbers format validated

---

## 📞 Support

For integration help:
1. Check service logs: `npm run dev`
2. Verify `.env` configuration
3. Test Notification Service directly: `node test-notifications.js`
4. Check MongoDB for notification records
