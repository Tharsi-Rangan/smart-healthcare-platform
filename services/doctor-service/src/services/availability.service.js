import { Doctor } from "../models/doctor.model.js";
import { Availability } from "../models/availability.model.js";
import { AppError } from "../utils/appError.js";

export const getDoctorAvailability = async (authUserId) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const availability = await Availability.find({ doctorId: doctor._id }).sort({
    createdAt: -1,
  });

  return availability;
};

export const saveDoctorAvailability = async (authUserId, slots) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  await Availability.deleteMany({ doctorId: doctor._id });

  const newSlots = slots.map((slot) => ({
    doctorId: doctor._id,
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    slotDuration: slot.slotDuration || 30,
    isActive: slot.isActive ?? true,
  }));

  const createdSlots = await Availability.insertMany(newSlots);

  return createdSlots;
};