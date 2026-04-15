import {
  createConsultation,
  startConsultation,
  endConsultation,
  updateConsultationNotes,
  getConsultationById,
  getConsultationsByPatient,
  getConsultationsByDoctor,
} from "../services/consultation.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

/**
 * Create a consultation when appointment is confirmed
 */
export const createConsultationHandler = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, doctorId } = req.body;

  if (!appointmentId || !patientId || !doctorId) {
    throw new AppError("Missing required fields", 400);
  }

  const consultation = await createConsultation(
    appointmentId,
    patientId,
    doctorId
  );

  res.status(201).json({
    success: true,
    message: "Consultation created successfully",
    data: consultation,
  });
});

/**
 * Start consultation and generate video link
 */
export const startConsultationHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Consultation ID is required", 400);
  }

  const { consultation, meetingLink } = await startConsultation(id);

  res.status(200).json({
    success: true,
    message: "Consultation started",
    data: { consultation, meetingLink },
  });
});

/**
 * End consultation
 */
export const endConsultationHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Consultation ID is required", 400);
  }

  const consultation = await endConsultation(id);

  res.status(200).json({
    success: true,
    message: "Consultation ended",
    data: consultation,
  });
});

/**
 * Add notes and prescription
 */
export const updateNotesHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, prescription } = req.body;

  if (!id) {
    throw new AppError("Consultation ID is required", 400);
  }

  const consultation = await updateConsultationNotes(id, notes, prescription);

  res.status(200).json({
    success: true,
    message: "Consultation notes updated",
    data: consultation,
  });
});

/**
 * Get consultation details
 */
export const getConsultationHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Consultation ID is required", 400);
  }

  const consultation = await getConsultationById(id);

  res.status(200).json({
    success: true,
    data: consultation,
  });
});

/**
 * Get patient's consultations
 */
export const getPatientConsultationsHandler = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    throw new AppError("Patient ID is required", 400);
  }

  const consultations = await getConsultationsByPatient(patientId);

  res.status(200).json({
    success: true,
    data: consultations,
  });
});

/**
 * Get doctor's consultations
 */
export const getDoctorConsultationsHandler = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  if (!doctorId) {
    throw new AppError("Doctor ID is required", 400);
  }

  const consultations = await getConsultationsByDoctor(doctorId);

  res.status(200).json({
    success: true,
    data: consultations,
  });
});
