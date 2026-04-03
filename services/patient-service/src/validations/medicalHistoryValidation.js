const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

const createMedicalHistoryValidation = [
  body("conditionName")
    .trim()
    .notEmpty()
    .withMessage("Condition name is required.")
    .isLength({ max: 120 })
    .withMessage("Condition name must not exceed 120 characters."),

  body("diagnosisDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Diagnosis date must be a valid date."),

  body("status")
    .optional({ checkFalsy: true })
    .isIn(["active", "resolved", "ongoing"])
    .withMessage("Status value is invalid."),

  body("medications")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Medications must not exceed 500 characters."),

  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters."),

  body("source")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Source must not exceed 120 characters."),
];

const updateMedicalHistoryValidation = [
  body("conditionName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Condition name cannot be empty.")
    .isLength({ max: 120 })
    .withMessage("Condition name must not exceed 120 characters."),

  body("diagnosisDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Diagnosis date must be a valid date."),

  body("status")
    .optional({ checkFalsy: true })
    .isIn(["active", "resolved", "ongoing"])
    .withMessage("Status value is invalid."),

  body("medications")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Medications must not exceed 500 characters."),

  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters."),

  body("source")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Source must not exceed 120 characters."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed.", errors.array());
  }

  next();
};

module.exports = {
  createMedicalHistoryValidation,
  updateMedicalHistoryValidation,
  validate,
};