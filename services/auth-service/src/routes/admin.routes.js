import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserStatusController,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", protect, authorize("admin"), getAllUsersController);
router.get("/users/:id", protect, authorize("admin"), getUserByIdController);
router.patch("/users/:id/status", protect, authorize("admin"), updateUserStatusController);

export default router;