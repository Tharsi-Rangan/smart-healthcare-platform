import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadDoctorProfilePhoto } from "../middleware/upload.middleware.js";

import { doctorProfileValidation } from "../validations/doctor.validation.js";
import { availabilityValidation } from "../validations/availability.validation.js";
import { appointmentValidation } from "../validations/appointment.validation.js";
import { patientReportValidation } from "../validations/report.validation.js";
import { prescriptionValidation } from "../validations/prescription.validation.js";

import {
  getDoctorProfileController,
  createOrUpdateDoctorProfileController,
  updateConsultationFeeController,
} from "../controllers/doctor.controller.js";

import {
  getDoctorAvailabilityController,
  saveDoctorAvailabilityController,
} from "../controllers/availability.controller.js";

import {
  getPublicDoctorsController,
  getPendingDoctorsController,
  getAllDoctorsController,
  approveDoctorController,
  rejectDoctorController,
  getDoctorByIdController,
  toggleDoctorActiveStatusController,
} from "../controllers/admin.controller.js";

import { getAdminDashboardController } from "../controllers/dashboard.controller.js";

import {
  createAppointmentController,
  getDoctorAppointmentsController,
  updateAppointmentStatusController,
} from "../controllers/appointment.controller.js";

import {
  createPatientReportController,
  getPatientReportByIdController,
  getPatientReportsController,
} from "../controllers/report.controller.js";

import {
  createPrescriptionController,
  getPrescriptionsController,
} from "../controllers/prescription.controller.js";

const router = express.Router();

/* Public doctor listing */
router.get("/public/list", getPublicDoctorsController);
router.get("/public/:id", getDoctorByIdController);

/* Doctor profile */
router.get("/profile", protect, authorize("doctor"), getDoctorProfileController);

router.put(
  "/profile",
  protect,
  authorize("doctor"),
  uploadDoctorProfilePhoto.single("profilePhoto"),
  doctorProfileValidation,
  createOrUpdateDoctorProfileController
);

/* Doctor consultation fee */
router.put(
  "/consultation-fee",
  protect,
  authorize("doctor"),
  updateConsultationFeeController
);

/* Doctor availability */
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

/* Doctor appointments */
router.get(
  "/appointments",
  protect,
  authorize("doctor"),
  getDoctorAppointmentsController
);

router.post(
  "/appointments",
  protect,
  authorize("doctor"),
  appointmentValidation,
  createAppointmentController
);

router.patch(
  "/appointments/:id/status",
  protect,
  authorize("doctor"),
  updateAppointmentStatusController
);

/* Doctor reports */
router.get("/reports", protect, authorize("doctor"), getPatientReportsController);

router.get(
  "/reports/:id",
  protect,
  authorize("doctor"),
  getPatientReportByIdController
);

router.post(
  "/reports",
  protect,
  authorize("doctor"),
  patientReportValidation,
  createPatientReportController
);

/* Doctor prescriptions */
router.get(
  "/prescriptions",
  protect,
  authorize("doctor"),
  getPrescriptionsController
);

router.post(
  "/prescriptions",
  protect,
  authorize("doctor"),
  prescriptionValidation,
  createPrescriptionController
);

/* Admin dashboard */
router.get(
  "/admin/dashboard",
  protect,
  authorize("admin"),
  getAdminDashboardController
);

/* Admin doctor management */
router.get("/pending", protect, authorize("admin"), getPendingDoctorsController);
router.get("/", protect, authorize("admin"), getAllDoctorsController);
router.get("/:id", protect, authorize("admin"), getDoctorByIdController);
router.patch("/:id/approve", protect, authorize("admin"), approveDoctorController);
router.patch("/:id/reject", protect, authorize("admin"), rejectDoctorController);
router.patch(
  "/:id/toggle-active",
  protect,
  authorize("admin"),
  toggleDoctorActiveStatusController
);

export default router;