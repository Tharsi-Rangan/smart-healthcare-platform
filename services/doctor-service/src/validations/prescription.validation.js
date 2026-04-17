import { body } from "express-validator";

export const prescriptionValidation = [
  body("patientName").trim().notEmpty().withMessage("Patient name is required"),
  body("patientAge")
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage("Patient age must be between 0 and 120"),
  body("diagnosis").trim().notEmpty().withMessage("Diagnosis is required"),
  body("symptoms").optional().trim(),
  body("medicines")
    .isArray({ min: 1 })
    .withMessage("At least one medicine is required"),
  body("medicines.*.name")
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required"),
  body("medicines.*.dosage")
    .trim()
    .notEmpty()
    .withMessage("Medicine dosage is required"),
  body("medicines.*.frequency").optional().trim(),
  body("medicines.*.duration").optional().trim(),
  body("medicines.*.instructions").optional().trim(),
  body("testsToBeDone")
    .optional()
    .isArray()
    .withMessage("Tests must be an array"),
  body("testsToBeDone.*.name").optional().trim(),
  body("testsToBeDone.*.description").optional().trim(),
  body("followUpDate").optional().isISO8601().withMessage("Invalid date format"),
  body("validityPeriod").optional().trim(),
  body("warningsAndSideEffects").optional().trim(),
  body("allergies").optional().trim(),
  body("notes").optional().trim(),
  body("appointmentId").optional().trim(),
];