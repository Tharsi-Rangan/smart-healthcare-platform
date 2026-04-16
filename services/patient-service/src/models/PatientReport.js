const mongoose = require("mongoose");

const patientReportSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    reportType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PatientReport", patientReportSchema);