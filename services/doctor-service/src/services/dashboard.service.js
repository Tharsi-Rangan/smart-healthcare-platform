import { Doctor } from "../models/doctor.model.js";
import { Availability } from "../models/availability.model.js";

export const getAdminDashboardSummary = async () => {
  const totalDoctors = await Doctor.countDocuments();

  const approvedDoctors = await Doctor.countDocuments({
    approvalStatus: "approved",
  });

  const pendingDoctors = await Doctor.countDocuments({
    approvalStatus: "pending",
  });

  const totalAvailabilitySlots = await Availability.countDocuments({
    isActive: true,
  });

  return {
    totalDoctors,
    approvedDoctors,
    pendingDoctors,
    totalAvailabilitySlots,
  };
};