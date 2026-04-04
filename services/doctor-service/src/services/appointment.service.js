import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { AppError } from "../utils/appError.js";

const getDoctorByAuthUserId = async (authUserId) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  return doctor;
};

export const getDoctorAppointments = async (authUserId) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  return await Appointment.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
};

export const createAppointment = async (authUserId, payload) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  return await Appointment.create({
    doctorId: doctor._id,
    ...payload,
  });
};

export const updateAppointmentStatus = async (authUserId, appointmentId, status) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    doctorId: doctor._id,
  });

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  appointment.status = status;
  await appointment.save();

  return appointment;
};