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

  const rejectedDoctors = await Doctor.countDocuments({
    approvalStatus: "rejected",
  });

  const activeDoctors = await Doctor.countDocuments({
    isActive: true,
  });

  const inactiveDoctors = await Doctor.countDocuments({
    isActive: false,
  });

  const totalAvailabilitySlots = await Availability.countDocuments();

  const activeAvailabilitySlots = await Availability.countDocuments({
    isActive: true,
  });

  return {
    totalDoctors,
    approvedDoctors,
    pendingDoctors,
    rejectedDoctors,
    activeDoctors,
    inactiveDoctors,
    totalAvailabilitySlots,
    activeAvailabilitySlots,
  };
};