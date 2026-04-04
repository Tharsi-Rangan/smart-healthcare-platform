import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import {
  createAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../services/appointment.service.js";

const handleValidationErrors = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }
};

export const getDoctorAppointmentsController = asyncHandler(async (req, res) => {
  const appointments = await getDoctorAppointments(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Appointments fetched successfully",
    data: { appointments },
  });
});

export const createAppointmentController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const appointment = await createAppointment(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: "Appointment created successfully",
    data: { appointment },
  });
});

export const updateAppointmentStatusController = asyncHandler(async (req, res) => {
  const appointment = await updateAppointmentStatus(
    req.user.userId,
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Appointment status updated successfully",
    data: { appointment },
  });
});