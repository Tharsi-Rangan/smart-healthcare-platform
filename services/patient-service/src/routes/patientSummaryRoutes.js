const express = require("express");
const { getPatientSummary } = require("../controllers/patientSummaryController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("patient"));

router.get("/", getPatientSummary);

module.exports = router;