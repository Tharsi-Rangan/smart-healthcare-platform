import { asyncHandler } from "../utils/asyncHandler.js";
import { getAdminDashboardSummary } from "../services/dashboard.service.js";

export const getAdminDashboardController = asyncHandler(async (req, res) => {
  const summary = await getAdminDashboardSummary();

  res.status(200).json({
    success: true,
    message: "Admin dashboard summary fetched successfully",
    data: {
      summary,
    },
  });
});