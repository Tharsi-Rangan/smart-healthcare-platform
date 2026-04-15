const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

const nameRegex = /^[A-Za-z\s.'-]+$/;

const validateDateOfBirth = (value) => {
  if (!value) return true;

  const selectedDate = new Date(value);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate <= today;
};

const createPatientProfileValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters.")
    .matches(nameRegex)
    .withMessage("Full name must contain only valid name characters."),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 characters."),

  body("dateOfBirth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid date.")
    .custom(validateDateOfBirth)
    .withMessage("Date of birth cannot be in the future."),

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
    .withMessage("Emergency contact name must not exceed 100 characters.")
    .matches(nameRegex)
    .withMessage("Emergency contact name must contain only valid name characters."),

  body("emergencyContactRelationship")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Emergency contact relationship must not exceed 50 characters."),

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

  body().custom((value) => {
    const hasAnyEmergencyField =
      value.emergencyContactName ||
      value.emergencyContactRelationship ||
      value.emergencyContactPhone;

    if (hasAnyEmergencyField) {
      if (!value.emergencyContactName) {
        throw new Error("Emergency contact name is required when emergency contact details are provided.");
      }

      if (!value.emergencyContactRelationship) {
        throw new Error("Emergency contact relationship is required when emergency contact details are provided.");
      }

      if (!value.emergencyContactPhone) {
        throw new Error("Emergency contact phone is required when emergency contact details are provided.");
      }
    }

    return true;
  }),
];

const updatePatientProfileValidation = [
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters.")
    .matches(nameRegex)
    .withMessage("Full name must contain only valid name characters."),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 characters."),

  body("dateOfBirth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid date.")
    .custom(validateDateOfBirth)
    .withMessage("Date of birth cannot be in the future."),

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
    .withMessage("Emergency contact name must not exceed 100 characters.")
    .matches(nameRegex)
    .withMessage("Emergency contact name must contain only valid name characters."),

  body("emergencyContactRelationship")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Emergency contact relationship must not exceed 50 characters."),

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
    .isLength({ max: 500 })
    .withMessage("Profile image path must not exceed 500 characters."),

  body().custom((value) => {
    const hasAnyEmergencyField =
      value.emergencyContactName ||
      value.emergencyContactRelationship ||
      value.emergencyContactPhone;

    if (hasAnyEmergencyField) {
      if (!value.emergencyContactName) {
        throw new Error("Emergency contact name is required when emergency contact details are provided.");
      }

      if (!value.emergencyContactRelationship) {
        throw new Error("Emergency contact relationship is required when emergency contact details are provided.");
      }

      if (!value.emergencyContactPhone) {
        throw new Error("Emergency contact phone is required when emergency contact details are provided.");
      }
    }

    return true;
  }),
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