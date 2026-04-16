import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { User } from "../models/user.model.js";

export const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await User.find().select("-passwordHash");

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: {
      count: users.length,
      users
    }
  });
});

export const updateUserStatusController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { accountStatus } = req.body;

  if (!["active", "suspended"].includes(accountStatus)) {
    throw new AppError("Invalid account status", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { accountStatus },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: { user }
  });
});

export const deleteUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: {}
  });
});