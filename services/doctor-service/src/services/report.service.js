import { Doctor } from "../models/doctor.model.js";
import { PatientReport } from "../models/patientReport.model.js";
import { AppError } from "../utils/appError.js";

const getDoctorByAuthUserId = async (authUserId) => {
  const doctor = await Doctor.findOne({ authUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  return doctor;
};

export const getPatientReports = async (authUserId) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  return await PatientReport.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
};

export const createPatientReport = async (authUserId, payload) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  return await PatientReport.create({
    doctorId: doctor._id,
    ...payload,
  });
};

export const getPatientReportById = async (authUserId, reportId) => {
  const doctor = await getDoctorByAuthUserId(authUserId);

  const report = await PatientReport.findOne({
    _id: reportId,
    doctorId: doctor._id,
  });

  if (!report) {
    throw new AppError("Patient report not found", 404);
  }

  return report;
};