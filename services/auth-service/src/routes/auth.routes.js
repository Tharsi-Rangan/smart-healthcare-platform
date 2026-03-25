import express from "express";
import {
  forgotPasswordValidation,
  loginValidation,
  registerDoctorValidation,
  registerPatientValidation,
  resendVerificationValidation,
  resetPasswordValidation,
  verifyEmailValidation,
} from "../validations/auth.validation.js";
import {
  forgotPasswordController,
  getCurrentUserController,
  loginController,
  registerDoctorController,
  registerPatientController,
  resendVerificationEmailController,
  resetPasswordController,
  verifyEmailController,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register/patient", registerPatientValidation, registerPatientController);
router.post("/register/doctor", registerDoctorValidation, registerDoctorController);
router.post("/login", loginValidation, loginController);
router.post("/verify-email", verifyEmailValidation, verifyEmailController);
router.post(
  "/resend-verification-email",
  resendVerificationValidation,
  resendVerificationEmailController
);
router.post("/forgot-password", forgotPasswordValidation, forgotPasswordController);
router.post("/reset-password", resetPasswordValidation, resetPasswordController);
router.get("/me", protect, getCurrentUserController);

export default router;