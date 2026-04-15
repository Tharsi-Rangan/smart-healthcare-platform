import { CheckCircle, AlertCircle, Pencil, Save, X } from "lucide-react";
import usePatientProfile from "../../hooks/usePatientProfile";
import {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
} from "../../features/patient/patientConstants";
import PatientAvatarCard from "../../components/patient/PatientAvatarCard";
import ProfileSectionCard from "../../components/patient/ProfileSectionCard";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-50 disabled:text-slate-600";

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function ProfilePage() {
  const {
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
  } = usePatientProfile();

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
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} className={inputClass} />
              </FormField>
              <FormField label="Phone">
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={inputClass} />
              </FormField>
              <FormField label="Date of Birth">
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} max={maxDate} disabled={!isEditing} className={inputClass} />
              </FormField>
              <FormField label="Gender">
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className={inputClass}>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Blood Group">
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} disabled={!isEditing} className={inputClass}>
                  {BLOOD_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Address">
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" disabled={!isEditing} className={inputClass} />
              </FormField>
            </div>
          </ProfileSectionCard>
        </div>

        {/* Emergency Contact */}
        <ProfileSectionCard title="Emergency Contact">
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Contact Name">
              <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} disabled={!isEditing} className={inputClass} />
            </FormField>
            <FormField label="Relationship">
              <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} disabled={!isEditing} placeholder="Mother / Father / Brother" className={inputClass} />
            </FormField>
            <FormField label="Contact Phone">
              <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} disabled={!isEditing} className={inputClass} />
            </FormField>
          </div>
        </ProfileSectionCard>

        {/* Medical Information */}
        <ProfileSectionCard title="Medical Information">
          <div className="space-y-4">
            <FormField label="Allergies Summary">
              <textarea name="allergiesSummary" value={formData.allergiesSummary} onChange={handleChange} rows="3" disabled={!isEditing} className={inputClass} />
            </FormField>
            <FormField label="Chronic Conditions Summary">
              <textarea name="chronicConditionsSummary" value={formData.chronicConditionsSummary} onChange={handleChange} rows="3" disabled={!isEditing} className={inputClass} />
            </FormField>
          </div>
        </ProfileSectionCard>

        {/* Actions */}
        {isEditing && (
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70">
              <Save className="h-4 w-4" />
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={handleCancel} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70">
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