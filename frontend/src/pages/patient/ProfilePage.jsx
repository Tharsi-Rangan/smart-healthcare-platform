import { useEffect, useMemo, useState } from "react";
import {
  fetchPatientProfile,
  updatePatientProfile,
  uploadPatientAvatar,
} from "../../services/patientService";

const FILE_BASE_URL = "http://localhost:5002";

function ProfilePage() {
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

  const [formData, setFormData] = useState(emptyForm);
  const [originalData, setOriginalData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const maxDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchPatientProfile();
        const profile = response.data.profile;

        const mappedData = {
          fullName: profile.fullName || "",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: profile.gender || "",
          address: profile.address || "",
          bloodGroup: profile.bloodGroup || "",
          emergencyContactName: profile.emergencyContactName || "",
          emergencyContactRelationship:
            profile.emergencyContactRelationship || "",
          emergencyContactPhone: profile.emergencyContactPhone || "",
          allergiesSummary: profile.allergiesSummary || "",
          chronicConditionsSummary: profile.chronicConditionsSummary || "",
          profileImage: profile.profileImage || "",
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
        setImageError(false);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
    setImageError(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        profileImage: formData.profileImage,
      };

      const response = await updatePatientProfile(payload);
      const updatedProfile = response.data.profile;

      const mappedData = {
        fullName: updatedProfile.fullName || "",
        phone: updatedProfile.phone || "",
        dateOfBirth: updatedProfile.dateOfBirth
          ? new Date(updatedProfile.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: updatedProfile.gender || "",
        address: updatedProfile.address || "",
        bloodGroup: updatedProfile.bloodGroup || "",
        emergencyContactName: updatedProfile.emergencyContactName || "",
        emergencyContactRelationship:
          updatedProfile.emergencyContactRelationship || "",
        emergencyContactPhone: updatedProfile.emergencyContactPhone || "",
        allergiesSummary: updatedProfile.allergiesSummary || "",
        chronicConditionsSummary: updatedProfile.chronicConditionsSummary || "",
        profileImage: updatedProfile.profileImage || "",
      };

      setFormData(mappedData);
      setOriginalData(mappedData);
      setSuccessMessage(response.message || "Profile updated successfully");
      setIsEditing(false);
      setImageError(false);
      window.dispatchEvent(new Event("patient-profile-updated"));
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const avatarFormData = new FormData();
      avatarFormData.append("avatar", file);

      const response = await uploadPatientAvatar(avatarFormData);
      const updatedProfile = response.data.profile;

      setFormData((prev) => ({
        ...prev,
        profileImage: updatedProfile.profileImage || "",
      }));

      setOriginalData((prev) => ({
        ...prev,
        profileImage: updatedProfile.profileImage || "",
      }));

      setImageError(false);
      window.dispatchEvent(new Event("patient-profile-updated"));
      setSuccessMessage(response.message || "Profile photo uploaded successfully");
    } catch (error) {
      setErrorMessage(error.message || "Failed to upload profile photo");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const getInitials = (name) => {
    if (!name) return "P";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${FILE_BASE_URL}${imagePath}`;
  };

  const resolvedImage = getImageUrl(formData.profileImage);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your personal and emergency contact details.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleEditClick}
            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Edit Profile
          </button>
        )}
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {resolvedImage && !imageError ? (
                  <img
                    src={resolvedImage}
                    alt={formData.fullName}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-2xl font-bold text-cyan-700">
                    {getInitials(formData.fullName)}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-slate-800">
                {formData.fullName || "Patient"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {formData.phone || "No phone number added"}
              </p>

              <div className="mt-4 w-full">
                <label className="inline-flex cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  {uploadingAvatar ? "Uploading..." : "Change Photo"}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Personal Information
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={maxDate}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                disabled={!isEditing}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Emergency Contact
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contact Name
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Mother / Father / Brother"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contact Phone
              </label>
              <input
                type="text"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Medical Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Allergies Summary
              </label>
              <textarea
                name="allergiesSummary"
                value={formData.allergiesSummary}
                onChange={handleChange}
                rows="3"
                disabled={!isEditing}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Chronic Conditions Summary
              </label>
              <textarea
                name="chronicConditionsSummary"
                value={formData.chronicConditionsSummary}
                onChange={handleChange}
                rows="3"
                disabled={!isEditing}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ProfilePage;