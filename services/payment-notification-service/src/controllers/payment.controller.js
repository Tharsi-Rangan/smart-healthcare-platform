import {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFailure,
  getPaymentStatus,
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  getAllPayments,
} from "../services/payment.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

/**
 * Initiate payment
 */
export const initiatePaymentHandler = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, doctorId, amount } = req.body;

  if (!appointmentId || !patientId || !doctorId || !amount) {
    throw new AppError("Missing required fields", 400);
  }

  const payment = await initiatePayment(appointmentId, patientId, doctorId, amount);

  res.status(201).json({
    success: true,
    message: "Payment initiated",
    data: payment,
  });
});

/**
 * Payment success callback
 */
export const paymentSuccessHandler = asyncHandler(async (req, res) => {
  const { appointmentId, transactionId, patientEmail } = req.body;

  if (!appointmentId || !transactionId) {
    throw new AppError("Missing required fields", 400);
  }

  const payment = await handlePaymentSuccess(appointmentId, transactionId, patientEmail);

  res.status(200).json({
    success: true,
    message: "Payment processed successfully",
    data: payment,
  });
});

/**
 * Payment failure callback
 */
export const paymentFailureHandler = asyncHandler(async (req, res) => {
  const { appointmentId, failureReason } = req.body;

  if (!appointmentId) {
    throw new AppError("Missing required fields", 400);
  }

  const payment = await handlePaymentFailure(appointmentId, failureReason);

  res.status(200).json({
    success: true,
    message: "Payment failure processed",
    data: payment,
  });
});

/**
 * Get payment status
 */
export const getPaymentStatusHandler = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    throw new AppError("Appointment ID is required", 400);
  }

  const payment = await getPaymentStatus(appointmentId);

  res.status(200).json({
    success: true,
    data: payment,
  });
});

/**
 * Send notification
 */
export const sendNotificationHandler = asyncHandler(async (req, res) => {
  const { userId, type, title, message, eventType, relatedId } = req.body;

  if (!userId || !type || !title || !message || !eventType) {
    throw new AppError("Missing required fields", 400);
  }

  const notification = await sendNotification(userId, type, title, message, eventType, relatedId);

  res.status(201).json({
    success: true,
    message: "Notification sent",
    data: notification,
  });
});

/**
 * Get user notifications
 */
export const getUserNotificationsHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const notifications = await getUserNotifications(userId);

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

/**
 * Mark notification as read
 */
export const markNotificationAsReadHandler = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new AppError("Notification ID is required", 400);
  }

  const notification = await markNotificationAsRead(notificationId);

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

/**
 * Get all payments (Admin specific)
 */
export const getAllPaymentsHandler = asyncHandler(async (req, res) => {
  const payments = await getAllPayments();

  res.status(200).json({
    success: true,
    data: payments,
  });
});
