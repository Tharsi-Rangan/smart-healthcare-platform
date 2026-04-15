import Payment from "../models/payment.model.js";
import Notification from "../models/notification.model.js";
import { sendEmailNotification, sendPaymentSuccessEmail } from "./email.service.js";
import config from "../config/env.js";
import AppError from "../utils/appError.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Initiate payment
 */
export const initiatePayment = async (appointmentId, patientId, doctorId, amount) => {
  try {
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ appointmentId });
    if (existingPayment) {
      throw new AppError("Payment already initiated for this appointment", 400);
    }

    // Create payment record
    const payment = new Payment({
      appointmentId,
      patientId,
      doctorId,
      amount,
      transactionId: `TXN-${uuidv4().substring(0, 8)}`,
    });

    await payment.save();

    // For demo: Generate payment link (PayHere JSON API)
    const paymentLink = `${config.paymentGateway.payhereUrl}/?order_id=${payment._id}&amount=${amount}`;

    payment.paymentLink = paymentLink;
    await payment.save();

    return payment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to initiate payment", 400);
  }
};

/**
 * Handle payment success (callback from payment gateway)
 */
export const handlePaymentSuccess = async (appointmentId, transactionId, patientEmail) => {
  try {
    const payment = await Payment.findOne({ appointmentId });

    if (!payment) {
      throw new AppError("Payment record not found", 404);
    }

    payment.status = "paid";
    payment.transactionId = transactionId;
    await payment.save();

    // Create consultation in consultation service
    try {
      // Note: This would be called from frontend after payment success
      // Service-to-service call would happen here
    } catch (error) {
      console.log("Consultation service call failed:", error.message);
    }

    // Send payment success email
    await sendPaymentSuccessEmail(patientEmail, {
      transactionId,
      amount: payment.amount,
      appointmentDate: new Date().toLocaleDateString(),
    });

    // Create notification
    const notification = new Notification({
      userId: payment.patientId,
      type: "email",
      title: "Payment Successful",
      message: `Your payment of Rs. ${payment.amount} has been processed successfully.`,
      eventType: "payment_success",
      relatedId: appointmentId,
      status: "sent",
    });

    await notification.save();

    return payment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to process payment success", 400);
  }
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (appointmentId, failureReason) => {
  try {
    const payment = await Payment.findOne({ appointmentId });

    if (!payment) {
      throw new AppError("Payment record not found", 404);
    }

    payment.status = "failed";
    payment.failureReason = failureReason;
    await payment.save();

    return payment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to process payment failure", 400);
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (appointmentId) => {
  try {
    const payment = await Payment.findOne({ appointmentId });

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    return payment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to fetch payment status", 400);
  }
};

/**
 * Send notification
 */
export const sendNotification = async (userId, type, title, message, eventType, relatedId) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      eventType,
      relatedId,
      status: "pending",
    });

    await notification.save();

    // Send email if type is email
    if (type === "email") {
      try {
        await sendEmailNotification(userId, title, `<p>${message}</p>`);
        notification.status = "sent";
        await notification.save();
      } catch (error) {
        notification.status = "failed";
        await notification.save();
        console.log("Failed to send email:", error.message);
      }
    }

    return notification;
  } catch (error) {
    throw new AppError(error.message || "Failed to send notification", 400);
  }
};

/**
 * Get notifications for user
 */
export const getUserNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return notifications;
  } catch (error) {
    throw new AppError(error.message || "Failed to fetch notifications", 400);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return notification;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to update notification", 400);
  }
};
