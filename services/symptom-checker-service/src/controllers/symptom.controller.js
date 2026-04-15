import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  analyzeSymptoms,
  deleteSymptomById,
  deleteSymptomHistory,
  getSymptomHistory,
} from "../services/symptom.service.js";

export const analyzeSymptomsController = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new AppError("Unauthorized", 401);
  }

  const analysis = await analyzeSymptoms(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Symptoms analyzed successfully",
    data: analysis,
  });
});

export const getSymptomHistoryController = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new AppError("Unauthorized", 401);
  }

  const history = await getSymptomHistory(req.user.id);

  res.status(200).json({
    success: true,
    message: "Symptom history fetched successfully",
    data: history,
  });
});

export const deleteSymptomHistoryController = asyncHandler(async (req, res) => {
  await deleteSymptomHistory(req.user.id);

  res.status(200).json({
    success: true,
    message: "All symptom history deleted successfully",
    data: null,
  });
});

export const deleteSymptomByIdController = asyncHandler(async (req, res) => {
  await deleteSymptomById(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "Symptom record deleted successfully",
    data: null,
  });
});