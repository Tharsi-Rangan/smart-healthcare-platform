import { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "../../api/doctorApi";

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await getAdminDashboardSummary();
        setSummary(response.data?.summary || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin summary");
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of doctor registrations and approvals.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Doctors</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {summary?.totalDoctors ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Doctors</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {summary?.pendingDoctors ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved Doctors</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {summary?.approvedDoctors ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Availability Slots</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {summary?.totalAvailabilitySlots ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;