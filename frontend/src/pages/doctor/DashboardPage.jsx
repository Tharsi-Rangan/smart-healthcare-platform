import { useEffect, useState } from "react";
import { getDoctorProfile, getDoctorAvailability } from "../../api/doctorApi";

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
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your approval status, profile summary, and availability.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approval Status</p>
          <div className="mt-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[profile?.approvalStatus] || "bg-slate-100 text-slate-700"
              }`}
            >
              {profile?.approvalStatus || "not created"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Specialization</p>
          <p className="mt-3 text-lg font-semibold text-slate-800">
            {profile?.specialization || "Not added"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Hospital</p>
          <p className="mt-3 text-lg font-semibold text-slate-800">
            {profile?.hospital || "Not added"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Availability Slots</p>
          <p className="mt-3 text-lg font-semibold text-slate-800">
            {availability.length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Profile Summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">License:</span>{" "}
              {profile?.licenseNumber || "Not added"}
            </p>
            <p>
              <span className="font-medium text-slate-800">Experience:</span>{" "}
              {profile?.experience ?? 0} years
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Recent Availability</h2>
          <div className="mt-4 space-y-3">
            {availability.length > 0 ? (
              availability.slice(0, 4).map((slot) => (
                <div
                  key={slot._id}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                >
                  {slot.day} • {slot.startTime} - {slot.endTime}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No availability added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;