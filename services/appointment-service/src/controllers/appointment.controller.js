import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Appointment } from "../models/appointment.model.js";
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
  const appointments = await getMyAppointments(req.user.id, req.user.role);

  // Ensure all appointments have consultationFee (for appointments created before field was added)
  const appointmentsWithFee = appointments.map(apt => {
    const aptData = apt.toObject ? apt.toObject() : apt;
    if (!aptData.consultationFee) {
      aptData.consultationFee = 500; // Default fee
    }
    return aptData;
  });

  res.status(200).json({
    success: true,
    message: "Appointments fetched successfully",
    data: {
      appointments: appointmentsWithFee,
    },
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

  // Ensure consultationFee is set (for appointments created before field was added)
  const appointmentData = appointment.toObject ? appointment.toObject() : appointment;
  if (!appointmentData.consultationFee) {
    appointmentData.consultationFee = 500; // Default fee
  }

  res.status(200).json({
    success: true,
    message: "Appointment details fetched successfully",
    data: appointmentData,
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

  // Ensure all appointments have consultationFee (for appointments created before field was added)
  const appointmentsWithFee = appointments.map(apt => {
    const aptData = apt.toObject ? apt.toObject() : apt;
    if (!aptData.consultationFee) {
      aptData.consultationFee = 500; // Default fee
    }
    return aptData;
  });

  res.status(200).json({
    success: true,
    message: "Doctor appointments fetched successfully",
    data: {
      appointments: appointmentsWithFee,
    },
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

export const getPendingAppointmentsController = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    status: "confirmed",
    paymentStatus: "paid",
  }).sort({ appointmentDate: 1, appointmentTime: 1 });

  res.status(200).json({
    success: true,
    message: "Pending appointments fetched successfully",
    data: {
      appointments,
    },
  });
});

export const confirmAppointmentController = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.status !== "confirmed") {
    throw new AppError("Only confirmed appointments can be verified", 400);
  }

  if (appointment.paymentStatus !== "paid") {
    throw new AppError("Payment must be verified before confirming appointment", 400);
  }

  appointment.adminConfirmed = true;
  await appointment.save();

  res.status(200).json({
    success: true,
    message: "Appointment confirmed by admin successfully",
    data: {
      appointment,
    },
  });
});