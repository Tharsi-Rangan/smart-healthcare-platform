import express from 'express';
import {
  initiatePayment, confirmPayment, payhereNotify,
  getPatientPayments, getAllPayments, getPaymentStats,
  approvePayment, rejectPayment, getPaymentStatus,
} from '../controllers/paymentController.js';
import {
  sendNotification, notifyAppointmentConfirmed, notifyAppointmentBooked,
  getMyNotifications, markAsRead, markAllAsRead, getUnreadCount, notifyPaymentConfirmed,
  deleteNotification, deleteAllNotifications,
  notifyConsultationStarted, notifyPatientJoinedSession,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Payment routes
router.post('/payments/initiate',     protect, authorize('patient'), initiatePayment);
router.post('/payments/confirm',      protect, confirmPayment);
router.post('/payments/notify',       payhereNotify);          // PayHere webhook — no auth
router.get('/payments/patient/my',    protect, authorize('patient'), getPatientPayments);
router.get('/payments/admin',         protect, authorize('admin'), getAllPayments);
router.get('/payments/admin/stats',   protect, authorize('admin'), getPaymentStats);
router.get('/payments/status/:id',    protect, getPaymentStatus);  // Patient/Doctor can check
router.put('/payments/:id/approve',   protect, authorize('admin'), approvePayment);    // Admin approves
router.put('/payments/:id/reject',    protect, authorize('admin'), rejectPayment);     // Admin rejects

// Notification routes
router.post('/notifications/send',                  protect, sendNotification);
router.post('/notifications/appointment-confirmed', protect, notifyAppointmentConfirmed);
router.post('/notifications/appointment-booked',    protect, notifyAppointmentBooked);
router.post('/notifications/payment-confirmed',     protect, notifyPaymentConfirmed);
router.post('/notifications/consultation-started',  protect, notifyConsultationStarted);
router.post('/notifications/patient-joined-session', protect, notifyPatientJoinedSession);
router.get('/notifications',                        protect, getMyNotifications);
router.get('/notifications/unread-count',           protect, getUnreadCount);
router.patch('/notifications/read-all',             protect, markAllAsRead);
router.patch('/notifications/:id/read',             protect, markAsRead);
router.delete('/notifications/delete-all',          protect, deleteAllNotifications);
router.delete('/notifications/:id',                 protect, deleteNotification);

export default router;
