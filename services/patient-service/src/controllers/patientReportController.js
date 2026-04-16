const fs = require("fs");
const path = require("path");
const PatientReport = require("../models/PatientReport");
const PatientProfile = require("../models/PatientProfile");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const createPatientReport = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({ authUserId: req.user.userId });

  if (!profile) {
    return sendError(res, 404, "Patient profile not found. Create profile first.");
  }

  if (!req.file) {
    return sendError(res, 400, "Report file is required.");
  }

  const report = await PatientReport.create({
    authUserId: req.user.userId,
    patientProfileId: profile._id,
    title: req.body.title,
    reportType: req.body.reportType || "",
    description: req.body.description || "",
    fileName: req.file.filename,
    originalFileName: req.file.originalname,
    filePath: `/uploads/reports/${req.file.filename}`,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedAt: new Date(),
  });

  return sendSuccess(res, 201, "Patient report uploaded successfully.", {
    report,
  });
});

const getAllPatientReports = asyncHandler(async (req, res) => {
  const reports = await PatientReport.find({
    authUserId: req.user.userId,
  }).sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Patient reports fetched successfully.", {
    count: reports.length,
    reports,
  });
});

const getPatientReportById = asyncHandler(async (req, res) => {
  const report = await PatientReport.findOne({
    _id: req.params.id,
    authUserId: req.user.userId,
  });

  if (!report) {
    return sendError(res, 404, "Patient report not found.");
  }

  return sendSuccess(res, 200, "Patient report fetched successfully.", {
    report,
  });
});

const updatePatientReportById = asyncHandler(async (req, res) => {
  const report = await PatientReport.findOne({
    _id: req.params.id,
    authUserId: req.user.userId,
  });

  if (!report) {
    return sendError(res, 404, "Patient report not found.");
  }

  const fieldsToUpdate = ["title", "reportType", "description"];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      report[field] = req.body[field];
    }
  });

  await report.save();

  return sendSuccess(res, 200, "Patient report updated successfully.", {
    report,
  });
});

const replacePatientReportFile = asyncHandler(async (req, res) => {
  const report = await PatientReport.findOne({
    _id: req.params.id,
    authUserId: req.user.userId,
  });

  if (!report) {
    return sendError(res, 404, "Patient report not found.");
  }

  if (!req.file) {
    return sendError(res, 400, "New report file is required.");
  }

  const oldFilePath = path.join(process.cwd(), report.filePath.replace(/^\//, ""));

  if (fs.existsSync(oldFilePath)) {
    fs.unlinkSync(oldFilePath);
  }

  report.fileName = req.file.filename;
  report.originalFileName = req.file.originalname;
  report.filePath = `/uploads/reports/${req.file.filename}`;
  report.mimeType = req.file.mimetype;
  report.fileSize = req.file.size;
  report.uploadedAt = new Date();

  await report.save();

  return sendSuccess(res, 200, "Patient report file replaced successfully.", {
    report,
  });
});

const deletePatientReportById = asyncHandler(async (req, res) => {
  const report = await PatientReport.findOne({
    _id: req.params.id,
    authUserId: req.user.userId,
  });

  if (!report) {
    return sendError(res, 404, "Patient report not found.");
  }

  const absoluteFilePath = path.join(process.cwd(), report.filePath.replace(/^\//, ""));

  if (fs.existsSync(absoluteFilePath)) {
    fs.unlinkSync(absoluteFilePath);
  }

  await report.deleteOne();

  return sendSuccess(res, 200, "Patient report deleted successfully.");
});

module.exports = {
  createPatientReport,
  getAllPatientReports,
  getPatientReportById,
  updatePatientReportById,
  replacePatientReportFile,
  deletePatientReportById,
};