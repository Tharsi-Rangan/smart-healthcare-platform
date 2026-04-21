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

const ensureNoDoubleBooking = async ({
  doctorId,
  appointmentDate,
  appointmentTime,
  excludeId,
}) => {
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

const ensureEditableByActor = (appointment, actorId, role) => {
  if (role === "doctor") {
    if (String(appointment.doctorAuthUserId) !== String(actorId)) {
      throw new AppError("Unauthorized access to this appointment", 403);
    }

    return;
  }

  ensureOwnership(appointment, actorId);
};

const enrichAppointmentWithDoctorInfo = async (appointment) => {
  const aptData = appointment.toObject ? appointment.toObject() : { ...appointment };

  try {
    const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5006";
    const doctorUrls = [];

    if (aptData.doctorId) {
      doctorUrls.push(`${DOCTOR_SERVICE_URL}/api/doctors/public/${aptData.doctorId}`);
    }

    if (aptData.doctorAuthUserId) {
      doctorUrls.push(`${DOCTOR_SERVICE_URL}/api/doctors/public/by-auth/${aptData.doctorAuthUserId}`);
    }

    // Some older appointment records stored the auth user id in doctorId.
    if (aptData.doctorId && String(aptData.doctorId) !== String(aptData.doctorAuthUserId || "")) {
      doctorUrls.push(`${DOCTOR_SERVICE_URL}/api/doctors/public/by-auth/${aptData.doctorId}`);
    }

    let doctor = null;

    for (const doctorUrl of [...new Set(doctorUrls)]) {
      const response = await fetch(doctorUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      doctor = data?.data?.doctor || data?.doctor;

      if (doctor) {
        break;
      }
    }

    if (doctor) {
      aptData.doctorId = doctor._id || aptData.doctorId;
      aptData.doctorAuthUserId = doctor.authUserId || aptData.doctorAuthUserId;
      aptData.doctorName =
        doctor.doctorName ||
        doctor.fullName ||
        doctor.name ||
        aptData.doctorName ||
        'Doctor';
      aptData.specialization =
        doctor.specialization ||
        doctor.specialty ||
        aptData.specialization ||
        aptData.specialty ||
        'General';
      aptData.consultationFee = doctor.consultationFee || aptData.consultationFee;
    }
  } catch (error) {
    console.error(`Could not fetch doctor info for doctorId ${aptData.doctorId}:`, error.message);
  }

  aptData.doctorName = aptData.doctorName || 'Doctor';
  aptData.specialization = aptData.specialization || aptData.specialty || 'General';

  return aptData;
};

export const createAppointment = async (payload, patientId) => {
  ensureFutureAppointment(payload.appointmentDate, payload.appointmentTime);

  await ensureNoDoubleBooking({
    doctorId: payload.doctorId,
    appointmentDate: payload.appointmentDate,
    appointmentTime: payload.appointmentTime,
  });

  const appointmentPayload = {
    ...payload,
    patientId,
    appointmentDate: normalizeAppointmentDate(payload.appointmentDate),
    appointmentTime: normalizeAppointmentTime(payload.appointmentTime),
  };

  // Use doctorAuthUserId from payload if provided, otherwise try to fetch it
  let doctorAuthUserId = payload.doctorAuthUserId || null;
  let consultationFee = payload.consultationFee || 500; // Default fee
  let doctorName = payload.doctorName || null; // Extract doctor name if provided
  
  // Only fetch from doctor service if doctorAuthUserId is not provided
  if (!doctorAuthUserId || !doctorName) {
    try {
      const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5006";
      const response = await fetch(`${DOCTOR_SERVICE_URL}/api/doctors/public/${payload.doctorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const data = await response.json();
        const doctor = data?.data?.doctor || data?.doctor;
        if (doctor?.authUserId && !doctorAuthUserId) {
          doctorAuthUserId = doctor.authUserId;
        }
        if (doctor?.doctorName && !doctorName) {
          doctorName = doctor.doctorName;
        }
        if (doctor?.consultationFee && !consultationFee) {
          consultationFee = doctor.consultationFee;
        }
      }
    } catch (error) {
      console.error("Could not fetch doctor info:", error.message);
    }
  }

  // Extract patient name from patientDetails
  const patientName = payload.patientDetails?.fullName || payload.patientName || "Unknown Patient";

  // Update payload with fetched/provided values
  if (doctorAuthUserId) {
    appointmentPayload.doctorAuthUserId = doctorAuthUserId;
  }
  if (doctorName) {
    appointmentPayload.doctorName = doctorName;
  }
  if (consultationFee) {
    appointmentPayload.consultationFee = consultationFee;
  }
  // Always set patient name
  appointmentPayload.patientName = patientName;

  // Ensure doctorAuthUserId is set
  if (!appointmentPayload.doctorAuthUserId) {
    throw new AppError("Unable to link appointment to doctor. Doctor profile may not exist.", 400);
  }

  try {
    return await Appointment.create(appointmentPayload);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Appointment slot already booked", 409);
    }

    throw error;
  }
};

export const getMyAppointments = async (userId, role) => {
  // For patients: filter by patientId
  // For doctors: filter by doctorId
  const query = role === 'doctor' ? { doctorId: userId } : { patientId: userId };
  const appointments = await Appointment.find(query).sort({ appointmentDate: 1, appointmentTime: 1 });
  
  // Fetch doctor information for each appointment to populate doctorName and specialization
  const appointmentsWithDoctorInfo = await Promise.all(
    appointments.map((appointment) => enrichAppointmentWithDoctorInfo(appointment))
  );
  
  return appointmentsWithDoctorInfo;
};

export const getAppointmentById = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  return appointment ? enrichAppointmentWithDoctorInfo(appointment) : null;
};

export const cancelAppointment = async (appointmentId, actorId, role) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureEditableByActor(appointment, actorId, role);

  if (appointment.status === "completed") {
    throw new AppError("Cannot cancel a completed appointment", 400);
  }

  if (appointment.status === "cancelled") {
    throw new AppError("Appointment is already cancelled", 400);
  }

  // Use findByIdAndUpdate to avoid validation errors on old documents
  return await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: "cancelled" },
    { new: true, runValidators: false }
  );
};

export const rescheduleAppointment = async (appointmentId, actorId, role, rescheduleData) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  ensureEditableByActor(appointment, actorId, role);

  if (appointment.status === "cancelled") {
    throw new AppError("Cannot reschedule a cancelled appointment", 400);
  }

  if (appointment.status === "completed") {
    throw new AppError("Cannot reschedule a completed appointment", 400);
  }

  ensureFutureAppointment(
    rescheduleData.appointmentDate,
    rescheduleData.appointmentTime
  );

  await ensureNoDoubleBooking({
    doctorId: appointment.doctorId,
    appointmentDate: rescheduleData.appointmentDate,
    appointmentTime: rescheduleData.appointmentTime,
    excludeId: appointment._id,
  });

  // Use findByIdAndUpdate to avoid validation errors on old documents
  return await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      appointmentDate: normalizeAppointmentDate(rescheduleData.appointmentDate),
      appointmentTime: normalizeAppointmentTime(rescheduleData.appointmentTime),
      status: "pending",
    },
    { new: true, runValidators: false }
  );
};

export const getDoctorAppointments = async (authUserId) => {
  const appointments = await Appointment.find({ doctorAuthUserId: authUserId }).sort({ appointmentDate: 1, appointmentTime: 1 });
  
  // Fetch doctor information for each appointment to populate doctorName and specialization
  const appointmentsWithDoctorInfo = await Promise.all(
    appointments.map((appointment) => enrichAppointmentWithDoctorInfo(appointment))
  );
  
  return appointmentsWithDoctorInfo;
};

export const updateAppointmentStatus = async (appointmentId, doctorAuthUserId, status) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.doctorAuthUserId && String(appointment.doctorAuthUserId) !== String(doctorAuthUserId)) {
    throw new AppError("Unauthorized access to this appointment", 403);
  }

  if (appointment.status === "cancelled") {
    throw new AppError("Cannot update a cancelled appointment", 400);
  }

  // Use findByIdAndUpdate to avoid validation errors on old documents
  return await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      status,
      doctorAuthUserId,
    },
    { new: true, runValidators: false }
  );
};
