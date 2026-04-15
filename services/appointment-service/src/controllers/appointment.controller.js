import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../services/appointment.service.js";

export const createAppointmentController = asyncHandler(async (req, res) => {
  const appointment = await createAppointment(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });
});

export const getMyAppointmentsController = asyncHandler(async (req, res) => {
  const appointments = await getMyAppointments(req.user.id);

  res.status(200).json({
    success: true,
    message: "Appointments fetched successfully",
    data: appointments,
  });
});

export const getAppointmentController = asyncHandler(async (req, res) => {
  const appointment = await getAppointmentById(req.params.id);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (String(appointment.patientId) !== String(req.user.id)) {
    throw new AppError("Unauthorized access to this appointment", 403);
  }

  res.status(200).json({
    success: true,
    message: "Appointment details fetched successfully",
    data: appointment,
  });
});

export const cancelAppointmentController = asyncHandler(async (req, res) => {
  const appointment = await cancelAppointment(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: appointment,
  });
});

export const rescheduleAppointmentController = asyncHandler(async (req, res) => {
  const appointment = await rescheduleAppointment(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Appointment rescheduled successfully",
    data: appointment,
  });
});

export const getDoctorAppointmentsController = asyncHandler(async (req, res) => {
  const appointments = await getDoctorAppointments(req.user.id);

  res.status(200).json({
    success: true,
    message: "Doctor appointments fetched successfully",
    data: appointments,
  });
});

export const updateAppointmentStatusController = asyncHandler(async (req, res) => {
  const appointment = await updateAppointmentStatus(
    req.params.id,
    req.user.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Appointment status updated successfully",
    data: appointment,
  });
});