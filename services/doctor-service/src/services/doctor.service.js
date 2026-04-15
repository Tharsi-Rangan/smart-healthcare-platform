import { Doctor } from "../models/doctor.model.js";
import { AppError } from "../utils/appError.js";

export const getDoctorProfile = async (authUserId) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  return doctor;
};

export const createOrUpdateDoctorProfile = async (authUserId, payload, file) => {
  const {
    doctorName,
    specialization,
    licenseNumber,
    hospital,
    experience,
  } = payload;

  let doctor = await Doctor.findOne({ authUserId });

  const profilePhotoUrl = file ? `/uploads/doctors/${file.filename}` : undefined;

  if (!doctor) {
    doctor = await Doctor.create({
      authUserId,
      doctorName,
      specialization,
      licenseNumber,
      hospital,
      experience,
      profilePhotoUrl: profilePhotoUrl || "",
    });

    return {
      doctor,
      isCreated: true,
    };
  }

  doctor.doctorName = doctorName ?? doctor.doctorName;
  doctor.specialization = specialization ?? doctor.specialization;
  doctor.licenseNumber = licenseNumber ?? doctor.licenseNumber;
  doctor.hospital = hospital ?? doctor.hospital;
  doctor.experience = experience ?? doctor.experience;

  if (profilePhotoUrl) {
    doctor.profilePhotoUrl = profilePhotoUrl;
  }

  await doctor.save();

  return {
    doctor,
    isCreated: false,
  };
};