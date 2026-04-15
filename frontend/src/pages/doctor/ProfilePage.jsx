import { useEffect, useMemo, useState } from "react";
import { getDoctorProfile, updateDoctorProfile } from "../../api/doctorApi";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ProfilePage() {
  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
    experience: "",
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
    let total = 6;
    let completed = 0;

    if (formData.doctorName.trim()) completed += 1;
    if (formData.specialization.trim()) completed += 1;
    if (formData.licenseNumber.trim()) completed += 1;
    if (formData.hospital.trim()) completed += 1;
    if (formData.experience !== "" && Number(formData.experience) >= 0) completed += 1;
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
      setMessage(response.message || "Profile saved successfully");
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
    });
    setProfilePhoto(null);
    setPhotoPreview(existingPhotoUrl || "");
    setFieldErrors({});
  };

  if (loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading doctor profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-r from-cyan-600 to-sky-700 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
              Doctor Profile Management
            </p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">My Profile</h1>
            <p className="mt-3 max-w-2xl text-lg text-cyan-50">
              Manage your professional details, identity, and verification information.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Profile Completion</p>
            <p className="mt-2 text-3xl font-bold">{profileCompletion}%</p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-base text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-base text-red-600">
          {error}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Approval Status
          </p>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusClasses(approvalStatus)}`}>
              {approvalStatus}
            </span>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Doctor Name
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">
            {formData.doctorName || "Not added"}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Specialization
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">
            {formData.specialization || "Not added"}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Experience
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">
            {formData.experience || 0} years
          </h3>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[360px,1fr]">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Doctor profile"
                className="h-28 w-28 rounded-full border-4 border-cyan-100 object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-cyan-100 text-3xl font-bold text-cyan-700">
                DR
              </div>
            )}

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              {formData.doctorName || "Doctor Name"}
            </h2>

            <p className="mt-2 text-base text-cyan-700">
              {formData.specialization || "Specialization not set"}
            </p>

            <span className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusClasses(approvalStatus)}`}>
              {approvalStatus}
            </span>
          </div>

          <div className="my-8 border-t border-slate-200" />

          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Doctor Name</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formData.doctorName || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">License Number</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formData.licenseNumber || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Hospital / Clinic</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formData.hospital || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Experience</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formData.experience || 0} years
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Professional Details</h2>
            <p className="mt-2 text-slate-500">
              Keep your information accurate so admins can review and verify your doctor account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Profile Photo
              </label>

              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-700"
                />

                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Allowed: JPG, PNG, WEBP. Max size: 2MB.
              </p>

              {fieldErrors.profilePhoto && (
                <p className="mt-2 text-sm text-amber-600">{fieldErrors.profilePhoto}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Doctor Name
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="Dr. John Doe"
                />
                {fieldErrors.doctorName && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.doctorName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="Cardiology"
                />
                {fieldErrors.specialization && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.specialization}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="LIC-2026-001"
                />
                {fieldErrors.licenseNumber && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.licenseNumber}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Hospital / Clinic
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="City Medical Center"
                />
                {fieldErrors.hospital && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.hospital}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="5"
                />
                {fieldErrors.experience && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.experience}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Reset Form
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;