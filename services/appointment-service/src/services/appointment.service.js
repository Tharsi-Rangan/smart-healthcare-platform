import { Appointment } from "../models/appointment.model.js";
import { AppError } from "../utils/appError.js";

const parseDateParts = (appointmentDate) => {
  if (!appointmentDate) {
    throw new AppError("Invalid appointmentDate", 400);
  }

  const dateInput = String(appointmentDate).slice(0, 10);
  const [year, month, day] = dateInput.split("-").map(Number);

  if (!year || !month || !day) {
    throw new AppError("Invalid appointmentDate", 400);
  }

  return { year, month, day };
};

const normalizeAppointmentDate = (appointmentDate) => {
  const { year, month, day } = parseDateParts(appointmentDate);
  const normalizedDate = new Date(year, month - 1, day);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const normalizeAppointmentTime = (appointmentTime) => {
  const [hours, minutes] = String(appointmentTime)
    .trim()
    .split(":")
    .map((value) => Number(value));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new AppError("Invalid appointmentTime", 400);
  }

  const normalizedHours = String(hours).padStart(2, "0");
  const normalizedMinutes = String(minutes).padStart(2, "0");

  return `${normalizedHours}:${normalizedMinutes}`;
};

const combineDateAndTime = (appointmentDate, appointmentTime) => {
  const { year, month, day } = parseDateParts(appointmentDate);
  const normalizedTime = normalizeAppointmentTime(appointmentTime);
  const [hours, minutes] = normalizedTime.split(":").map(Number);

  const scheduledAt = new Date(year, month - 1, day);
  scheduledAt.setHours(hours, minutes, 0, 0);

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new AppError("Invalid appointmentTime", 400);
  }

  return scheduledAt;
};

const ensureFutureAppointment = (appointmentDate, appointmentTime) => {
  const scheduledAt = combineDateAndTime(appointmentDate, appointmentTime);

  if (scheduledAt.getTime() <= Date.now()) {
    throw new AppError("Appointment date and time must be in the future", 400);
  }
};

const ensureNoDoubleBooking = async ({ doctorId, appointmentDate, appointmentTime, excludeId }) => {
  const query = {
    doctorId,
    appointmentDate: normalizeAppointmentDate(appointmentDate),
    appointmentTime: normalizeAppointmentTime(appointmentTime),
    status: { $ne: "cancelled" },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingAppointment = await Appointment.findOne(query);

  if (existingAppointment) {
    throw new AppError("Appointment slot already booked", 409);
  }
};

const ensureOwnership = (appointment, patientId) => {
  if (String(appointment.patientId) !== String(patientId)) {
    throw new AppError("Unauthorized access to this appointment", 403);
  }
};

export const createAppointment = async (payload, patientId) => {
  const appointmentPayload = {
    ...payload,
    patientId,
    appointmentDate: normalizeAppointmentDate(payload.appointmentDate),
    appointmentTime: normalizeAppointmentTime(payload.appointmentTime),
  };

  ensureFutureAppointment(payload.appointmentDate, payload.appointmentTime);
  await ensureNoDoubleBooking({
    doctorId: payload.doctorId,
    appointmentDate: payload.appointmentDate,
    appointmentTime: payload.appointmentTime,
  });

  try {
    return await Appointment.create(appointmentPayload);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Appointment slot already booked", 409);
    }

    throw error;
  }
};

export const getMyAppointments = async (patientId) => {
  return Appointment.find({ patientId }).sort({ appointmentDate: 1, appointmentTime: 1 });
};

export const getAppointmentById = async (appointmentId) => {
  return Appointment.findById(appointmentId);
};

export const cancelAppointment = async (appointmentId, patientId) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureOwnership(appointment, patientId);

  if (appointment.status === "completed") {
    throw new AppError("Cannot cancel a completed appointment", 400);
  }

  if (appointment.status === "cancelled") {
    throw new AppError("Appointment is already cancelled", 400);
  }

  appointment.status = "cancelled";
  return appointment.save();
};

export const rescheduleAppointment = async (appointmentId, patientId, rescheduleData) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureOwnership(appointment, patientId);

  if (["cancelled", "completed"].includes(appointment.status)) {
    if (appointment.status === "cancelled") {
      throw new AppError("Cannot reschedule a cancelled appointment", 400);
    }

    throw new AppError("Cannot reschedule a completed appointment", 400);
  }

  const nextDate = normalizeAppointmentDate(rescheduleData.appointmentDate);
  const nextTime = normalizeAppointmentTime(rescheduleData.appointmentTime);

  ensureFutureAppointment(rescheduleData.appointmentDate, rescheduleData.appointmentTime);

  await ensureNoDoubleBooking({
    doctorId: appointment.doctorId,
    appointmentDate: rescheduleData.appointmentDate,
    appointmentTime: rescheduleData.appointmentTime,
    excludeId: appointment._id,
  });

  appointment.appointmentDate = nextDate;
  appointment.appointmentTime = nextTime;
  appointment.status = "pending";

  try {
    return await appointment.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Appointment slot already booked", 409);
    }

    throw error;
  }
};
