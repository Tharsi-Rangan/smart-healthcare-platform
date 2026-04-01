import { Doctor } from "../models/doctor.model.js";
import { AppError } from "../utils/appError.js";

export const getPendingDoctors = async () => {
  return await Doctor.find({ approvalStatus: "pending" }).sort({ createdAt: -1 });
};

export const getAllDoctors = async () => {
  return await Doctor.find().sort({ createdAt: -1 });
};

export const approveDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  doctor.approvalStatus = "approved";
  await doctor.save();

  return doctor;
};

export const rejectDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  doctor.approvalStatus = "rejected";
  await doctor.save();

  return doctor;
};