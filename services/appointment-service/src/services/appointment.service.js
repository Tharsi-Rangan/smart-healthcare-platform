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
  
  // Only fetch from doctor service if doctorAuthUserId is not provided
  if (!doctorAuthUserId) {
    try {
      const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5006";
      const response = await fetch(`${DOCTOR_SERVICE_URL}/api/doctors/public/${payload.doctorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const data = await response.json();
        const doctor = data?.data?.doctor || data?.doctor;
        if (doctor?.authUserId) {
          doctorAuthUserId = doctor.authUserId;
        }
        if (doctor?.consultationFee) {
          consultationFee = doctor.consultationFee;
        }
      }
    } catch (error) {
      console.error("Could not fetch doctor authUserId or fee:", error.message);
    }
  }

  // Update payload with fetched/provided values
  if (doctorAuthUserId) {
    appointmentPayload.doctorAuthUserId = doctorAuthUserId;
  }
  if (consultationFee) {
    appointmentPayload.consultationFee = consultationFee;
  }

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
    appointments.map(async (appointment) => {
      const aptData = appointment.toObject ? appointment.toObject() : appointment;
      
      try {
        const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5006";
        const response = await fetch(`${DOCTOR_SERVICE_URL}/api/doctors/public/${appointment.doctorId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.ok) {
          const data = await response.json();
          const doctor = data?.data?.doctor || data?.doctor;
          if (doctor) {
            // Populate doctor information
            aptData.doctorName = doctor.fullName || doctor.name || 'Doctor';
            aptData.specialization = doctor.specialty || doctor.specialization || aptData.specialty || 'General';
          }
        }
      } catch (error) {
        console.error(`Could not fetch doctor info for doctorId ${appointment.doctorId}:`, error.message);
        // Use fallback values
        aptData.doctorName = 'Doctor';
        aptData.specialization = aptData.specialty || 'General';
      }
      
      return aptData;
    })
  );
  
  return appointmentsWithDoctorInfo;
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

  appointment.appointmentDate = normalizeAppointmentDate(rescheduleData.appointmentDate);
  appointment.appointmentTime = normalizeAppointmentTime(rescheduleData.appointmentTime);
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

export const getDoctorAppointments = async (authUserId) => {
  const appointments = await Appointment.find({ doctorAuthUserId: authUserId }).sort({ appointmentDate: 1, appointmentTime: 1 });
  
  // Fetch doctor information for each appointment to populate doctorName and specialization
  const appointmentsWithDoctorInfo = await Promise.all(
    appointments.map(async (appointment) => {
      const aptData = appointment.toObject ? appointment.toObject() : appointment;
      
      try {
        const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5006";
        const response = await fetch(`${DOCTOR_SERVICE_URL}/api/doctors/public/${appointment.doctorId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.ok) {
          const data = await response.json();
          const doctor = data?.data?.doctor || data?.doctor;
          if (doctor) {
            // Populate doctor information
            aptData.doctorName = doctor.fullName || doctor.name || 'Doctor';
            aptData.specialization = doctor.specialty || doctor.specialization || aptData.specialty || 'General';
          }
        }
      } catch (error) {
        console.error(`Could not fetch doctor info for doctorId ${appointment.doctorId}:`, error.message);
        // Use fallback values
        aptData.doctorName = 'Doctor';
        aptData.specialization = aptData.specialty || 'General';
      }
      
      return aptData;
    })
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

  appointment.status = status;
  appointment.doctorAuthUserId = doctorAuthUserId;
  return appointment.save();
};