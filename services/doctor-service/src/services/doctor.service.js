import { Doctor } from "../models/doctor.model.js";
import { AppError } from "../utils/appError.js";

export const getDoctorProfile = async (authUserId) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  return doctor;
};

export const createOrUpdateDoctorProfile = async (authUserId, payload) => {
  const { specialization, licenseNumber, hospital, experience } = payload;

  let doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    doctor = await Doctor.create({
      authUserId,
      specialization,
      licenseNumber,
      hospital,
      experience,
    });

    return {
      doctor,
      isCreated: true,
    };
  }

  doctor.specialization = specialization ?? doctor.specialization;
  doctor.licenseNumber = licenseNumber ?? doctor.licenseNumber;
  doctor.hospital = hospital ?? doctor.hospital;
  doctor.experience = experience ?? doctor.experience;

  await doctor.save();

  return {
    doctor,
    isCreated: false,
  };
};