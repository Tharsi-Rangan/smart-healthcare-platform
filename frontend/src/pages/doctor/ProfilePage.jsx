import { useEffect, useMemo, useState } from "react";
import { getDoctorProfile, updateDoctorProfile, updateConsultationFee } from "../../api/doctorApi";
import { motion } from "framer-motion";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ProfilePage() {
  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
    experience: "",
    consultationFee: 500,
  });

  const [approvalStatus, setApprovalStatus] = useState("pending");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getDoctorProfile();
        const doctor = response.data?.doctor;

        if (doctor) {
          setFormData({
            doctorName: doctor.doctorName || "",
            specialization: doctor.specialization || "",
            licenseNumber: doctor.licenseNumber || "",
            hospital: doctor.hospital || "",
            experience:
              doctor.experience === 0 || doctor.experience
                ? String(doctor.experience)
                : "",
            consultationFee: doctor.consultationFee || 500,
          });

          setApprovalStatus(doctor.approvalStatus || "pending");
          setExistingPhotoUrl(doctor.profilePhotoUrl || "");
          setPhotoPreview(doctor.profilePhotoUrl || "");
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profileCompletion = useMemo(() => {
    let total = 7;
    let completed = 0;

    if (formData.doctorName.trim()) completed += 1;
    if (formData.specialization.trim()) completed += 1;
    if (formData.licenseNumber.trim()) completed += 1;
    if (formData.hospital.trim()) completed += 1;
    if (formData.experience !== "" && Number(formData.experience) >= 0) completed += 1;
    if (formData.consultationFee && Number(formData.consultationFee) > 0) completed += 1;
    if (photoPreview) completed += 1;

    return Math.round((completed / total) * 100);
  }, [formData, photoPreview]);

  const getStatusClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  const validateSingleField = (name, value) => {
    switch (name) {
      case "doctorName":
        if (!value.trim()) return "Doctor name is required.";
        if (value.trim().length < 3) return "Doctor name must be at least 3 characters.";
        return "";

      case "specialization":
        if (!value.trim()) return "Specialization is required.";
        if (value.trim().length < 3) return "Specialization must be at least 3 characters.";
        return "";

      case "licenseNumber":
        if (!value.trim()) return "License number is required.";
        if (!/^[A-Za-z0-9\-\/]+$/.test(value.trim())) {
          return "License number can only contain letters, numbers, hyphens, and slashes.";
        }
        if (value.trim().length < 4) return "License number must be at least 4 characters.";
        return "";

      case "hospital":
        if (!value.trim()) return "Hospital or clinic is required.";
        if (value.trim().length < 3) return "Hospital or clinic name must be at least 3 characters.";
        return "";

      case "experience":
        if (value === "") return "Experience is required.";
        if (Number.isNaN(Number(value))) return "Experience must be a number.";
        if (Number(value) < 0) return "Experience cannot be negative.";
        if (Number(value) > 60) return "Experience looks too high.";
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const errors = {
      doctorName: validateSingleField("doctorName", formData.doctorName),
      specialization: validateSingleField("specialization", formData.specialization),
      licenseNumber: validateSingleField("licenseNumber", formData.licenseNumber),
      hospital: validateSingleField("hospital", formData.hospital),
      experience: validateSingleField("experience", formData.experience),
    };

    if (!photoPreview) {
      errors.profilePhoto = "Profile photo is recommended for a complete doctor profile.";
    }

    const cleanedErrors = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value)
    );

    setFieldErrors(cleanedErrors);

    const blockingErrors = { ...cleanedErrors };
    delete blockingErrors.profilePhoto;

    return Object.keys(blockingErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateSingleField(name, value),
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage("");
    setError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        profilePhoto: "Only JPG, PNG, or WEBP images are allowed.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFieldErrors((prev) => ({
        ...prev,
        profilePhoto: "Image size must be 2MB or less.",
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePhoto(file);
    setPhotoPreview(previewUrl);

    setFieldErrors((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview("");
    setExistingPhotoUrl("");
    setFieldErrors((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const isValid = validateForm();

    if (!isValid) {
      setSaving(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("doctorName", formData.doctorName.trim());
      payload.append("specialization", formData.specialization.trim());
      payload.append("licenseNumber", formData.licenseNumber.trim());
      payload.append("hospital", formData.hospital.trim());
      payload.append("experience", String(Number(formData.experience)));

      if (profilePhoto) {
        payload.append("profilePhoto", profilePhoto);
      }

      const response = await updateDoctorProfile(payload);
      const doctor = response.data?.doctor;

      setApprovalStatus(doctor?.approvalStatus || "pending");
      setExistingPhotoUrl(doctor?.profilePhotoUrl || photoPreview || "");
      setPhotoPreview(doctor?.profilePhotoUrl || photoPreview || "");
      
      // Update consultation fee if it changed
      if (formData.consultationFee) {
        try {
          await updateConsultationFee(Number(formData.consultationFee));
          console.log("Consultation fee updated successfully");
        } catch (feeErr) {
          console.error("Error updating consultation fee:", feeErr);
          // Continue with success message even if fee update fails
        }
      }
      
      setMessage(response.message || "Profile and consultation fee saved successfully");
    } catch (err) {
      console.error("Profile save error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      doctorName: "",
      specialization: "",
      licenseNumber: "",
      hospital: "",
      experience: "",
      consultationFee: 500,
    });
    setProfilePhoto(null);
    setPhotoPreview(existingPhotoUrl || "");
    setFieldErrors({});
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Header Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-700 to-sky-700 p-6 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-100">
              Doctor Profile Management
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">My Profile</h1>
            <p className="mt-1 max-w-2xl text-sm text-cyan-50">
              Manage your professional details, identity, and verification information.
            </p>
          </div>

          <div className="rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm border border-white/20">
            <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-100">
              Profile Completion
            </p>
            <p className="mt-0.5 text-2xl font-bold">{profileCompletion}%</p>
            <div className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-white/30">
              <div 
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      {message && (
        <motion.div variants={itemVariants} className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-emerald-700">{message}</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div variants={itemVariants} className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Approval Status
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusClasses(approvalStatus)}`}>
              {approvalStatus}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Doctor Name
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900 truncate">
            {formData.doctorName || "Not added"}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Specialization
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
              <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900 truncate">
            {formData.specialization || "Not added"}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Experience
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900">
            {formData.experience || 0} years
          </p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={itemVariants} className="grid gap-5 lg:grid-cols-[320px,1fr]">
        {/* Profile Summary Card */}
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={
                    photoPreview.startsWith("/")
                      ? `http://localhost:5006${photoPreview}`
                      : photoPreview
                  }
                  alt="Doctor profile"
                  className="h-24 w-24 rounded-full border-3 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-2xl font-bold text-white shadow-lg">
                  {formData.doctorName?.[0]?.toUpperCase() || "DR"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white"></div>
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              {formData.doctorName || "Doctor Name"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {formData.specialization || "Specialization not set"}
            </p>
            <span className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusClasses(approvalStatus)}`}>
              {approvalStatus}
            </span>
          </div>

          <div className="my-5 border-t border-slate-100" />

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <p className="text-xs font-medium text-slate-500">License Number</p>
              <p className="text-sm font-medium text-slate-800">{formData.licenseNumber || "-"}</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <p className="text-xs font-medium text-slate-500">Hospital</p>
              <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{formData.hospital || "-"}</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <p className="text-xs font-medium text-slate-500">Experience</p>
              <p className="text-sm font-medium text-slate-800">{formData.experience || 0} years</p>
            </div>
            <div className="flex justify-between items-center py-2">
              <p className="text-xs font-medium text-slate-500">Consultation Fee</p>
              <p className="text-sm font-bold text-cyan-700">LKR {formData.consultationFee || 500}</p>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Professional Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your information accurate so admins can review and verify your doctor account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Photo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Profile Photo
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-cyan-700 hover:file:bg-cyan-100"
                />
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="rounded-lg bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Allowed: JPG, PNG, WEBP. Max size: 2MB.
              </p>
              {fieldErrors.profilePhoto && (
                <p className="mt-1.5 text-xs text-amber-600">{fieldErrors.profilePhoto}</p>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Dr. John Doe"
                />
                {fieldErrors.doctorName && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.doctorName}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Cardiology"
                />
                {fieldErrors.specialization && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.specialization}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="LIC-2026-001"
                />
                {fieldErrors.licenseNumber && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.licenseNumber}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Hospital / Clinic *
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="City Medical Center"
                />
                {fieldErrors.hospital && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.hospital}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="5"
                />
                {fieldErrors.experience && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.experience}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Consultation Fee (LKR)
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  step="50"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Fee charged to patients when they book appointments.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-700 hover:to-sky-800 disabled:opacity-50 shadow-sm"
              >
                {saving && (
                  <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProfilePage;