import express from 'express';
import {
  initiatePayment, confirmPayment, payhereNotify,
  getPatientPayments, getAllPayments, getPaymentStats,
} from '../controllers/paymentController.js';
import {
  sendNotification, notifyAppointmentConfirmed, notifyAppointmentBooked,
  getMyNotifications, markAsRead, markAllAsRead, getUnreadCount, notifyPaymentConfirmed,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Payment routes
router.post('/payments/initiate',     protect, authorize('patient'), initiatePayment);
router.post('/payments/confirm',      protect, confirmPayment);
router.post('/payments/notify',       payhereNotify);          // PayHere webhook — no auth
router.get('/payments/patient',       protect, authorize('patient'), getPatientPayments);
router.get('/payments/admin',         protect, authorize('admin'), getAllPayments);
router.get('/payments/admin/stats',   protect, authorize('admin'), getPaymentStats);

// Notification routes
router.post('/notifications/send',                  protect, sendNotification);
router.post('/notifications/appointment-confirmed', protect, notifyAppointmentConfirmed);
router.post('/notifications/appointment-booked',    protect, notifyAppointmentBooked);
router.post('/notifications/payment-confirmed',     protect, notifyPaymentConfirmed);
router.get('/notifications',                        protect, getMyNotifications);
router.get('/notifications/unread-count',           protect, getUnreadCount);
router.patch('/notifications/read-all',             protect, markAllAsRead);
router.patch('/notifications/:id/read',             protect, markAsRead);

export default router;
