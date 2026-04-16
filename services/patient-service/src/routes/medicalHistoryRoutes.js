const express = require("express");
const {
  createMedicalHistory,
  getAllMedicalHistory,
  getMedicalHistoryById,
  updateMedicalHistoryById,
  deleteMedicalHistoryById,
} = require("../controllers/medicalHistoryController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createMedicalHistoryValidation,
  updateMedicalHistoryValidation,
  validate,
} = require("../validations/medicalHistoryValidation");

const router = express.Router();

router.use(protect);
router.use(authorize("patient"));

router.post("/", createMedicalHistoryValidation, validate, createMedicalHistory);
router.get("/", getAllMedicalHistory);
router.get("/:id", getMedicalHistoryById);
router.put("/:id", updateMedicalHistoryValidation, validate, updateMedicalHistoryById);
router.delete("/:id", deleteMedicalHistoryById);

module.exports = router;