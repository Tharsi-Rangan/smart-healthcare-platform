import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { doctorProfileValidation } from "../validations/doctor.validation.js";
import { availabilityValidation } from "../validations/availability.validation.js";
import {
  getDoctorProfileController,
  createOrUpdateDoctorProfileController,
} from "../controllers/doctor.controller.js";
import {
  getDoctorAvailabilityController,
  saveDoctorAvailabilityController,
} from "../controllers/availability.controller.js";
import {
  getPendingDoctorsController,
  getAllDoctorsController,
  approveDoctorController,
  rejectDoctorController,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/profile", protect, authorize("doctor"), getDoctorProfileController);
router.put(
  "/profile",
  protect,
  authorize("doctor"),
  doctorProfileValidation,
  createOrUpdateDoctorProfileController
);

router.get(
  "/availability",
  protect,
  authorize("doctor"),
  getDoctorAvailabilityController
);

router.put(
  "/availability",
  protect,
  authorize("doctor"),
  availabilityValidation,
  saveDoctorAvailabilityController
);

router.get(
  "/pending",
  protect,
  authorize("admin"),
  getPendingDoctorsController
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getAllDoctorsController
);

router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveDoctorController
);

router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectDoctorController
);

export default router;