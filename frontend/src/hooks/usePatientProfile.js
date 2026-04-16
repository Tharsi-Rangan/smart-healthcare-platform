import { useEffect, useMemo, useState } from "react";
import {
  fetchPatientProfile,
  updatePatientProfile,
  uploadPatientAvatar,
} from "../services/patientService";
import confetti from "canvas-confetti";
import { toDateInputValue } from "../features/patient/patientUtils";

const emptyForm = {
  fullName: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  allergiesSummary: "",
  chronicConditionsSummary: "",
  profileImage: "",
};

const mapProfileToForm = (profile) => ({
  fullName: profile.fullName || "",
  phone: profile.phone || "",
  dateOfBirth: toDateInputValue(profile.dateOfBirth),
  gender: profile.gender || "",
  address: profile.address || "",
  bloodGroup: profile.bloodGroup || "",
  emergencyContactName: profile.emergencyContactName || "",
  emergencyContactRelationship: profile.emergencyContactRelationship || "",
  emergencyContactPhone: profile.emergencyContactPhone || "",
  allergiesSummary: profile.allergiesSummary || "",
  chronicConditionsSummary: profile.chronicConditionsSummary || "",
  profileImage: profile.profileImage || "",
});

function usePatientProfile() {
  const [formData, setFormData] = useState(emptyForm);
  const [originalData, setOriginalData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchPatientProfile();
        const mapped = mapProfileToForm(response.data.profile);
        setFormData(mapped);
        setOriginalData(mapped);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setSuccessMessage("");
    setErrorMessage("");
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        emergencyContactPhone: formData.emergencyContactPhone,
        allergiesSummary: formData.allergiesSummary,
        chronicConditionsSummary: formData.chronicConditionsSummary,
      };

      const response = await updatePatientProfile(payload);
      const mapped = mapProfileToForm(response.data.profile);
      setFormData(mapped);
      setOriginalData(mapped);
      setSuccessMessage(response.message || "Profile updated successfully");
      setIsEditing(false);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0ea5e9", "#10b981", "#6366f1"]
      });
      window.dispatchEvent(new Event("patient-profile-updated"));
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const avatarFormData = new FormData();
      avatarFormData.append("avatar", file);
      const response = await uploadPatientAvatar(avatarFormData);
      const newImage = response.data.profile.profileImage || "";

      setFormData((prev) => ({ ...prev, profileImage: newImage }));
      setOriginalData((prev) => ({ ...prev, profileImage: newImage }));
      setSuccessMessage(response.message || "Profile photo uploaded successfully");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0ea5e9", "#10b981"]
      });
      window.dispatchEvent(new Event("patient-profile-updated"));
    } catch (error) {
      setErrorMessage(error.message || "Failed to upload profile photo");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return {
    formData,
    loading,
    isEditing,
    submitting,
    uploadingAvatar,
    successMessage,
    errorMessage,
    maxDate,
    handleChange,
    handleEditClick,
    handleCancel,
    handleSubmit,
    handleAvatarUpload,
  };
}

export default usePatientProfile;
