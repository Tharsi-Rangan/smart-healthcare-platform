import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import {
  createPrescription,
  getPrescriptions,
} from "../services/prescription.service.js";

const handleValidationErrors = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }
};

export const getPrescriptionsController = asyncHandler(async (req, res) => {
  const prescriptions = await getPrescriptions(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Prescriptions fetched successfully",
    data: { prescriptions },
  });
});

export const createPrescriptionController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const prescription = await createPrescription(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: "Prescription created successfully",
    data: { prescription },
  });
});