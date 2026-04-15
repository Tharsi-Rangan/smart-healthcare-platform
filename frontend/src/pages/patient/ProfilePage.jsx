import { CheckCircle, AlertCircle, Pencil, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePatientProfile from "../../hooks/usePatientProfile";
import {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
} from "../../features/patient/patientConstants";
import PatientAvatarCard from "../../components/patient/PatientAvatarCard";
import ProfileSectionCard from "../../components/patient/ProfileSectionCard";
import AnimatedContainer from "../../components/common/AnimatedContainer";
import { alertVariants } from "../../features/patient/patientAnimations";

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-600 transition-all";

function FormField({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">
        {label}
      </label>
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
      <div className="flex h-[60vh] items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-sky-500"></div>
          <div className="text-base font-medium text-slate-500">Retrieving your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <AnimatedContainer className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-lg font-medium text-slate-500">
            Manage your personal identity, contact info, and medical basics.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-700 hover:shadow-xl active:scale-95"
          >
            <Pencil className="h-5 w-5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Alerts with AnimatePresence */}
      <AnimatePresence mode="wait">
        {successMessage && (
          <motion.div 
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar + Personal Info */}
        <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <PatientAvatarCard
              name={formData.fullName}
              phone={formData.phone}
              profileImage={formData.profileImage}
              uploadingAvatar={uploadingAvatar}
              onAvatarUpload={handleAvatarUpload}
            />
            {isEditing && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wider mb-2">Notice</p>
                <p className="text-sm font-medium text-amber-700 leading-relaxed">You are currently in editing mode. Changes will not be saved until you click "Save Changes".</p>
              </div>
            )}
          </div>

          <ProfileSectionCard title="Personal Information">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Full Name">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} className={inputClass} />
              </FormField>
              <FormField label="Phone Number">
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={inputClass} />
              </FormField>
              <FormField label="Date of Birth">
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} max={maxDate} disabled={!isEditing} className={inputClass} />
              </FormField>
              <FormField label="Gender Identity">
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
            <div className="mt-6">
              <FormField label="Physical Address">
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" disabled={!isEditing} className={inputClass} />
              </FormField>
            </div>
          </ProfileSectionCard>
        </div>

        {/* Emergency Contact */}
        <ProfileSectionCard title="Emergency Contact Details">
          <div className="grid gap-6 md:grid-cols-3">
            <FormField label="Contact Person">
              <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} disabled={!isEditing} className={inputClass} />
            </FormField>
            <FormField label="Relationship">
              <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} disabled={!isEditing} placeholder="e.g. Spouse / Parent" className={inputClass} />
            </FormField>
            <FormField label="Contact Phone">
              <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} disabled={!isEditing} className={inputClass} />
            </FormField>
          </div>
        </ProfileSectionCard>

        {/* Medical Information */}
        <ProfileSectionCard title="Permanent Medical Baseline">
          <div className="space-y-6">
            <FormField label="Allergies (Brief Summary)">
              <textarea name="allergiesSummary" value={formData.allergiesSummary} onChange={handleChange} rows="3" disabled={!isEditing} className={inputClass} />
            </FormField>
            <FormField label="Chronic Conditions (Brief Summary)">
              <textarea name="chronicConditionsSummary" value={formData.chronicConditionsSummary} onChange={handleChange} rows="3" disabled={!isEditing} className={inputClass} />
            </FormField>
          </div>
        </ProfileSectionCard>

        {/* Action Buttons */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button 
                type="submit" 
                disabled={submitting} 
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
              >
                <Save className="h-5 w-5" />
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={submitting} 
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-10 py-4 text-lg font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </AnimatedContainer>
  );
}

export default ProfilePage;