import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
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
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);