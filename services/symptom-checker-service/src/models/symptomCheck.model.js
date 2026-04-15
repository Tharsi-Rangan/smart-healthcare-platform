import mongoose from "mongoose";

const symptomCheckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: "",
      trim: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", ""],
      default: "",
    },
    ageGroup: {
      type: String,
      default: "",
      trim: true,
    },
    recommendedSpecialty: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    preliminarySuggestion: {
      type: String,
      required: true,
      trim: true,
    },
    homeCareTips: {
      type: [String],
      default: [],
    },
    whenToSeekHelp: {
      type: String,
      default: "",
      trim: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["rule-based", "gemini", "endlessmedical"],
      default: "rule-based",
    },
    apiRawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SymptomCheck = mongoose.model("SymptomCheck", symptomCheckSchema);