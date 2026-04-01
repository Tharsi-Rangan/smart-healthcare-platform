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
    req.body
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