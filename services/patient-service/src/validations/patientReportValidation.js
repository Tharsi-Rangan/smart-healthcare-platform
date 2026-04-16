const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

const createPatientReportValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 150 })
    .withMessage("Title must not exceed 150 characters."),

  body("reportType")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Report type must not exceed 100 characters."),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters."),
];

const updatePatientReportValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty.")
    .isLength({ max: 150 })
    .withMessage("Title must not exceed 150 characters."),

  body("reportType")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Report type must not exceed 100 characters."),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed.", errors.array());
  }

  next();
};

module.exports = {
  createPatientReportValidation,
  updatePatientReportValidation,
  validate,
};