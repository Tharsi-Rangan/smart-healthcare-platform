const express = require("express");
const {
  createPatientReport,
  getAllPatientReports,
  getPatientReportById,
  updatePatientReportById,
  replacePatientReportFile,
  deletePatientReportById,
} = require("../controllers/patientReportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadReport } = require("../middleware/uploadMiddleware");
const {
  createPatientReportValidation,
  updatePatientReportValidation,
  validate,
} = require("../validations/patientReportValidation");

const router = express.Router();

router.use(protect);
router.use(authorize("patient"));

router.post(
  "/",
  uploadReport.single("reportFile"),
  createPatientReportValidation,
  validate,
  createPatientReport
);

router.get("/", getAllPatientReports);
router.get("/:id", getPatientReportById);
router.put("/:id", updatePatientReportValidation, validate, updatePatientReportById);
router.put("/:id/file", uploadReport.single("reportFile"), replacePatientReportFile);
router.delete("/:id", deletePatientReportById);

module.exports = router;