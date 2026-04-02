const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

const createPatientProfileValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters."),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 characters."),

  body("dateOfBirth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid date."),

  body("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage("Gender value is invalid."),

  body("address")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 250 })
    .withMessage("Address must not exceed 250 characters."),

  body("bloodGroup")
    .optional({ checkFalsy: true })
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Blood group is invalid."),

  body("emergencyContactName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Emergency contact name must not exceed 100 characters."),

  body("emergencyContactPhone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Emergency contact phone must be between 7 and 20 characters."),

  body("allergiesSummary")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Allergies summary must not exceed 500 characters."),

  body("chronicConditionsSummary")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Chronic conditions summary must not exceed 500 characters."),

  body("profileImage")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Profile image must be a valid URL."),
];

const updatePatientProfileValidation = [
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters."),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 characters."),

  body("dateOfBirth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid date."),

  body("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage("Gender value is invalid."),

  body("address")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 250 })
    .withMessage("Address must not exceed 250 characters."),

  body("bloodGroup")
    .optional({ checkFalsy: true })
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Blood group is invalid."),

  body("emergencyContactName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Emergency contact name must not exceed 100 characters."),

  body("emergencyContactPhone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Emergency contact phone must be between 7 and 20 characters."),

  body("allergiesSummary")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Allergies summary must not exceed 500 characters."),

  body("chronicConditionsSummary")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Chronic conditions summary must not exceed 500 characters."),

  body("profileImage")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Profile image must be a valid URL."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed.", errors.array());
  }

  next();
};

module.exports = {
  createPatientProfileValidation,
  updatePatientProfileValidation,
  validate,
};