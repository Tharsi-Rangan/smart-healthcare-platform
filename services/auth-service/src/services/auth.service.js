import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { EmailVerificationToken } from "../models/emailVerificationToken.model.js";
import { PasswordResetToken } from "../models/passwordResetToken.model.js";
import { AppError } from "../utils/appError.js";
import { hashToken } from "../utils/hashToken.js";
import {
  generateAccessToken,
  generateRandomToken,
} from "./token.service.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./email.service.js";

const VERIFICATION_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours
const RESET_TOKEN_EXPIRY_MS = 1000 * 60 * 30; // 30 minutes

const createUserAccount = async ({ name, email, password, role }) => {
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
    isEmailVerified: false,
    accountStatus: "pending_verification",
  });

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);

  await EmailVerificationToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
  });

  await sendVerificationEmail(user.email, rawToken);

  return user;
};

export const registerPatient = async ({ name, email, password }) => {
  return createUserAccount({
    name,
    email,
    password,
    role: "patient",
  });
};

export const registerDoctor = async ({ name, email, password }) => {
  return createUserAccount({
    name,
    email,
    password,
    role: "doctor",
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

export const verifyEmail = async ({ token }) => {
  const tokenHash = hashToken(token);

  const verificationRecord = await EmailVerificationToken.findOne({
    tokenHash,
  });

  if (!verificationRecord) {
    throw new AppError("Invalid verification token", 400);
  }

  if (verificationRecord.expiresAt < new Date()) {
    throw new AppError("Verification token has expired", 400);
  }

  const user = await User.findById(verificationRecord.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isEmailVerified = true;
  user.accountStatus = "active";
  await user.save();

  await EmailVerificationToken.deleteMany({ userId: user._id });

  return user;
};

export const resendVerificationEmail = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  await EmailVerificationToken.deleteMany({ userId: user._id });

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);

  await EmailVerificationToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
  });

  await sendVerificationEmail(user.email, rawToken);

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