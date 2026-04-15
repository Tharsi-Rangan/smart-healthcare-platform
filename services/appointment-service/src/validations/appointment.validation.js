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

const isValidCalendarDate = (appointmentDate) => {
  const dateParts = parseDateParts(appointmentDate);

  if (!dateParts) {
    return false;
  }

  const { year, month, day } = dateParts;
  const date = new Date(year, month - 1, day);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const isFutureDateTime = (appointmentDate, appointmentTime) => {
  const dateParts = parseDateParts(appointmentDate);

  if (!dateParts) {
    return false;
  }

  const [hours, minutes] = String(appointmentTime)
    .trim()
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
  body("doctorId")
    .notEmpty()
    .withMessage("doctorId is required")
    .bail()
    .isMongoId()
    .withMessage("doctorId must be a valid MongoDB id"),

  body("specialty")
    .notEmpty()
    .withMessage("specialty is required")
    .bail()
    .isString()
    .withMessage("specialty must be a string")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("specialty must be between 2 and 100 characters"),

  body("appointmentDate")
    .notEmpty()
    .withMessage("appointmentDate is required")
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("appointmentDate must be in YYYY-MM-DD format")
    .bail()
    .custom((value) => {
      if (!isValidCalendarDate(value)) {
        throw new Error("appointmentDate must be a valid calendar date");
      }
      return true;
    }),

  body("appointmentTime")
    .notEmpty()
    .withMessage("appointmentTime is required")
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("appointmentTime must be in HH:mm format")
    .bail()
    .custom((value, { req }) => {
      if (!isFutureDateTime(req.body.appointmentDate, value)) {
        throw new Error("Appointment date and time must be in the future");
      }
      return true;
    }),

  body("consultationType")
    .optional()
    .isIn(["online", "offline"])
    .withMessage("consultationType must be online or offline"),

  body("reason")
    .notEmpty()
    .withMessage("reason is required")
    .bail()
    .isString()
    .withMessage("reason must be a string")
    .bail()
    .isLength({ min: 5, max: 500 })
    .withMessage("reason must be between 5 and 500 characters"),
];

export const appointmentIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("id must be a valid MongoDB id"),
];

export const rescheduleAppointmentValidation = [
  ...appointmentIdValidation,

  body("appointmentDate")
    .notEmpty()
    .withMessage("appointmentDate is required")
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("appointmentDate must be in YYYY-MM-DD format")
    .bail()
    .custom((value) => {
      if (!isValidCalendarDate(value)) {
        throw new Error("appointmentDate must be a valid calendar date");
      }
      return true;
    }),

  body("appointmentTime")
    .notEmpty()
    .withMessage("appointmentTime is required")
    .bail()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("appointmentTime must be in HH:mm format")
    .bail()
    .custom((value, { req }) => {
      if (!isFutureDateTime(req.body.appointmentDate, value)) {
        throw new Error("Appointment date and time must be in the future");
      }
      return true;
    }),
];

export const updateAppointmentStatusValidation = [
  ...appointmentIdValidation,

  body("status")
    .notEmpty()
    .withMessage("status is required")
    .bail()
    .isIn(["confirmed", "completed"])
    .withMessage("status must be confirmed or completed"),
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  next();
};