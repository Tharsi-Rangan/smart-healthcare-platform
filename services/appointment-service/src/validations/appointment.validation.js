import { body, param, validationResult } from "express-validator";
import { AppError } from "../utils/appError.js";

const parseDateParts = (appointmentDate) => {
  const dateInput = String(appointmentDate || "").slice(0, 10);
  const [year, month, day] = dateInput.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return { year, month, day };
};

const isFutureDateTime = (appointmentDate, appointmentTime) => {
  const dateParts = parseDateParts(appointmentDate);

  if (!dateParts) {
    return false;
  }

  const [hours, minutes] = String(appointmentTime)
    .split(":")
    .map((value) => Number(value));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }

  const scheduledAt = new Date(dateParts.year, dateParts.month - 1, dateParts.day);

  scheduledAt.setHours(hours, minutes, 0, 0);

  if (Number.isNaN(scheduledAt.getTime())) {
    return false;
  }

  return scheduledAt.getTime() > Date.now();
};

export const createAppointmentValidation = [
  body("doctorId").notEmpty().withMessage("doctorId is required").bail().isMongoId().withMessage("doctorId must be a valid MongoDB id"),
  body("specialty")
    .notEmpty()
    .withMessage("specialty is required")
    .bail()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("specialty must be between 2 and 100 characters"),
  body("appointmentDate")
    .notEmpty()
    .withMessage("appointmentDate is required")
    .bail()
    .isISO8601()
    .withMessage("appointmentDate must be a valid date"),
  body("appointmentTime")
    .notEmpty()
    .withMessage("appointmentTime is required")
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("appointmentTime must be in HH:mm format"),
  body("consultationType")
    .optional()
    .isIn(["online", "offline"])
    .withMessage("consultationType must be online or offline"),
  body("reason")
    .notEmpty()
    .withMessage("reason is required")
    .bail()
    .isString()
    .isLength({ min: 5, max: 500 })
    .withMessage("reason must be between 5 and 500 characters")
    .custom((value, { req }) => {
      if (!isFutureDateTime(req.body.appointmentDate, req.body.appointmentTime)) {
        throw new Error("Appointment date and time must be in the future");
      }

      return true;
    }),
];

export const appointmentIdValidation = [
  param("id").isMongoId().withMessage("id must be a valid MongoDB id"),
];

export const rescheduleAppointmentValidation = [
  ...appointmentIdValidation,
  body("appointmentDate")
    .notEmpty()
    .withMessage("appointmentDate is required")
    .bail()
    .isISO8601()
    .withMessage("appointmentDate must be a valid date"),
  body("appointmentTime")
    .notEmpty()
    .withMessage("appointmentTime is required")
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("appointmentTime must be in HH:mm format")
    .custom((value, { req }) => {
      if (!isFutureDateTime(req.body.appointmentDate, req.body.appointmentTime)) {
        throw new Error("Appointment date and time must be in the future");
      }

      return true;
    }),
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  next();
};
