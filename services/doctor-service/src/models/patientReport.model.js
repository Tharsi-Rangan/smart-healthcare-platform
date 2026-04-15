import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientAge: {
      type: Number,
      default: 0,
    },
    bloodType: {
      type: String,
      default: "",
      trim: true,
    },
    allergies: {
      type: String,
      default: "",
      trim: true,
    },
    reports: [
      {
        title: { type: String, required: true },
        type: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
        reportDate: { type: String, default: "" },
        size: { type: String, default: "" },
      },
    ],
    medicalHistory: [
      {
        condition: { type: String, required: true },
        description: { type: String, default: "" },
        diagnosedYear: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const PatientReport = mongoose.model("PatientReport", patientReportSchema);