import { Doctor } from "../models/doctor.model.js";
import { Availability } from "../models/availability.model.js";

export const getAdminDashboardSummary = async () => {
  const totalDoctors = await Doctor.countDocuments();
  const pendingDoctors = await Doctor.countDocuments({ approvalStatus: "pending" });
  const approvedDoctors = await Doctor.countDocuments({ approvalStatus: "approved" });
  const totalAvailabilitySlots = await Availability.countDocuments();

  return {
    totalDoctors,
    pendingDoctors,
    approvedDoctors,
    totalAvailabilitySlots,
  };
};