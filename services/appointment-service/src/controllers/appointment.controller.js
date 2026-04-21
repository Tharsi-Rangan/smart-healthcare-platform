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
  const appointment = await cancelAppointment(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: appointment,
  });
});

export const rescheduleAppointmentController = asyncHandler(async (req, res) => {
  const appointment = await rescheduleAppointment(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  );

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

  // Use findByIdAndUpdate to avoid validation errors on old documents
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { adminConfirmed: true },
    { new: true, runValidators: false }
  );

  res.status(200).json({
    success: true,
    message: "Appointment confirmed by admin successfully",
    data: {
      appointment: updatedAppointment,
    },
  });
});

// Get all appointments (Admin only)
export const getAllAppointmentsController = asyncHandler(async (req, res) => {
  const { status, patientName, doctorName, page = 1, limit = 15 } = req.query;

  const query = {};
  if (status && status !== 'all') {
    query.status = status.toLowerCase();
  }
  if (patientName) {
    query.patientName = { $regex: patientName, $options: 'i' };
  }
  if (doctorName) {
    query.doctorName = { $regex: doctorName, $options: 'i' };
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 15));
  const skip = (pageNum - 1) * limitNum;

  let appointments = await Appointment.find(query)
    .sort({ appointmentDate: -1, appointmentTime: -1 })
    .skip(skip)
    .limit(limitNum);

  // Enrich appointments with missing patient/doctor names
  const doctorCache = {}; // Cache doctor names to avoid multiple API calls
  const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5006";

  appointments = await Promise.all(appointments.map(async (apt) => {
    const aptData = apt.toObject ? apt.toObject() : apt;
    
    // Use existing name or fallback to patient details
    if (!aptData.patientName && aptData.patientDetails?.fullName) {
      aptData.patientName = aptData.patientDetails.fullName;
    }
    if (!aptData.patientName) {
      aptData.patientName = `Patient #${String(aptData.patientId).substring(0, 8)}`;
    }
    
    // Fetch doctor name from doctor service if missing
    if (!aptData.doctorName) {
      const doctorId = String(aptData.doctorId);
      
      // Check cache first
      if (doctorCache[doctorId]) {
        aptData.doctorName = doctorCache[doctorId];
      } else {
        try {
          const response = await fetch(`${DOCTOR_SERVICE_URL}/api/doctors/public/${doctorId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          
          if (response.ok) {
            const data = await response.json();
            const doctor = data?.data?.doctor || data?.doctor;
            if (doctor?.doctorName) {
              aptData.doctorName = doctor.doctorName;
              doctorCache[doctorId] = doctor.doctorName; // Cache it
            } else {
              aptData.doctorName = `Doctor #${doctorId.substring(0, 8)}`;
              doctorCache[doctorId] = aptData.doctorName;
            }
          } else {
            aptData.doctorName = `Doctor #${doctorId.substring(0, 8)}`;
            doctorCache[doctorId] = aptData.doctorName;
          }
        } catch (error) {
          console.error(`Could not fetch doctor ${doctorId}:`, error.message);
          aptData.doctorName = `Doctor #${doctorId.substring(0, 8)}`;
          doctorCache[doctorId] = aptData.doctorName;
        }
      }
    }
    
    return aptData;
  }));

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

// Get appointment stats (Admin only)
export const getAppointmentStatsController = asyncHandler(async (req, res) => {
  const stats = await Appointment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        confirmed: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
      },
    },
  ]);

  const result = stats.length > 0
    ? stats[0]
    : { _id: null, total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

  res.status(200).json({
    success: true,
    data: {
      stats: {
        total: result.total,
        pending: result.pending,
        confirmed: result.confirmed,
        completed: result.completed,
        cancelled: result.cancelled,
      },
    },
  });
});