import { body } from "express-validator";

export const availabilityValidation = [
  body("slots")
    .isArray({ min: 1 })
    .withMessage("Slots array is required"),

  body("slots.*.day")
    .trim()
    .notEmpty()
    .withMessage("Day is required"),

  body("slots.*.startTime")
    .trim()
    .notEmpty()
    .withMessage("Start time is required"),

  body("slots.*.endTime")
    .trim()
    .notEmpty()
    .withMessage("End time is required"),

  body("slots.*.slotDuration")
    .optional()
    .isInt({ min: 5 })
    .withMessage("Slot duration must be at least 5 minutes"),

  body("slots.*.isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),
];