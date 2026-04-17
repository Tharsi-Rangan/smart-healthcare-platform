import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      default: "",
      trim: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientAge: {
      type: Number,
      default: null,
    },
    patientPhone: {
      type: String,
      default: "",
      trim: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    symptoms: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, default: "" }, // e.g., "Twice daily", "3 times daily"
        duration: { type: String, default: "" }, // e.g., "7 days", "2 weeks"
        instructions: { type: String, default: "" }, // e.g., "Take with food"
      },
    ],
    testsToBeDone: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
      },
    ],
    followUpDate: {
      type: Date,
      default: null,
    },
    warningsAndSideEffects: {
      type: String,
      default: "",
      trim: true,
    },
    allergies: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    validityPeriod: {
      type: String,
      default: "10 days", // Default validity
      trim: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    issuedAt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Prescription = mongoose.model("Prescription", prescriptionSchema);