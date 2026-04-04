import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { fetchPatientSummary } from "../../services/patientService";

function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetchPatientSummary();
        setSummary(response.data.summary);
      } catch (err) {
        setError(err.message || "Failed to load patient summary");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading dashboard summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Patient Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {user?.name || summary?.profile?.fullName || "Patient"}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Medical History Records</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">
            {summary?.counts?.medicalHistory ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Medical Reports</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">
            {summary?.counts?.reports ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Blood Group</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">
            {summary?.profile?.bloodGroup || "--"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Profile Snapshot</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Full Name:</span>{" "}
              {summary?.profile?.fullName || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Email:</span>{" "}
              {summary?.profile?.email || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Phone:</span>{" "}
              {summary?.profile?.phone || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Latest Medical History</h2>
          {summary?.latestMedicalHistory ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Condition:</span>{" "}
                {summary.latestMedicalHistory.conditionName}
              </p>
              <p>
                <span className="font-medium text-slate-700">Status:</span>{" "}
                {summary.latestMedicalHistory.status}
              </p>
              <p>
                <span className="font-medium text-slate-700">Source:</span>{" "}
                {summary.latestMedicalHistory.source || "-"}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No medical history records available yet.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Latest Uploaded Report</h2>
        {summary?.latestReport ? (
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Title:</span>{" "}
              {summary.latestReport.title}
            </p>
            <p>
              <span className="font-medium text-slate-700">Type:</span>{" "}
              {summary.latestReport.reportType || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-700">File:</span>{" "}
              {summary.latestReport.originalFileName}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No reports uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;