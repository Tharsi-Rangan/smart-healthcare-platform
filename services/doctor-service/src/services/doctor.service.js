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

  const profilePhotoUrl = file
    ? `/uploads/doctors/${file.filename}`
    : doctor?.profilePhotoUrl || "";

  if (!doctor) {
    doctor = await Doctor.create({
      authUserId,
      doctorName: doctorName?.trim(),
      specialization: specialization?.trim(),
      licenseNumber: licenseNumber?.trim(),
      hospital: hospital?.trim() || "",
      experience: Number(experience) || 0,
      profilePhotoUrl,
    });

    return {
      doctor,
      isCreated: true,
    };
  }

  doctor.doctorName = doctorName?.trim() ?? doctor.doctorName;
  doctor.specialization = specialization?.trim() ?? doctor.specialization;
  doctor.licenseNumber = licenseNumber?.trim() ?? doctor.licenseNumber;
  doctor.hospital = hospital?.trim() ?? doctor.hospital;
  doctor.experience =
    experience !== undefined && experience !== null && experience !== ""
      ? Number(experience)
      : doctor.experience;

  doctor.profilePhotoUrl = profilePhotoUrl;

  await doctor.save();

  return {
    doctor,
    isCreated: false,
  };
};