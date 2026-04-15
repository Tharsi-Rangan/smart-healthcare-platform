import { body } from "express-validator";

export const prescriptionValidation = [
  body("patientName").trim().notEmpty().withMessage("Patient name is required"),
  body("diagnosis").trim().notEmpty().withMessage("Diagnosis is required"),
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
];