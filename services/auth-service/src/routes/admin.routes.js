import express from "express";
import { 
  getAllUsersController,
  updateUserStatusController,
  deleteUserController
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/users", protect, authorize("admin"), getAllUsersController);
router.patch("/users/:userId/status", protect, authorize("admin"), updateUserStatusController);
router.delete("/users/:userId", protect, authorize("admin"), deleteUserController);

export default router;