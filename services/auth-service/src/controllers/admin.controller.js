import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

export const getAllUsersController = asyncHandler(async (req, res) => {
  const { search = "", role = "", status = "" } = req.query;

  const query = {};

  if (search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (role.trim()) {
    query.role = role.trim();
  }

  if (status.trim()) {
    query.accountStatus = status.trim();
  }

  const users = await User.find(query)
    .select("-passwordHash")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: {
      users,
    },
  });
});

export const getUserByIdController = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: {
      user,
    },
  });
});

export const updateUserStatusController = asyncHandler(async (req, res) => {
  const { accountStatus } = req.body;

  const allowedStatuses = ["active", "pending_verification", "suspended"];

  if (!accountStatus || !allowedStatuses.includes(accountStatus)) {
    throw new AppError(
      "Valid accountStatus is required: active, pending_verification, or suspended",
      400
    );
  }

  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.accountStatus = accountStatus;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: {
      user,
    },
  });
});