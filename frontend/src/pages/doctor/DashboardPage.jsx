import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctorAvailability, getDoctorProfile } from "../../api/doctorApi";

function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, availabilityRes] = await Promise.all([
          getDoctorProfile(),
          getDoctorAvailability(),
        ]);

        setProfile(profileRes?.data?.doctor || null);
        setAvailability(availabilityRes?.data?.availability || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load doctor dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const doctorName = profile?.doctorName || "Doctor";
  const specialization = profile?.specialization || "Specialization not added";
  const hospital = profile?.hospital || "Hospital not added";
  const licenseNumber = profile?.licenseNumber || "Not added";
  const experience = profile?.experience || 0;
  const consultationFee = profile?.consultationFee || 500;
  const approvalStatus = profile?.approvalStatus || "pending";
  const profilePhotoUrl = profile?.profilePhotoUrl || "";

  const doctorImage =
    profilePhotoUrl && profilePhotoUrl.startsWith("http")
      ? profilePhotoUrl
      : profilePhotoUrl
        ? `http://localhost:5006${profilePhotoUrl}`
        : "";

  const activeAvailabilityCount = useMemo(() => {
    return availability.filter((slot) => slot.isActive !== false).length;
  }, [availability]);

  const profileCompletion = useMemo(() => {
    let total = 6;
    let completed = 0;

    if (profile?.doctorName) completed += 1;
    if (profile?.specialization) completed += 1;
    if (profile?.licenseNumber) completed += 1;
    if (profile?.hospital) completed += 1;
    if (
      profile?.experience !== undefined &&
      profile?.experience !== null &&
      profile?.experience !== ""
    ) {
      completed += 1;
    }
    if (profile?.profilePhotoUrl) completed += 1;

    return Math.round((completed / total) * 100);
  }, [profile]);

  const missingItems = useMemo(() => {
    const items = [];

    if (!profile?.doctorName) items.push("Add doctor name");
    if (!profile?.specialization) items.push("Add specialization");
    if (!profile?.licenseNumber) items.push("Add license number");
    if (!profile?.hospital) items.push("Add hospital");
    if (
      profile?.experience === undefined ||
      profile?.experience === null ||
      profile?.experience === ""
    ) {
      items.push("Add experience");
    }
    if (!profile?.profilePhotoUrl) items.push("Upload profile image");
    if (availability.length === 0) items.push("Add availability slots");

    return items;
  }, [profile, availability]);

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

  const welcomeMessage =
    approvalStatus === "approved"
      ? "Your account is approved and ready for appointment handling."
      : approvalStatus === "pending"
        ? "Your profile is currently under admin review."
        : "Your profile needs updates before approval.";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-base text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Doctor Workspace
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Welcome, {doctorName}
              </h1>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                  approvalStatus
                )}`}
              >
                {approvalStatus}
              </span>
            </div>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">
              Manage your profile, working availability, appointment requests,
              patient reports, and prescriptions from one clean workspace.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                {specialization}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                {hospital}
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-500">{welcomeMessage}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/doctor/profile"
              className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              Update Profile
            </Link>

            <Link
              to="/doctor/availability"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Availability
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Profile Completion
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {profileCompletion}%
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Professional details completed.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Experience
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {experience}
          </h3>
          <p className="mt-2 text-sm text-slate-500">Years of practice.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Active Slots
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {activeAvailabilityCount}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Slots available to patients.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Consultation Fee
          </p>
          <h3 className="mt-3 text-3xl font-bold text-cyan-700">
            {consultationFee}
          </h3>
          <p className="mt-2 text-sm text-slate-500">Fee per booking in LKR.</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-cyan-700 text-2xl font-bold text-white shadow-sm">
              {doctorImage ? (
                <img
                  src={doctorImage}
                  alt="Doctor profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                "DR"
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Doctor Profile
              </p>
              <h2 className="mt-1 truncate text-2xl font-bold text-slate-900">
                {doctorName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{specialization}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                    approvalStatus
                  )}`}
                >
                  {approvalStatus}
                </span>

                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {hospital}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                Profile Completion
              </p>
              <span className="text-sm font-semibold text-slate-900">
                {profileCompletion}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-cyan-700 transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                License Number
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {licenseNumber}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Hospital / Clinic
              </p>
              <p className="mt-2 break-words text-base font-semibold text-slate-900">
                {hospital}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account Note
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {approvalStatus === "approved"
                ? "Your profile is verified and ready to handle patient appointments."
                : approvalStatus === "pending"
                  ? "Your profile is awaiting admin approval."
                  : "Your profile needs corrections before approval."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Missing Items
            </p>
            {missingItems.length === 0 ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">
                Your profile is complete and ready.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {missingItems.map((item) => (
                  <li key={item} className="text-sm text-slate-600">
                    • {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Workspace Status
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Specialization</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {specialization}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Consultation Fee</p>
                <p className="mt-1 text-sm font-semibold text-cyan-700">
                  LKR {consultationFee}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Move between key doctor tasks without leaving the dashboard.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Link
              to="/doctor/appointments"
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">
                Manage Appointments
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Review and update appointment requests.
              </p>
            </Link>

            <Link
              to="/doctor/profile"
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">
                Update Profile
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Maintain professional and hospital details.
              </p>
            </Link>

            <Link
              to="/doctor/availability"
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">
                Edit Availability
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Control visible patient booking slots.
              </p>
            </Link>

            <Link
              to="/doctor/prescriptions"
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">
                Issue Prescriptions
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Create and manage digital prescriptions.
              </p>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Profile Summary</h2>
          <p className="mt-1 text-sm text-slate-500">
            Important information from your current doctor profile.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Name
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {doctorName}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Specialization
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {specialization}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Hospital
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 break-words">
                {hospital}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                License Number
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {licenseNumber}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;