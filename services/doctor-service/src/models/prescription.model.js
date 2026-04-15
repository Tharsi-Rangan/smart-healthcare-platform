import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
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
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
      },
    ],
    notes: {
      type: String,
      default: "",
      trim: true,
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