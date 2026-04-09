import { Router } from "express";
import {
  analyzeSymptomsController,
  getSymptomHistoryController,
  deleteSymptomHistoryController,
  deleteSymptomByIdController,
} from "../controllers/symptom.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  analyzeSymptomsValidation,
  symptomIdValidation,
  validateRequest,
} from "../validations/symptom.validation.js";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("patient"));

router.post(
  "/analyze",
  analyzeSymptomsValidation,
  validateRequest,
  analyzeSymptomsController
);

router.get("/history", getSymptomHistoryController);

router.delete("/history", deleteSymptomHistoryController);

router.delete(
  "/:id",
  symptomIdValidation,
  validateRequest,
  deleteSymptomByIdController
);

export default router;