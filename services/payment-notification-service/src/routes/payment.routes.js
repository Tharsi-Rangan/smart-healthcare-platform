import express from "express";
import {
  initiatePaymentHandler,
  paymentSuccessHandler,
  paymentFailureHandler,
  getPaymentStatusHandler,
  sendNotificationHandler,
  getUserNotificationsHandler,
  markNotificationAsReadHandler,
  getAllPaymentsHandler,
} from "../controllers/payment.controller.js";
import { verifyToken, verifyRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Payment routes
router.post("/initiate", verifyToken, initiatePaymentHandler);
router.post("/success", paymentSuccessHandler); // Can be called from frontend or payment gateway
router.post("/failure", paymentFailureHandler); // Can be called from payment gateway
router.get("/status/:appointmentId", verifyToken, getPaymentStatusHandler);
router.get("/admin/all", verifyToken, verifyRole(["admin"]), getAllPaymentsHandler);

// Notification routes
router.post("/notifications/send", verifyToken, sendNotificationHandler);
router.get("/notifications/user/:userId", verifyToken, getUserNotificationsHandler);
router.put("/notifications/:notificationId/read", verifyToken, markNotificationAsReadHandler);

export default router;
