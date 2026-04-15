import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import {
  createPatientReport,
  getPatientReportById,
  getPatientReports,
} from "../services/report.service.js";

const handleValidationErrors = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }
};

export const getPatientReportsController = asyncHandler(async (req, res) => {
  const reports = await getPatientReports(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Patient reports fetched successfully",
    data: { reports },
  });
});

export const getPatientReportByIdController = asyncHandler(async (req, res) => {
  const report = await getPatientReportById(req.user.userId, req.params.id);

  res.status(200).json({
    success: true,
    message: "Patient report fetched successfully",
    data: { report },
  });
});

export const createPatientReportController = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const report = await createPatientReport(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: "Patient report created successfully",
    data: { report },
  });
});