import { CheckCircle, AlertCircle, Pencil, Save, X, FileText } from "lucide-react";
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
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-cyan-50 disabled:text-cyan-600 transition-all";

function FormField({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-0.5">
        {label}
      </label>
      {children}
    </div>
  );
}

import { ProfilePreviewSkeleton, CardSectionSkeleton } from "../../components/common/Skeleton";

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

  const handleDownloadPassport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
             <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
             <div className="h-5 w-72 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <ProfilePreviewSkeleton />
          <div className="space-y-4">
            <CardSectionSkeleton />
            <CardSectionSkeleton />
            <CardSectionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatedContainer className="space-y-3 pb-5">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-sm font-medium text-slate-500">
            Manage your personal identity, contact info, and medical basics.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button 
            type="button"
            onClick={handleDownloadPassport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2 py-1 text-xs font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            Medical Passport
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-700 hover:shadow-xl active:scale-95"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Alerts with AnimatePresence */}
      <AnimatePresence mode="wait">
        {successMessage && (
          <motion.div 
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-800 shadow-sm"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-semibold text-sm">{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-red-800 shadow-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-semibold text-sm">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar + Personal Info */}
        <div className="grid gap-3 xl:grid-cols-[280px_1fr]">
          <div className="space-y-1">
            <PatientAvatarCard
              name={formData.fullName}
              phone={formData.phone}
              profileImage={formData.profileImage}
              uploadingAvatar={uploadingAvatar}
              onAvatarUpload={handleAvatarUpload}
            />
            {isEditing && (
              <div className="rounded-md border border-amber-100 bg-amber-50 p-1.5">
                <p className="text-xs font-bold text-amber-800 leading-tight uppercase tracking-wider mb-0.5">Notice</p>
                <p className="text-xs font-medium text-amber-700 leading-tight">You are currently in editing mode. Changes will not be saved until you click "Save Changes".</p>
              </div>
            )}
          </div>

          <ProfileSectionCard title="Personal Information">
            <div className="grid gap-2 md:grid-cols-2">
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
          <div className="grid gap-2 md:grid-cols-3">
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
          <div className="space-y-2">
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
              className="flex flex-wrap gap-2 pt-2"
            >
              <button 
                type="submit" 
                disabled={submitting} 
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
              >
                <Save className="h-4 w-4" />
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={submitting} 
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-3 py-1 text-sm font-bold text-cyan-700 transition-all hover:bg-cyan-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-4 w-4" />
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