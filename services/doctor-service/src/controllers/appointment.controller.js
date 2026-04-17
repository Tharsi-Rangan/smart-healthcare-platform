import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";

export const getDoctorAppointmentsController = asyncHandler(async (req, res) => {
  const authUserId = req.user.userId;
  
  // Try to find doctor profile by authUserId
  let doctor = await Doctor.findOne({ authUserId });

  // If no profile exists, create an empty one
  if (!doctor) {
    doctor = await Doctor.create({
      authUserId,
      doctorName: req.user.email?.split("@")[0] || "Doctor",
      specialization: "General",
      licenseNumber: "",
      hospital: "",
      experience: 0,
      profilePhotoUrl: "",
    });
  }

  // Now query appointments by the doctor profile ID
  const appointments = await Appointment.find({ doctorId: doctor._id }).sort({
    appointmentDate: -1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    message: "Doctor appointments fetched successfully",
    data: {
      appointments,
    },
  });
});

export const createAppointmentController = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ authUserId: req.user.userId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const {
    patientName,
    patientEmail = "",
    patientPhone = "",
    appointmentDate,
    appointmentTime,
    reason = "",
    status = "pending",
    notes = "",
  } = req.body;

  if (!patientName || !patientName.trim()) {
    throw new AppError("Patient name is required", 400);
  }

  if (!appointmentDate || !appointmentTime) {
    throw new AppError("Appointment date and time are required", 400);
  }

  const appointment = await Appointment.create({
    doctorId: doctor._id,
    patientName: patientName.trim(),
    patientEmail: patientEmail.trim(),
    patientPhone: patientPhone.trim(),
    appointmentDate,
    appointmentTime,
    reason: reason.trim(),
    status,
    notes: notes.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Appointment created successfully",
    data: {
      appointment,
    },
  });
});

export const updateAppointmentStatusController = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ authUserId: req.user.userId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const { status } = req.body;

  const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

  if (!status || !allowedStatuses.includes(status)) {
    throw new AppError(
      "Valid appointment status is required: pending, confirmed, completed, or cancelled",
      400
    );
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    doctorId: doctor._id,
  });

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  appointment.status = status;
  await appointment.save();

  res.status(200).json({
    success: true,
    message: "Appointment status updated successfully",
    data: {
      appointment,
    },
  });
});