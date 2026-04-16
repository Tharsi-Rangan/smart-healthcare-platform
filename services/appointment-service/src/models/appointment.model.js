import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    appointmentTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    consultationType: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    patientDetails: {
      fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 120,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        maxlength: 20,
      },
      address: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 250,
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
