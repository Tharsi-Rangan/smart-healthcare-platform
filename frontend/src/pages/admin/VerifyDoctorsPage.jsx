import { useEffect, useMemo, useState } from "react";
import {
  approveDoctor,
  getPendingDoctors,
  rejectDoctor,
} from "../../api/doctorApi";

function VerifyDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [reviewMessages, setReviewMessages] = useState({});
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

  const stats = useMemo(() => {
    return {
      pending: doctors.length,
      withHospital: doctors.filter((d) => d.hospital).length,
      withExperience: doctors.filter((d) => Number(d.experience) > 0).length,
    };
  }, [doctors]);

  const handleMessageChange = (doctorId, value) => {
    setReviewMessages((prev) => ({
      ...prev,
      [doctorId]: value,
    }));
  };

  const handleApprove = async (doctorId) => {
    try {
      setActionLoadingId(doctorId);
      setMessage("");
      setError("");

      const response = await approveDoctor(doctorId, {
        adminReviewMessage: reviewMessages[doctorId] || "Approved by admin",
      });

      setMessage(response.message || "Doctor approved successfully");
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve doctor");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (doctorId) => {
    const reviewMessage = reviewMessages[doctorId]?.trim();

    if (!reviewMessage) {
      setError("Please enter a rejection reason before rejecting a doctor.");
      return;
    }

    try {
      setActionLoadingId(doctorId);
      setMessage("");
      setError("");

      const response = await rejectDoctor(doctorId, {
        adminReviewMessage: reviewMessage,
      });

      setMessage(response.message || "Doctor rejected successfully");
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject doctor");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading pending doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-4xl border border-slate-200 bg-linear-to-r from-slate-900 to-cyan-700 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
              Doctor Verification
            </p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              Verify Doctor Registrations
            </h1>
            <p className="mt-3 max-w-2xl text-base text-cyan-50 md:text-lg">
              Review doctor applications and provide approval or rejection notes.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Pending Requests</p>
            <p className="mt-2 text-3xl font-bold">{stats.pending}</p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-base text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-base text-red-600">
          {error}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Pending
          </p>
          <h3 className="mt-4 text-3xl font-bold text-slate-900">{stats.pending}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            With Hospital Info
          </p>
          <h3 className="mt-4 text-3xl font-bold text-cyan-600">{stats.withHospital}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            With Experience Info
          </p>
          <h3 className="mt-4 text-3xl font-bold text-slate-900">{stats.withExperience}</h3>
        </div>
      </section>

      <section className="space-y-6">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-4xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="grid gap-6 xl:grid-cols-[1fr,300px]">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {doctor.doctorName || "Doctor"}
                  </h2>
                  <p className="mt-2 text-sm text-cyan-700">
                    {doctor.specialization || "Specialization not added"}
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        License Number
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {doctor.licenseNumber || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Experience
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {doctor.experience || 0} years
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Hospital / Clinic
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {doctor.hospital || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Status
                      </p>
                      <p className="mt-1 font-medium capitalize text-slate-900">
                        {doctor.approvalStatus || "pending"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Admin Review Message
                    </label>
                    <textarea
                      rows="4"
                      value={reviewMessages[doctor._id] || ""}
                      onChange={(e) => handleMessageChange(doctor._id, e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                      placeholder="Example: License number format is incorrect, please update and resubmit."
                    />
                  </div>
                </div>

                <div className="flex items-start xl:justify-end">
                  <div className="grid w-full gap-3 xl:w-60">
                    <button
                      onClick={() => handleApprove(doctor._id)}
                      disabled={actionLoadingId === doctor._id}
                      className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-70"
                    >
                      {actionLoadingId === doctor._id ? "Processing..." : "Approve"}
                    </button>

                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={actionLoadingId === doctor._id}
                      className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-70"
                    >
                      Reject with Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">
              No pending doctor registrations
            </p>
            <p className="mt-2 text-slate-500">
              All doctor requests have been reviewed.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default VerifyDoctorsPage;