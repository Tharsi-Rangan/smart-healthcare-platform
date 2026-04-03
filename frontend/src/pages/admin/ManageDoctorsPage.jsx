import { useEffect, useState } from "react";
import { getAllDoctors } from "../../api/doctorApi";

function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await getAllDoctors();
        setDoctors(response.data?.doctors || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading doctors...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">Manage Doctors</h1>
        <p className="mt-3 text-2xl text-slate-500">
          View and manage doctor accounts
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-5xl font-bold text-slate-900">{doctors.length}</h3>
          <p className="mt-3 text-2xl text-slate-500">Total Doctors</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-5xl font-bold text-slate-900">
            {doctors.filter((d) => d.approvalStatus === "approved").length}
          </h3>
          <p className="mt-3 text-2xl text-slate-500">Approved</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-5xl font-bold text-slate-900">
            {doctors.filter((d) => d.approvalStatus === "pending").length}
          </h3>
          <p className="mt-3 text-2xl text-slate-500">Pending Verification</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-5xl font-bold text-cyan-600">4.8</h3>
          <p className="mt-3 text-2xl text-slate-500">Avg Rating</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {doctor.specialization || "Doctor"}
                </h2>
                <p className="mt-2 text-2xl text-cyan-600">{doctor.hospital || "-"}</p>
                <p className="mt-3 text-xl text-slate-500">
                  Status: {doctor.approvalStatus}
                </p>
              </div>

              <span className="text-lg text-slate-500">{doctor.approvalStatus}</span>
            </div>

            <div className="mt-6 space-y-3 text-xl text-slate-600">
              <p>Email: not available</p>
              <p>License: {doctor.licenseNumber}</p>
              <p>Experience: {doctor.experience || 0} years</p>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 rounded-2xl bg-slate-100 px-5 py-4 text-2xl font-medium text-slate-900">
                View
              </button>

              <button className="rounded-2xl bg-rose-50 px-5 py-4 text-2xl text-red-500">
                ⦸
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDoctorsPage;