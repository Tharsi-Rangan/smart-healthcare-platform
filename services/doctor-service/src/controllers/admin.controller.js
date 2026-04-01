import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getPendingDoctors,
  getAllDoctors,
  approveDoctorById,
  rejectDoctorById,
} from "../services/admin.service.js";

export const getPendingDoctorsController = asyncHandler(async (req, res) => {
  const doctors = await getPendingDoctors();

  res.status(200).json({
    success: true,
    message: "Pending doctors fetched successfully",
    data: {
      doctors,
    },
  });
});

export const getAllDoctorsController = asyncHandler(async (req, res) => {
  const doctors = await getAllDoctors();

  res.status(200).json({
    success: true,
    message: "Doctors fetched successfully",
    data: {
      doctors,
    },
  });
});

export const approveDoctorController = asyncHandler(async (req, res) => {
  const doctor = await approveDoctorById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Doctor approved successfully",
    data: {
      doctor,
    },
  });
});

export const rejectDoctorController = asyncHandler(async (req, res) => {
  const doctor = await rejectDoctorById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Doctor rejected successfully",
    data: {
      doctor,
    },
  });
});