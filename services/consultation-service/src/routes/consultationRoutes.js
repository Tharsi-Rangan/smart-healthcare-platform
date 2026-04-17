import express from 'express';
import {
  startConsultation, getConsultationByAppointment,
  endConsultation, getDoctorConsultations, getPatientConsultations,
  getVideoToken, createVideoSessionRoom, endVideoSession, getConsultationRecordings,
} from '../controllers/consultationController.js';
import {
  createPrescription, getPatientPrescriptions,
  getDoctorPrescriptions, getPrescriptionById, migratePrescriptions,
} from '../controllers/prescriptionController.js';
import {
  analyzeSymptons, askHealthQuestion,
} from '../controllers/aiAssistantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// AI Assistant routes (no auth required - public for accessibility)
router.post('/ai-assistant/analyze-symptoms', analyzeSymptons);
router.post('/ai-assistant/health-question', askHealthQuestion);

// Consultation routes
router.post('/consultations/start',                     protect, authorize('doctor'), startConsultation);
router.get('/consultations/doctor',                     protect, authorize('doctor'), getDoctorConsultations);
router.get('/consultations/patient',                    protect, authorize('patient'), getPatientConsultations);
router.get('/consultations/appointment/:appointmentId', protect, getConsultationByAppointment);
router.patch('/consultations/:id/end',                  protect, authorize('doctor'), endConsultation);

// Twilio Video Consultation routes
router.post('/consultations/video/token',               protect, getVideoToken);
router.post('/consultations/video/room',                protect, createVideoSessionRoom);
router.post('/consultations/video/end',                 protect, endVideoSession);
router.get('/consultations/:id/recordings',             protect, getConsultationRecordings);

// Prescription routes
router.post('/prescriptions',          protect, authorize('doctor'), createPrescription);
router.get('/prescriptions/patient',   protect, authorize('patient'), getPatientPrescriptions);
router.get('/prescriptions/doctor',    protect, authorize('doctor'), getDoctorPrescriptions);
router.get('/prescriptions/:id',       protect, getPrescriptionById);
router.post('/prescriptions/migrate',  migratePrescriptions);

export default router;
