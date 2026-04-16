import express from 'express';
import {
  notifyAppointmentBooked,
  notifyConsultationCompleted,
  notifyAppointmentCancelled,
  notifyPaymentReceived,
  notifyDoctorRegistration,
  getUserNotifications,
  health,
} from '../controllers/notificationController.js';

const router = express.Router();

// Health check
router.get('/notifications/health', health);

// Send notifications
router.post('/notifications/appointment-booked', notifyAppointmentBooked);
router.post('/notifications/consultation-completed', notifyConsultationCompleted);
router.post('/notifications/appointment-cancelled', notifyAppointmentCancelled);
router.post('/notifications/payment-received', notifyPaymentReceived);
router.post('/notifications/doctor-registration', notifyDoctorRegistration);

// Get notifications
router.get('/notifications/:userId', getUserNotifications);

export default router;
