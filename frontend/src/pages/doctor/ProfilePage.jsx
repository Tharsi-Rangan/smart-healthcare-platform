import { useEffect, useMemo, useState } from "react";
import {
  getDoctorProfile,
  updateDoctorProfile,
  updateConsultationFee,
} from "../../api/doctorApi";
import { motion } from "framer-motion";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCTOR_SERVICE_BASE_URL = "http://localhost:5006";

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
  const [imageError, setImageError] = useState(false);

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
          setImageError(false);
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
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";
      case "rejected":
        return "border border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border border-amber-200 bg-amber-50 text-amber-700";
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
    setImageError(false);

    setFieldErrors((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview("");
    setExistingPhotoUrl("");
    setImageError(false);

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
      setExistingPhotoUrl(doctor?.profilePhotoUrl || "");
      setPhotoPreview(doctor?.profilePhotoUrl || "");
      setImageError(false);

      if (formData.consultationFee) {
        try {
          await updateConsultationFee(Number(formData.consultationFee));
        } catch {
          // ignore fee update failure
        }
      }

      setMessage(response.message || "Profile and consultation fee saved successfully");
      setProfilePhoto(null);
    } catch (err) {
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
    setImageError(false);
    setFieldErrors({});
  };

  const resolvedImageUrl = useMemo(() => {
    if (!photoPreview) return "";

    if (photoPreview.startsWith("blob:")) return photoPreview;
    if (photoPreview.startsWith("http")) return photoPreview;
    if (photoPreview.startsWith("/")) {
      return `${DOCTOR_SERVICE_BASE_URL}${photoPreview}`;
    }

    return `${DOCTOR_SERVICE_BASE_URL}/${photoPreview}`;
  }, [photoPreview]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Doctor Profile Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Manage your professional details, identity, and consultation settings.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Profile Completion
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {profileCompletion}%
            </p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Approval Status
          </p>
          <div className="mt-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                approvalStatus
              )}`}
            >
              {approvalStatus}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Doctor Name
          </p>
          <p className="mt-3 truncate text-base font-semibold text-slate-900">
            {formData.doctorName || "Not added"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Specialization
          </p>
          <p className="mt-3 truncate text-base font-semibold text-slate-900">
            {formData.specialization || "Not added"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Experience
          </p>
          <p className="mt-3 text-base font-semibold text-slate-900">
            {formData.experience || 0} years
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {resolvedImageUrl && !imageError ? (
              <img
                src={resolvedImageUrl}
                alt="Doctor profile"
                onError={() => setImageError(true)}
                className="h-36 w-36 rounded-full border-4 border-slate-100 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-cyan-700 text-4xl font-bold text-white shadow-md">
                {formData.doctorName?.[0]?.toUpperCase() || "DR"}
              </div>
            )}

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              {formData.doctorName || "Doctor Name"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formData.specialization || "Specialization not set"}
            </p>

            <span
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                approvalStatus
              )}`}
            >
              {approvalStatus}
            </span>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                License Number
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {formData.licenseNumber || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Hospital / Clinic
              </p>
              <p className="mt-2 break-words text-sm font-medium text-slate-800">
                {formData.hospital || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Experience
                </p>
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {formData.experience || 0} years
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Fee
                </p>
                <p className="mt-2 text-sm font-bold text-cyan-700">
                  LKR {formData.consultationFee || 500}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Professional Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your information accurate so admins can verify your account and patients can view a professional profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Profile Photo
              </label>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
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
                      className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Allowed: JPG, PNG, WEBP. Max size: 2MB.
                </p>

                {fieldErrors.profilePhoto && (
                  <p className="mt-2 text-xs text-amber-600">{fieldErrors.profilePhoto}</p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Dr. John Doe"
                />
                {fieldErrors.doctorName && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.doctorName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Cardiology"
                />
                {fieldErrors.specialization && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.specialization}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="LIC-2026-001"
                />
                {fieldErrors.licenseNumber && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.licenseNumber}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Hospital / Clinic *
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="City Medical Center"
                />
                {fieldErrors.hospital && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.hospital}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="5"
                />
                {fieldErrors.experience && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.experience}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Consultation Fee (LKR)
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  step="50"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Fee charged to patients when they book appointments.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset Form
              </button>
            </div>
          </form>
        </section>
      </div>
    </motion.div>
  );
}

export default ProfilePage;