import { body } from "express-validator";

export const doctorProfileValidation = [
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),

  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("License number is required"),

  body("hospital")
    .optional()
    .trim(),

  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience must be a positive number"),
];