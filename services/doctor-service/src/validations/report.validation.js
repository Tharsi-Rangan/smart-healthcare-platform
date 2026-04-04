import { body } from "express-validator";

export const patientReportValidation = [
  body("patientName").trim().notEmpty().withMessage("Patient name is required"),
];