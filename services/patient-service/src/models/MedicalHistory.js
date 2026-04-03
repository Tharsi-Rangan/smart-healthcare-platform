const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema(
  {
    authUserId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    conditionName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    diagnosisDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "ongoing"],
      default: "active",
    },
    medications: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    source: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MedicalHistory", medicalHistorySchema);