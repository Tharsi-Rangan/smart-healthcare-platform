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

  const loadDoctors = async () => {
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
    loadDoctors();
  }, []);

  const handleApprove = async (doctorId) => {
    try {
      const response = await approveDoctor(doctorId);
      setMessage(response.message || "Doctor approved successfully");
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve doctor");
    }
  };

  const handleReject = async (doctorId) => {
    try {
      const response = await rejectDoctor(doctorId);
      setMessage(response.message || "Doctor rejected successfully");
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject doctor");
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading pending doctors...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">
          Verify Doctor Registrations
        </h1>
        <p className="mt-3 text-2xl text-slate-500">
          Review and approve new doctor applications
        </p>
      </div>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-lg text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-5xl font-bold text-slate-900">{doctors.length}</h3>
          <p className="mt-3 text-2xl text-slate-500">Pending Verification</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-5xl font-bold text-slate-900">—</h3>
          <p className="mt-3 text-2xl text-slate-500">Verified Doctors</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-5xl font-bold text-red-500">—</h3>
          <p className="mt-3 text-2xl text-slate-500">Rejected This Month</p>
        </div>
      </div>

      <div className="space-y-6">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
            >
              <div className="grid gap-8 xl:grid-cols-[1fr,280px]">
                <div>
                  <h2 className="text-4xl font-semibold text-slate-900">
                    {doctor.specialization || "Doctor"}
                  </h2>
                  <p className="mt-2 text-2xl text-cyan-600">
                    Pending Verification
                  </p>
                  <p className="mt-2 text-xl text-slate-500">
                    Submitted doctor profile
                  </p>

                  <div className="mt-8 grid gap-5 md:grid-cols-2 text-xl">
                    <div>
                      <p className="text-slate-500">License Number</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {doctor.licenseNumber}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Experience</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {doctor.experience || 0} years
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Hospital</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {doctor.hospital || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Status</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {doctor.approvalStatus}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full rounded-2xl bg-slate-100 px-6 py-4 text-2xl font-medium text-slate-900">
                    View Details
                  </button>

                  <button
                    onClick={() => handleApprove(doctor._id)}
                    className="w-full rounded-2xl bg-cyan-600 px-6 py-4 text-2xl font-semibold text-white"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(doctor._id)}
                    className="w-full rounded-2xl bg-rose-50 px-6 py-4 text-2xl font-medium text-red-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-xl text-slate-500 shadow-sm">
            No pending doctor registrations found.
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyDoctorsPage;