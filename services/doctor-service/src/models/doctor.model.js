import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    hospital: {
      type: String,
      default: "",
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    profilePhotoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 500,
      min: 0,
      description: "Consultation fee in LKR",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminReviewMessage: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);