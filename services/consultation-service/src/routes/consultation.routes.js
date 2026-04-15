import express from "express";
import {
  createConsultationHandler,
  startConsultationHandler,
  endConsultationHandler,
  updateNotesHandler,
  getConsultationHandler,
  getPatientConsultationsHandler,
  getDoctorConsultationsHandler,
} from "../controllers/consultation.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create consultation
router.post("/", verifyToken, createConsultationHandler);

// Get consultation details
router.get("/:id", verifyToken, getConsultationHandler);

// Start consultation (generate video link)
router.post("/:id/start", verifyToken, startConsultationHandler);

// End consultation
router.post("/:id/end", verifyToken, endConsultationHandler);

// Update notes and prescription
router.put("/:id/notes", verifyToken, updateNotesHandler);

// Get patient's consultations
router.get("/patient/:patientId", verifyToken, getPatientConsultationsHandler);

// Get doctor's consultations
router.get("/doctor/:doctorId", verifyToken, getDoctorConsultationsHandler);

export default router;
