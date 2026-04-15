import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctorAvailability, getDoctorProfile } from "../../api/doctorApi";

function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, availabilityRes] = await Promise.all([
          getDoctorProfile(),
          getDoctorAvailability(),
        ]);

        setProfile(profileRes.data?.doctor || null);
setAvailability(availabilityRes.data?.availability || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load doctor dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const doctorName = profile?.doctorName || "Doctor";
  const approvalStatus = profile?.approvalStatus || "pending";
  const specialization = profile?.specialization || "Not added";
  const experience = profile?.experience || 0;
  const hospital = profile?.hospital || "Not added";
  const licenseNumber = profile?.licenseNumber || "Not added";
  const profilePhotoUrl = profile?.profilePhotoUrl || "";

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
    if (profile?.experience !== undefined && Number(profile?.experience) >= 0) {
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
    if (!profile?.hospital) items.push("Add hospital or clinic");
    if (profile?.experience === undefined || profile?.experience === null || profile?.experience === "") {
      items.push("Add years of experience");
    }
    if (!profile?.profilePhotoUrl) items.push("Upload profile photo");
    if (availability.length === 0) items.push("Add availability schedule");

    return items;
  }, [profile, availability]);

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

  const welcomeText =
    approvalStatus === "approved"
      ? "Your account is approved and ready for appointment handling."
      : approvalStatus === "rejected"
      ? "Your profile needs updates before approval."
      : "Your profile is under review by admin.";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-base text-slate-500">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-r from-cyan-600 via-sky-700 to-slate-900 text-white shadow-sm">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr,0.8fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
              Doctor Workspace
            </p>

            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              Welcome, {doctorName}
            </h1>

            <p className="mt-4 max-w-2xl text-base text-cyan-50 md:text-lg">
              Manage your doctor profile, working availability, appointment
              requests, patient reports, and digital prescriptions from one
              dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusClasses(
                  approvalStatus
                )}`}
              >
                {approvalStatus}
              </span>

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                {specialization}
              </span>
            </div>

            <p className="mt-5 text-sm text-cyan-100">{welcomeText}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/doctor/profile"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Update Profile
              </Link>

              <Link
                to="/doctor/availability"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Manage Availability
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Doctor profile"
                  className="h-20 w-20 rounded-full border-4 border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-2xl font-bold text-white">
                  DR
                </div>
              )}

              <div>
                <p className="text-sm text-cyan-100">Doctor</p>
                <h2 className="text-2xl font-bold text-white">
                  {doctorName}
                </h2>
                <p className="text-sm text-cyan-100">
                  {specialization}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-cyan-100">Profile Completion</p>
                <p className="text-sm font-semibold text-white">
                  {profileCompletion}%
                </p>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-cyan-100">
                    Experience
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {experience}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-cyan-100">
                    Active Slots
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {activeAvailabilityCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-base text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Approval Status
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold capitalize text-slate-900">
              {approvalStatus}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                approvalStatus
              )}`}
            >
              {approvalStatus}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Current verification status from admin review.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Specialization
          </p>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            {specialization}
          </h3>
          <p className="mt-3 text-sm text-slate-500">
            Your listed professional area.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Experience
          </p>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            {experience} {experience === 1 ? "Year" : "Years"}
          </h3>
          <p className="mt-3 text-sm text-slate-500">
            Total years saved in your profile.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Availability Slots
          </p>
          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            {activeAvailabilityCount}
          </h3>
          <p className="mt-3 text-sm text-slate-500">
            Active consultation schedule slots.
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
          <p className="text-slate-500">
            Open the main doctor-side pages in one click.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Link
            to="/doctor/profile"
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
          >
            <p className="text-lg font-semibold text-slate-900">My Profile</p>
            <p className="mt-2 text-sm text-slate-500">
              Manage doctor name, photo, hospital, and license details.
            </p>
          </Link>

          <Link
            to="/doctor/availability"
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
          >
            <p className="text-lg font-semibold text-slate-900">Availability</p>
            <p className="mt-2 text-sm text-slate-500">
              Set weekly schedule and active consultation slots.
            </p>
          </Link>

          <Link
            to="/doctor/appointments"
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
          >
            <p className="text-lg font-semibold text-slate-900">Appointments</p>
            <p className="mt-2 text-sm text-slate-500">
              Review and manage appointment requests.
            </p>
          </Link>

          <Link
            to="/doctor/reports"
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
          >
            <p className="text-lg font-semibold text-slate-900">Patient Reports</p>
            <p className="mt-2 text-sm text-slate-500">
              Review patient records and uploaded report details.
            </p>
          </Link>

          <Link
            to="/doctor/prescriptions"
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
          >
            <p className="text-lg font-semibold text-slate-900">Prescriptions</p>
            <p className="mt-2 text-sm text-slate-500">
              Create and manage digital prescriptions.
            </p>
          </Link>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
        {/* Profile summary */}
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Professional Summary
              </h2>
              <p className="mt-2 text-slate-500">
                Main doctor profile details shown across the platform.
              </p>
            </div>

            <Link
              to="/doctor/profile"
              className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Edit Profile
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Doctor Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {doctorName}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">License Number</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {licenseNumber}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Hospital / Clinic</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {hospital}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Approval State</p>
              <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                {approvalStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Setup Checklist</h2>
          <p className="mt-2 text-slate-500">
            Complete these items to make your doctor account presentation-ready.
          </p>

          <div className="mt-6 space-y-4">
            {missingItems.length > 0 ? (
              missingItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <p className="text-slate-800">{item}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-emerald-700">
                All major doctor profile and availability details are completed.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Availability preview */}
      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Recent Availability
            </h2>
            <p className="mt-2 text-slate-500">
              Preview of your current weekly consultation schedule.
            </p>
          </div>

          <Link
            to="/doctor/availability"
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Manage Schedule
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availability.length > 0 ? (
            availability.slice(0, 6).map((slot) => (
              <div
                key={slot._id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-900">
                    {slot.day}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      slot.isActive === false
                        ? "bg-slate-200 text-slate-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {slot.isActive === false ? "Inactive" : "Active"}
                  </span>
                </div>

                <p className="mt-3 text-slate-600">
                  {slot.startTime} - {slot.endTime}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Slot duration: {slot.slotDuration || 30} mins
                </p>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-lg font-medium text-slate-700">
                No availability added yet
              </p>
              <p className="mt-2 text-slate-500">
                Add your weekly consultation schedule to start managing patient
                appointments.
              </p>
              <Link
                to="/doctor/availability"
                className="mt-5 inline-flex rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Add Availability
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
