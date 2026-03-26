import express from "express";
import {
  forgotPasswordValidation,
  loginValidation,
  registerDoctorValidation,
  registerPatientValidation,
  resendEmailOtpValidation,
  resetPasswordValidation,
  verifyEmailOtpValidation,
} from "../validations/auth.validation.js";
import {
  forgotPasswordController,
  getCurrentUserController,
  loginController,
  registerDoctorController,
  registerPatientController,
  resendEmailOtpController,
  resetPasswordController,
  verifyEmailOtpController,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/register/patient",
  registerPatientValidation,
  registerPatientController,
);
router.post(
  "/register/doctor",
  registerDoctorValidation,
  registerDoctorController,
);
router.post("/login", loginValidation, loginController);
router.post("/verify-email-otp", verifyEmailOtpValidation, verifyEmailOtpController);
router.post("/resend-email-otp", resendEmailOtpValidation, resendEmailOtpController);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  forgotPasswordController,
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  resetPasswordController,
);
router.get("/me", protect, getCurrentUserController);

export default router;
