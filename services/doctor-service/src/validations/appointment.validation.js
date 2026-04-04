import { body } from "express-validator";

export const appointmentValidation = [
  body("patientName").trim().notEmpty().withMessage("Patient name is required"),
  body("appointmentDate").trim().notEmpty().withMessage("Appointment date is required"),
  body("appointmentTime").trim().notEmpty().withMessage("Appointment time is required"),
  body("consultationType")
    .optional()
    .isIn(["video", "in-person"])
    .withMessage("Consultation type must be video or in-person"),
];