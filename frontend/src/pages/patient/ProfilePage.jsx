import { useEffect, useMemo, useState } from "react";
import { CheckCircle, AlertCircle, Pencil, Save, X } from "lucide-react";
import {
  fetchPatientProfile,
  updatePatientProfile,
  uploadPatientAvatar,
} from "../../services/patientService";
import {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
} from "../../features/patient/patientConstants";
import { toDateInputValue } from "../../features/patient/patientUtils";
import PatientAvatarCard from "../../components/patient/PatientAvatarCard";
import ProfileSectionCard from "../../components/patient/ProfileSectionCard";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600";

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfilePage() {
  const [formData, setFormData] = useState(emptyForm);
  const [originalData, setOriginalData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

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
      window.dispatchEvent(new Event("patient-profile-updated"));
    } catch (error) {
      setErrorMessage(error.message || "Failed to upload profile photo");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar + Personal Info */}
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <PatientAvatarCard
            name={formData.fullName}
            phone={formData.phone}
            profileImage={formData.profileImage}
            uploadingAvatar={uploadingAvatar}
            onAvatarUpload={handleAvatarUpload}
          />

          <ProfileSectionCard title="Personal Information">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Full Name">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Phone">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Date of Birth">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={maxDate}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Gender">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Blood Group">
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                >
                  {BLOOD_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Address">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  disabled={!isEditing}
                  className={inputClass}
                />
              </FormField>
            </div>
          </ProfileSectionCard>
        </div>

        {/* Emergency Contact */}
        <ProfileSectionCard title="Emergency Contact">
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Contact Name">
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass}
              />
            </FormField>

            <FormField label="Relationship">
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Mother / Father / Brother"
                className={inputClass}
              />
            </FormField>

            <FormField label="Contact Phone">
              <input
                type="text"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass}
              />
            </FormField>
          </div>
        </ProfileSectionCard>

        {/* Medical Information */}
        <ProfileSectionCard title="Medical Information">
          <div className="space-y-4">
            <FormField label="Allergies Summary">
              <textarea
                name="allergiesSummary"
                value={formData.allergiesSummary}
                onChange={handleChange}
                rows="3"
                disabled={!isEditing}
                className={inputClass}
              />
            </FormField>

            <FormField label="Chronic Conditions Summary">
              <textarea
                name="chronicConditionsSummary"
                value={formData.chronicConditionsSummary}
                onChange={handleChange}
                rows="3"
                disabled={!isEditing}
                className={inputClass}
              />
            </FormField>
          </div>
        </ProfileSectionCard>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ProfilePage;