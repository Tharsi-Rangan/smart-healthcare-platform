const PatientProfile = require("../models/PatientProfile");
const MedicalHistory = require("../models/MedicalHistory");
const PatientReport = require("../models/PatientReport");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getPatientSummary = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({
    authUserId: req.user.userId,
  });

  if (!profile) {
    return sendSuccess(res, 200, "Patient summary fetched successfully.", {
      summary: {
        profile: null,
        counts: {
          medicalHistory: 0,
          reports: 0,
        },
        latestMedicalHistory: null,
        latestReport: null,
      },
    });
  }

  const [medicalHistoryCount, reportsCount, latestMedicalHistory, latestReport] =
    await Promise.all([
      MedicalHistory.countDocuments({ authUserId: req.user.userId }),
      PatientReport.countDocuments({ authUserId: req.user.userId }),
      MedicalHistory.findOne({ authUserId: req.user.userId }).sort({ createdAt: -1 }),
      PatientReport.findOne({ authUserId: req.user.userId }).sort({ createdAt: -1 }),
    ]);

  return sendSuccess(res, 200, "Patient summary fetched successfully.", {
    summary: {
      profile: {
        authUserId: profile.authUserId,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        bloodGroup: profile.bloodGroup,
      },
      counts: {
        medicalHistory: medicalHistoryCount,
        reports: reportsCount,
      },
      latestMedicalHistory,
      latestReport,
    },
  });
});

module.exports = {
  getPatientSummary,
};