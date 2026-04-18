import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import {
  getDoctorProfile,
  createOrUpdateDoctorProfile,
} from "../services/doctor.service.js";

const handleValidationErrors = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }
};

export const getDoctorProfileController = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfile(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Doctor profile fetched successfully",
    data: {
      doctor,
    },
  });
});

export const createOrUpdateDoctorProfileController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { doctor, isCreated } = await createOrUpdateDoctorProfile(
    req.user.userId,
    req.body,
    req.file
  );

  res.status(isCreated ? 201 : 200).json({
    success: true,
    message: isCreated
      ? "Doctor profile created successfully"
      : "Doctor profile updated successfully",
    data: {
      doctor,
    },
  });
});

export const updateConsultationFeeController = asyncHandler(async (req, res) => {
  const { consultationFee } = req.body;

  if (consultationFee === undefined || consultationFee === null) {
    throw new AppError("Consultation fee is required", 400);
  }

  if (typeof consultationFee !== "number" || consultationFee < 0) {
    throw new AppError("Consultation fee must be a non-negative number", 400);
  }

  const { Doctor } = await import("../models/doctor.model.js");

  const doctor = await Doctor.findOneAndUpdate(
    { authUserId: req.user.userId },
    { consultationFee },
    { new: true }
  );

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Consultation fee updated successfully",
    data: {
      doctor,
    },
  });
});