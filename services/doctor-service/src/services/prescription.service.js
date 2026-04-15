import { Doctor } from "../models/doctor.model.js";
import { Prescription } from "../models/prescription.model.js";
import { AppError } from "../utils/appError.js";

const getDoctorByAuthUserId = async (authUserId) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  return doctor;
};

export const getPrescriptions = async (authUserId) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  return await Prescription.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
};

export const createPrescription = async (authUserId, payload) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  return await Prescription.create({
    doctorId: doctor._id,
    ...payload,
    issuedAt: new Date().toLocaleString(),
  });
};