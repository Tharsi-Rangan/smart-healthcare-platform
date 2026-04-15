import { body, param, validationResult } from "express-validator";
import { AppError } from "../utils/appError.js";

export const symptomIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid symptom record id"),
];

export const analyzeSymptomsValidation = [
  body("symptoms")
    .notEmpty()
    .withMessage("symptoms is required")
    .bail()
    .isString()
    .withMessage("symptoms must be a string")
    .bail()
    .isLength({ min: 3, max: 1000 })
    .withMessage("symptoms must be between 3 and 1000 characters"),

  body("duration")
    .optional()
    .isString()
    .withMessage("duration must be a string")
    .bail()
    .isLength({ max: 100 })
    .withMessage("duration must not exceed 100 characters"),

  body("severity")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("severity must be low, medium, or high"),

  body("ageGroup")
    .optional()
    .isString()
    .withMessage("ageGroup must be a string")
    .bail()
    .isLength({ max: 50 })
    .withMessage("ageGroup must not exceed 50 characters"),
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  next();
};