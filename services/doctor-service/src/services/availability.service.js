import { Doctor } from "../models/doctor.model.js";
import { Availability } from "../models/availability.model.js";
import { AppError } from "../utils/appError.js";

export const getDoctorAvailability = async (authUserId) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError(
      "Doctor profile not found. Please complete your profile first before managing availability.",
      404
    );
  }

  // Query using doctorAuthUserId to ensure proper data isolation and use actual doctor ID
  const availability = await Availability.find({ doctorAuthUserId: authUserId }).sort({
    createdAt: -1,
  });

  return availability;
};

export const saveDoctorAvailability = async (authUserId, slots) => {
  // First, find the EXISTING doctor profile using the authenticated user's ID
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError(
      "Doctor profile not found. Please complete your profile first before managing availability.",
      404
    );
  }

  // Validate doctor ID exists
  if (!doctor._id) {
    throw new AppError("Invalid doctor profile data. Please complete your profile setup.", 500);
  }

  // Delete old availability records for THIS doctor using authUserId for isolation
  await Availability.deleteMany({ doctorAuthUserId: authUserId });

  // Create new slots with the ACTUAL doctor ID from the database
  const newSlots = slots.map((slot) => ({
    doctorId: doctor._id,              // Use the existing MongoDB _id from doctor profile
    doctorAuthUserId: authUserId,      // Link to auth user for data isolation
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    slotDuration: slot.slotDuration || 30,
    isActive: slot.isActive ?? true,
  }));

  const createdSlots = await Availability.insertMany(newSlots);

  return createdSlots;
};