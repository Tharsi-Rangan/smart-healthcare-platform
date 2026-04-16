const fs = require("fs");
const path = require("path");
const PatientProfile = require("../models/PatientProfile");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const createPatientProfile = asyncHandler(async (req, res) => {
  const existingProfile = await PatientProfile.findOne({
    authUserId: req.user.userId,
  });

  if (existingProfile) {
    return sendError(res, 409, "Patient profile already exists.");
  }

  const profile = await PatientProfile.create({
    authUserId: req.user.userId,
    email: req.user.email,
    fullName: req.body.fullName,
    phone: req.body.phone || "",
    dateOfBirth: req.body.dateOfBirth || null,
    gender: req.body.gender || "prefer_not_to_say",
    address: req.body.address || "",
    bloodGroup: req.body.bloodGroup || "",
    emergencyContactName: req.body.emergencyContactName || "",
    emergencyContactRelationship: req.body.emergencyContactRelationship || "",
    emergencyContactPhone: req.body.emergencyContactPhone || "",
    allergiesSummary: req.body.allergiesSummary || "",
    chronicConditionsSummary: req.body.chronicConditionsSummary || "",
    profileImage: req.body.profileImage || "",
  });

  return sendSuccess(res, 201, "Patient profile created successfully.", {
    profile,
  });
});

const getCurrentPatientProfile = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({
    authUserId: req.user.userId,
  });

  if (!profile) {
    return sendSuccess(res, 200, "Patient profile fetched successfully.", {
      profile: null,
    });
  }

  return sendSuccess(res, 200, "Patient profile fetched successfully.", {
    profile,
  });
});

const updateCurrentPatientProfile = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({
    authUserId: req.user.userId,
  });

  if (!profile) {
    return sendError(res, 404, "Patient profile not found.");
  }

  const fieldsToUpdate = [
    "fullName",
    "phone",
    "dateOfBirth",
    "gender",
    "address",
    "bloodGroup",
    "emergencyContactName",
    "emergencyContactRelationship",
    "emergencyContactPhone",
    "allergiesSummary",
    "chronicConditionsSummary",
    "profileImage",
  ];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      profile[field] = req.body[field];
    }
  });

  await profile.save();

  return sendSuccess(res, 200, "Patient profile updated successfully.", {
    profile,
  });
});

const uploadPatientProfileAvatar = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({
    authUserId: req.user.userId,
  });

  if (!profile) {
    return sendError(res, 404, "Patient profile not found.");
  }

  if (!req.file) {
    return sendError(res, 400, "Profile image file is required.");
  }

  if (
    profile.profileImage &&
    profile.profileImage.startsWith("/uploads/avatars/")
  ) {
    const oldAvatarPath = path.join(
      process.cwd(),
      profile.profileImage.replace(/^\//, "")
    );

    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  profile.profileImage = `/uploads/avatars/${req.file.filename}`;
  await profile.save();

  return sendSuccess(res, 200, "Profile photo uploaded successfully.", {
    profile,
  });
});

module.exports = {
  createPatientProfile,
  getCurrentPatientProfile,
  updateCurrentPatientProfile,
  uploadPatientProfileAvatar,
};