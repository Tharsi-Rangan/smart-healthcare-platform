import { body } from "express-validator";

export const doctorProfileValidation = [
  body("doctorName")
    .trim()
    .notEmpty()
    .withMessage("Doctor name is required")
    .isLength({ min: 3 })
    .withMessage("Doctor name must be at least 3 characters long"),

  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ min: 3 })
    .withMessage("Specialization must be at least 3 characters long"),

  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ min: 4 })
    .withMessage("License number must be at least 4 characters long")
    .matches(/^[A-Za-z0-9\-\/]+$/)
    .withMessage("License number can only contain letters, numbers, hyphens, and slashes"),

  body("hospital")
    .trim()
    .notEmpty()
    .withMessage("Hospital is required")
    .isLength({ min: 3 })
    .withMessage("Hospital must be at least 3 characters long"),

  body("experience")
    .notEmpty()
    .withMessage("Experience is required")
    .isInt({ min: 0, max: 60 })
    .withMessage("Experience must be a number between 0 and 60"),
];