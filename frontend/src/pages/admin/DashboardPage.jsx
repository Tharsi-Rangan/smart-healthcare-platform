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
        setError(err.response?.data?.message || "Failed to load admin dashboard");
      }
    };

    loadSummary();
  }, []);

  const stats = [
    {
      title: "Total Doctors",
      value: summary?.totalDoctors ?? 0,
    },
    {
      title: "Approved Doctors",
      value: summary?.approvedDoctors ?? 0,
    },
    {
      title: "Pending Verifications",
      value: summary?.pendingDoctors ?? 0,
    },
    {
      title: "Availability Slots",
      value: summary?.totalAvailabilitySlots ?? 0,
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-3 text-2xl text-slate-500">
          Platform overview and management
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-7 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <h3 className="text-5xl font-bold text-slate-900">{item.value}</h3>
            <p className="mt-3 text-2xl text-slate-500">{item.title}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-4xl font-semibold text-slate-900">Quick Actions</h2>

        <div className="grid gap-6 lg:grid-cols-4">
          {[
            "Verify Doctors",
            "Manage Users",
            "Manage Doctors",
            "Transactions",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[24px] border border-slate-200 p-7"
            >
              <h3 className="text-3xl font-semibold text-slate-900">{item}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;