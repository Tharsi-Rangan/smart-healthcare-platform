import { useEffect, useState } from "react";
import {
  fetchPatientProfile,
  updatePatientProfile,
} from "../../services/patientService";

function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergiesSummary: "",
    chronicConditionsSummary: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchPatientProfile();
        const profile = response.data.profile;

        setFormData({
          fullName: profile.fullName || "",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: profile.gender || "",
          address: profile.address || "",
          bloodGroup: profile.bloodGroup || "",
          emergencyContactName: profile.emergencyContactName || "",
          emergencyContactPhone: profile.emergencyContactPhone || "",
          allergiesSummary: profile.allergiesSummary || "",
          chronicConditionsSummary: profile.chronicConditionsSummary || "",
          profileImage: profile.profileImage || "",
        });
      } catch (err) {
        setErrorMessage(err.message || "Failed to load profile");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await updatePatientProfile(formData);
      setSuccessMessage(response.message || "Profile updated successfully");
    } catch (err) {
      setErrorMessage(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your personal and emergency contact details.
        </p>
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

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Profile Image URL
            </label>
            <input
              type="text"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Emergency Contact Name
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Emergency Contact Phone
            </label>
            <input
              type="text"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Allergies Summary
          </label>
          <textarea
            name="allergiesSummary"
            value={formData.allergiesSummary}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;