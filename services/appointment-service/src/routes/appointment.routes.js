import { Router } from "express";
import {
  createAppointmentController,
  getMyAppointmentsController,
  getAppointmentController,
  cancelAppointmentController,
  rescheduleAppointmentController,
} from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createAppointmentValidation,
  appointmentIdValidation,
  rescheduleAppointmentValidation,
  validateRequest,
} from "../validations/appointment.validation.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createAppointmentValidation, validateRequest, createAppointmentController);
router.get("/my", getMyAppointmentsController);
router.get("/:id", appointmentIdValidation, validateRequest, getAppointmentController);
router.put("/:id/cancel", appointmentIdValidation, validateRequest, cancelAppointmentController);
router.put(
  "/:id/reschedule",
  rescheduleAppointmentValidation,
  validateRequest,
  rescheduleAppointmentController
);

export default router;
