import { useEffect, useState } from "react";
import {
  approveDoctor,
  getPendingDoctors,
  rejectDoctor,
} from "../../api/doctorApi";

function VerifyDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPendingDoctors = async () => {
    try {
      const response = await getPendingDoctors();
      setDoctors(response.data?.doctors || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const handleApprove = async (doctorId) => {
    try {
      const response = await approveDoctor(doctorId);
      setMessage(response.message || "Doctor approved successfully");
      loadPendingDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve doctor");
    }
  };

  const handleReject = async (doctorId) => {
    try {
      const response = await rejectDoctor(doctorId);
      setMessage(response.message || "Doctor rejected successfully");
      loadPendingDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject doctor");
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading pending doctors...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Verify Doctors</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review pending doctor profiles and approve or reject them.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {doctor.specialization}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  License: {doctor.licenseNumber}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Hospital: {doctor.hospital || "Not provided"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Experience: {doctor.experience || 0} years
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(doctor._id)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(doctor._id)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            No pending doctors found.
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyDoctorsPage;