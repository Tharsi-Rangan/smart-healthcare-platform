import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Consultation from "../models/consultation.model.js";
import config from "../config/env.js";
import AppError from "../utils/appError.js";

/**
 * Create a new consultation
 */
export const createConsultation = async (appointmentId, patientId, doctorId) => {
  try {
    // Verify appointment exists (call appointment service)
    const appointmentResponse = await axios.get(
      `${config.appointmentServiceUrl}/api/appointments/${appointmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!appointmentResponse.data.success) {
      throw new AppError("Appointment not found", 404);
    }

    // Create consultation
    const consultation = new Consultation({
      appointmentId,
      patientId,
      doctorId,
      videoSessionId: uuidv4(),
    });

    await consultation.save();
    return consultation;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to create consultation", 400);
  }
};

/**
 * Start consultation (generate video link)
 */
export const startConsultation = async (consultationId) => {
  try {
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      throw new AppError("Consultation not found", 404);
    }

    if (consultation.status === "completed") {
      throw new AppError("Cannot start completed consultation", 400);
    }

    // Generate Jitsi meeting link
    const meetingLink = `https://${config.jitsiDomain}/${consultation.videoSessionId}`;

    consultation.status = "active";
    consultation.videoLink = meetingLink;
    consultation.startedAt = new Date();

    await consultation.save();

    return {
      consultation,
      meetingLink,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to start consultation", 400);
  }
};

/**
 * End consultation
 */
export const endConsultation = async (consultationId) => {
  try {
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      throw new AppError("Consultation not found", 404);
    }

    consultation.status = "completed";
    consultation.completedAt = new Date();

    await consultation.save();

    return consultation;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to end consultation", 400);
  }
};

/**
 * Add notes and prescription
 */
export const updateConsultationNotes = async (
  consultationId,
  notes,
  prescription
) => {
  try {
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      throw new AppError("Consultation not found", 404);
    }

    if (notes) consultation.notes = notes;
    if (prescription) consultation.prescription = prescription;

    await consultation.save();

    return consultation;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.message || "Failed to update consultation notes",
      400
    );
  }
};

/**
 * Get consultation by ID
 */
export const getConsultationById = async (consultationId) => {
  try {
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      throw new AppError("Consultation not found", 404);
    }

    return consultation;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to fetch consultation", 400);
  }
};

/**
 * Get consultations by patient ID
 */
export const getConsultationsByPatient = async (patientId) => {
  try {
    const consultations = await Consultation.find({ patientId }).sort({
      createdAt: -1,
    });
    return consultations;
  } catch (error) {
    throw new AppError(
      error.message || "Failed to fetch patient consultations",
      400
    );
  }
};

/**
 * Get consultations by doctor ID
 */
export const getConsultationsByDoctor = async (doctorId) => {
  try {
    const consultations = await Consultation.find({ doctorId }).sort({
      createdAt: -1,
    });
    return consultations;
  } catch (error) {
    throw new AppError(
      error.message || "Failed to fetch doctor consultations",
      400
    );
  }
};
