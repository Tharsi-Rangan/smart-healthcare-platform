const express = require("express");
const {
  createPatientProfile,
  getCurrentPatientProfile,
  updateCurrentPatientProfile,
} = require("../controllers/patientProfileController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createPatientProfileValidation,
  updatePatientProfileValidation,
  validate,
} = require("../validations/patientProfileValidation");

const router = express.Router();

router.use(protect);
router.use(authorize("patient"));

router.post("/profile", createPatientProfileValidation, validate, createPatientProfile);
router.get("/profile", getCurrentPatientProfile);
router.put("/profile", updatePatientProfileValidation, validate, updateCurrentPatientProfile);

module.exports = router;