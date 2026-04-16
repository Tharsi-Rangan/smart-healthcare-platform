import apiClient from "./apiClient";

const mapDoctorToPublicModel = (doctor) => ({
  id: doctor?._id,
  name: doctor?.doctorName || "Doctor",
  specialization: doctor?.specialization || "General",
  hospital: doctor?.hospital || "Not specified",
  consultationFee: doctor?.consultationFee ?? "N/A",
  availabilityText: doctor?.availabilityText || "Please contact hospital",
  experience:
    typeof doctor?.experience === "number"
      ? `${doctor.experience} years of experience.`
      : "Experience details not provided.",
  about:
    doctor?.about ||
    `${doctor?.doctorName || "This doctor"} is a ${doctor?.specialization || "medical"} specialist.`,
  profilePhotoUrl: doctor?.profilePhotoUrl || "",
  authUserId: doctor?.authUserId || "",
  approvalStatus: doctor?.approvalStatus,
  isActive: doctor?.isActive,
});

export const getPublicDoctors = async (params = {}) => {
  const response = await apiClient.get("/api/public/doctors", { params });
  const doctors = response?.data?.data?.doctors || [];
  return doctors.map(mapDoctorToPublicModel);
};

export const getPublicDoctorById = async (doctorId) => {
  const response = await apiClient.get(`/api/public/doctors/${doctorId}`);
  const doctor = response?.data?.data?.doctor;

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return mapDoctorToPublicModel(doctor);
};
