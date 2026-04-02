const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: 250,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      default: "",
    },
    emergencyContactName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    allergiesSummary: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    chronicConditionsSummary: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PatientProfile", patientProfileSchema);