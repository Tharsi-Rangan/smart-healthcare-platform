import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import {
  getDoctorAvailability,
  saveDoctorAvailability,
} from "../services/availability.service.js";

const handleValidationErrors = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }
};

export const getDoctorAvailabilityController = asyncHandler(async (req, res) => {
  const availability = await getDoctorAvailability(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Doctor availability fetched successfully",
    data: {
      availability,
    },
  });
});

export const saveDoctorAvailabilityController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const availability = await saveDoctorAvailability(req.user.userId, req.body.slots);

  res.status(200).json({
    success: true,
    message: "Doctor availability saved successfully",
    data: {
      availability,
    },
  });
});