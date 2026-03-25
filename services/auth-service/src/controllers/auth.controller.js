import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import {
  registerPatient,
  registerDoctor,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../services/auth.service.js";

const handleValidationErrors = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }
};

export const registerPatientController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const user = await registerPatient(req.body);

  res.status(201).json({
    success: true,
    message: "Patient registered successfully. Please verify your email.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
      },
    },
  });
});

export const registerDoctorController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const user = await registerDoctor(req.body);

  res.status(201).json({
    success: true,
    message: "Doctor registered successfully. Please verify your email.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
      },
    },
  });
});

export const loginController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { token, user } = await loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
      },
    },
  });
});

export const verifyEmailController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  await verifyEmail(req.body);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const resendVerificationEmailController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  await resendVerificationEmail(req.body);

  res.status(200).json({
    success: true,
    message: "Verification email sent successfully",
  });
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  await forgotPassword(req.body);

  res.status(200).json({
    success: true,
    message: "Password reset email sent successfully",
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  await resetPassword(req.body);

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

export const getCurrentUserController = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Current user fetched successfully",
    data: {
      user,
    },
  });
});