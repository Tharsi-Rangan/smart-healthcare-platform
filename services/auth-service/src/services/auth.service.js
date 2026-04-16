import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { EmailVerificationOtp } from "../models/emailVerificationOtp.model.js";
import { PasswordResetToken } from "../models/passwordResetToken.model.js";
import { AppError } from "../utils/appError.js";
import { hashToken } from "../utils/hashToken.js";
import {
  generateAccessToken,
  generateRandomToken,
  generateOtp,
} from "./token.service.js";
import {
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
} from "./email.service.js";
import { sendSMS, sendWhatsApp } from "./sms.service.js";

const VERIFICATION_OTP_EXPIRY_MS = 1000 * 60 * 10;
const RESET_TOKEN_EXPIRY_MS = 1000 * 60 * 30; // 30 minutes

const createUserAccount = async ({ name, email, password, role, phone }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    phone: phone || '',
    isEmailVerified: false,
    accountStatus: "pending_verification",
  });

  try {
    const otp = generateOtp();
    const otpHash = hashToken(otp);

    await EmailVerificationOtp.deleteMany({ userId: user._id });

    await EmailVerificationOtp.create({
      userId: user._id,
      otpHash,
      expiresAt: new Date(Date.now() + VERIFICATION_OTP_EXPIRY_MS),
      attempts: 0,
    });

    await sendVerificationOtpEmail(user.email, otp);

    return user;
  } catch (error) {
    // Rollback DB inserts if anything fails during OTP saving or Email Sending
    await User.findByIdAndDelete(user._id);
    await EmailVerificationOtp.deleteMany({ userId: user._id });
    
    // Log error internally if needed, then bubble it up to frontend
    console.error("Registration aborted due to email/token error:", error);
    throw new AppError("Error sending verification email. Registration cancelled.", 500);
  }
};

export const registerPatient = async ({ name, email, password, phone }) => {
  return createUserAccount({
    name,
    email,
    password,
    role: "patient",
    phone,
  });
};

export const registerDoctor = async ({ name, email, password, phone }) => {
  return createUserAccount({
    name,
    email,
    password,
    role: "doctor",
    phone,
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  if (user.accountStatus === "suspended") {
    throw new AppError("Your account is suspended", 403);
  }

  if (user.accountStatus !== "active") {
    throw new AppError("Your account is not active yet", 403);
  }

  const token = generateAccessToken(user);

  return {
    token,
    user,
  };
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const otpHash = hashToken(otp);

  const otpRecord = await EmailVerificationOtp.findOne({
    userId: user._id,
  });

  if (!otpRecord) {
    throw new AppError("OTP not found", 400);
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new AppError("OTP has expired", 400);
  }

  if (otpRecord.attempts >= 5) {
    throw new AppError("Too many invalid OTP attempts", 429);
  }

  if (otpRecord.otpHash !== otpHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError("Invalid OTP", 400);
  }

  user.isEmailVerified = true;
  user.accountStatus = "active";
  await user.save();

  await EmailVerificationOtp.deleteMany({ userId: user._id });

  return user;
};

export const resendEmailOtp = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  await EmailVerificationOtp.deleteMany({ userId: user._id });

  const otp = generateOtp();
  const otpHash = hashToken(otp);

  await EmailVerificationOtp.create({
    userId: user._id,
    otpHash,
    expiresAt: new Date(Date.now() + VERIFICATION_OTP_EXPIRY_MS),
    attempts: 0,
  });

  await sendVerificationOtpEmail(user.email, otp);

  if (user.phone) {
    const smsBody = `MediConnect: Your new OTP for email verification is ${otp}.`;
    sendSMS(user.phone, smsBody).catch(err => console.error(err));
    sendWhatsApp(user.phone, smsBody).catch(err => console.error(err));
  }

  return true;
};

export const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);

  await PasswordResetToken.deleteMany({ userId: user._id });

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
  });

  await sendPasswordResetEmail(user.email, rawToken);

  if (user.phone) {
    const smsBody = `MediConnect: Your password reset token is ${rawToken}.`;
    sendSMS(user.phone, smsBody).catch(err => console.error(err));
    sendWhatsApp(user.phone, smsBody).catch(err => console.error(err));
  }

  return true;
};

export const resetPassword = async ({ token, newPassword }) => {
  const tokenHash = hashToken(token);

  const resetRecord = await PasswordResetToken.findOne({ tokenHash });

  if (!resetRecord) {
    throw new AppError("Invalid reset token", 400);
  }

  if (resetRecord.expiresAt < new Date()) {
    throw new AppError("Reset token has expired", 400);
  }

  const user = await User.findById(resetRecord.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  await PasswordResetToken.deleteMany({ userId: user._id });

  return true;
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
