import { Router } from "express";
import {
  createAppointmentController,
  getMyAppointmentsController,
  getAppointmentController,
  cancelAppointmentController,
  rescheduleAppointmentController,
  getDoctorAppointmentsController,
  updateAppointmentStatusController,
} from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  createAppointmentValidation,
  appointmentIdValidation,
  rescheduleAppointmentValidation,
  updateAppointmentStatusValidation,
  validateRequest,
} from "../validations/appointment.validation.js";

const router = Router();

router.use(authMiddleware);

// Patient routes
router.post(
  "/",
  requireRole("patient"),
  createAppointmentValidation,
  validateRequest,
  createAppointmentController
);

router.get(
  "/my",
  requireRole("patient"),
  getMyAppointmentsController
);

router.get(
  "/:id",
  requireRole("patient"),
  appointmentIdValidation,
  validateRequest,
  getAppointmentController
);

router.put(
  "/:id/cancel",
  requireRole("patient"),
  appointmentIdValidation,
  validateRequest,
  cancelAppointmentController
);

router.put(
  "/:id/reschedule",
  requireRole("patient"),
  rescheduleAppointmentValidation,
  validateRequest,
  rescheduleAppointmentController
);

// Doctor routes
router.get(
  "/doctor/my",
  requireRole("doctor"),
  getDoctorAppointmentsController
);

router.put(
  "/:id/status",
  requireRole("doctor"),
  updateAppointmentStatusValidation,
  validateRequest,
  updateAppointmentStatusController
);

export default router;