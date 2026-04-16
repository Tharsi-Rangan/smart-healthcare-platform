const MedicalHistory = require("../models/MedicalHistory");
const PatientProfile = require("../models/PatientProfile");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getPatientProfileOrFail = async (authUserId) => {
  return PatientProfile.findOne({ authUserId });
};

const createMedicalHistory = asyncHandler(async (req, res) => {
  const profile = await getPatientProfileOrFail(req.user.userId);

  if (!profile) {
    return sendError(res, 404, "Patient profile not found. Create profile first.");
  }

  const entry = await MedicalHistory.create({
    authUserId: req.user.userId,
    patientProfileId: profile._id,
    conditionName: req.body.conditionName,
    diagnosisDate: req.body.diagnosisDate || null,
    status: req.body.status || "active",
    medications: req.body.medications || "",
    notes: req.body.notes || "",
    source: req.body.source || "",
  });

  return sendSuccess(res, 201, "Medical history entry created successfully.", {
    entry,
  });
});

const getAllMedicalHistory = asyncHandler(async (req, res) => {
  const entries = await MedicalHistory.find({
    authUserId: req.user.userId,
  }).sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Medical history fetched successfully.", {
    count: entries.length,
    entries,
  });
});

const getMedicalHistoryById = asyncHandler(async (req, res) => {
  const entry = await MedicalHistory.findOne({
    _id: req.params.id,
    authUserId: req.user.userId,
  });

  if (!entry) {
    return sendError(res, 404, "Medical history entry not found.");
  }

  return sendSuccess(res, 200, "Medical history entry fetched successfully.", {
    entry,
  });
});

const updateMedicalHistoryById = asyncHandler(async (req, res) => {
  const entry = await MedicalHistory.findOne({
    _id: req.params.id,
    authUserId: req.user.userId,
  });

  if (!entry) {
    return sendError(res, 404, "Medical history entry not found.");
  }

  const fieldsToUpdate = [
    "conditionName",
    "diagnosisDate",
    "status",
    "medications",
    "notes",
    "source",
  ];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      entry[field] = req.body[field];
    }
  });

  await entry.save();

  return sendSuccess(res, 200, "Medical history entry updated successfully.", {
    entry,
  });
});

const deleteMedicalHistoryById = asyncHandler(async (req, res) => {
  const entry = await MedicalHistory.findOneAndDelete({
    _id: req.params.id,
    authUserId: req.user.userId,
  });

  if (!entry) {
    return sendError(res, 404, "Medical history entry not found.");
  }

  return sendSuccess(res, 200, "Medical history entry deleted successfully.");
});

module.exports = {
  createMedicalHistory,
  getAllMedicalHistory,
  getMedicalHistoryById,
  updateMedicalHistoryById,
  deleteMedicalHistoryById,
};