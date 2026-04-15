import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    videoSessionId: {
      type: String,
      default: null,
    },
    videoLink: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.model("Consultation", consultationSchema);

export default Consultation;
