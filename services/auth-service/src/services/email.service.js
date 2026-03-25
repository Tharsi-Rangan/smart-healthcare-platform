import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.mailHost,
  port: env.mailPort,
  secure: false,
  auth: {
    user: env.mailUser,
    pass: env.mailPass,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${env.clientUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: env.mailFrom,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your account:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: env.mailFrom,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });
};