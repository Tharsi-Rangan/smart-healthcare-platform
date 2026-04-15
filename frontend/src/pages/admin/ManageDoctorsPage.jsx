import { useEffect, useMemo, useState } from "react";
import { getAllDoctors, toggleDoctorActiveStatus } from "../../api/doctorApi";

function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [adminMessages, setAdminMessages] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadDoctors();
  }, []);

  const stats = useMemo(() => {
    return {
      total: doctors.length,
      approved: doctors.filter((d) => d.approvalStatus === "approved").length,
      pending: doctors.filter((d) => d.approvalStatus === "pending").length,
      inactive: doctors.filter((d) => d.isActive === false).length,
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const value = search.toLowerCase();

    return doctors.filter((doctor) => {
      return (
        doctor.doctorName?.toLowerCase().includes(value) ||
        doctor.specialization?.toLowerCase().includes(value) ||
        doctor.hospital?.toLowerCase().includes(value) ||
        doctor.licenseNumber?.toLowerCase().includes(value)
      );
    });
  }, [doctors, search]);

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

  const handleMessageChange = (doctorId, value) => {
    setAdminMessages((prev) => ({
      ...prev,
      [doctorId]: value,
    }));
  };

  const handleToggleActive = async (doctorId) => {
    try {
      setActionLoadingId(doctorId);
      setMessage("");
      setError("");

      const response = await toggleDoctorActiveStatus(doctorId, {
        adminReviewMessage: adminMessages[doctorId] || "",
      });

      setMessage(response.message || "Doctor status updated");
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update doctor status");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-r from-slate-900 to-cyan-700 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
              Doctor Management
            </p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              Manage Doctors
            </h1>
            <p className="mt-3 max-w-2xl text-base text-cyan-50 md:text-lg">
              Review all doctors, monitor approval states, and activate or deactivate access.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Total Doctors</p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
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

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Total Doctors
          </p>
          <h3 className="mt-4 text-3xl font-bold text-slate-900">{stats.total}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Approved
          </p>
          <h3 className="mt-4 text-3xl font-bold text-emerald-600">{stats.approved}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Pending
          </p>
          <h3 className="mt-4 text-3xl font-bold text-amber-600">{stats.pending}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Inactive
          </p>
          <h3 className="mt-4 text-3xl font-bold text-rose-600">{stats.inactive}</h3>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Doctor Directory</h2>
        <p className="mt-2 text-slate-500">
          Search by doctor name, specialization, hospital, or license number.
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctors..."
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {doctor.doctorName || "Doctor"}
                  </h2>
                  <p className="mt-2 text-sm text-cyan-700">
                    {doctor.specialization || "Specialization not added"}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                    doctor.approvalStatus
                  )}`}
                >
                  {doctor.approvalStatus || "pending"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
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
                    Account Status
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {doctor.isActive === false ? "Inactive" : "Active"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Admin Message
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {doctor.adminReviewMessage || "No admin message"}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Admin Note
                </label>
                <textarea
                  rows="3"
                  value={adminMessages[doctor._id] || ""}
                  onChange={(e) => handleMessageChange(doctor._id, e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="Example: Temporarily deactivated due to incomplete schedule."
                />
              </div>

              <div className="mt-5">
                <button
                  onClick={() => handleToggleActive(doctor._id)}
                  disabled={actionLoadingId === doctor._id}
                  className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-70 ${
                    doctor.isActive === false
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  }`}
                >
                  {actionLoadingId === doctor._id
                    ? "Processing..."
                    : doctor.isActive === false
                    ? "Activate Doctor"
                    : "Deactivate Doctor"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 xl:col-span-3 rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">
              No doctors found
            </p>
            <p className="mt-2 text-slate-500">
              Try changing the search keyword.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ManageDoctorsPage;