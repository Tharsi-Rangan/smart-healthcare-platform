import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { Doctor } from "../models/doctor.model.js";
import { Availability } from "../models/availability.model.js";

export const getPublicDoctorsController = asyncHandler(async (req, res) => {
  const { search = "", specialization = "" } = req.query;

  const query = {
    approvalStatus: "approved",
    isActive: true,
  };

  if (search.trim()) {
    query.$or = [
      { doctorName: { $regex: search.trim(), $options: "i" } },
      { specialization: { $regex: search.trim(), $options: "i" } },
      { hospital: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (specialization.trim()) {
    query.specialization = { $regex: specialization.trim(), $options: "i" };
  }

  const doctors = await Doctor.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Approved doctors fetched successfully",
    data: {
      doctors,
    },
  });
});

export const getPendingDoctorsController = asyncHandler(async (_req, res) => {
  const doctors = await Doctor.find({ approvalStatus: "pending" }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    message: "Pending doctors fetched successfully",
    data: {
      doctors,
    },
  });
});

export const getAllDoctorsController = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;

  const query = {};

  if (search.trim()) {
    query.$or = [
      { doctorName: { $regex: search.trim(), $options: "i" } },
      { specialization: { $regex: search.trim(), $options: "i" } },
      { hospital: { $regex: search.trim(), $options: "i" } },
      { licenseNumber: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const doctors = await Doctor.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Doctors fetched successfully",
    data: {
      doctors,
    },
  });
});

export const getDoctorByIdController = asyncHandler(async (req, res) => {
  // Fetch doctor by their actual MongoDB _id
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  // Fetch availability slots using the doctor's actual ID (only active slots)
  const availability = await Availability.find({ 
    doctorId: doctor._id,
    isActive: true,  // Only return active slots
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    message: "Doctor fetched successfully",
    data: {
      doctor,
      availability: availability || [],
    },
  });
});

export const approveDoctorController = asyncHandler(async (req, res) => {
  const { adminReviewMessage = "" } = req.body;

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  doctor.approvalStatus = "approved";
  doctor.adminReviewMessage = adminReviewMessage.trim();
  doctor.reviewedAt = new Date();
  doctor.isActive = true;

  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Doctor approved successfully",
    data: {
      doctor,
    },
  });
});

export const rejectDoctorController = asyncHandler(async (req, res) => {
  const { adminReviewMessage } = req.body;

  if (!adminReviewMessage || !adminReviewMessage.trim()) {
    throw new AppError(
      "Admin review message is required when rejecting a doctor",
      400
    );
  }

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  doctor.approvalStatus = "rejected";
  doctor.adminReviewMessage = adminReviewMessage.trim();
  doctor.reviewedAt = new Date();

  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Doctor rejected successfully",
    data: {
      doctor,
    },
  });
});

export const toggleDoctorActiveStatusController = asyncHandler(async (req, res) => {
  const { adminReviewMessage = "" } = req.body;

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const updateData = { isActive: !doctor.isActive };

  if (adminReviewMessage.trim()) {
    updateData.adminReviewMessage = adminReviewMessage.trim();
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: false }
  );

  res.status(200).json({
    success: true,
    message: updatedDoctor.isActive
      ? "Doctor account activated successfully"
      : "Doctor account deactivated successfully",
    data: {
      doctor: updatedDoctor,
    },
  });
});