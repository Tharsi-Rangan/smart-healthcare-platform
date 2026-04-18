import { useEffect, useMemo, useState } from "react";
import {
  getAllDoctors,
  toggleDoctorActiveStatus,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
} from "../../api/doctorApi";

function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [adminMessages, setAdminMessages] = useState({});
  const [reviewMessages, setReviewMessages] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    try {
      const [allResponse, pendingResponse] = await Promise.all([
        getAllDoctors(),
        getPendingDoctors(),
      ]);
      setDoctors(allResponse.data?.doctors || []);
      setPendingDoctors(pendingResponse.data?.doctors || []);
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
      pending: pendingDoctors.length,
      inactive: doctors.filter((d) => d.isActive === false).length,
    };
  }, [doctors, pendingDoctors]);

  const filteredDoctors = useMemo(() => {
    const value = search.toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.doctorName?.toLowerCase().includes(value) ||
        doctor.specialization?.toLowerCase().includes(value) ||
        doctor.hospital?.toLowerCase().includes(value) ||
        doctor.licenseNumber?.toLowerCase().includes(value);

      const matchesApprovalFilter =
        approvalFilter === "" ||
        (approvalFilter === "pending" &&
          doctor.approvalStatus !== "approved" &&
          doctor.approvalStatus !== "rejected") ||
        (approvalFilter === "approved" &&
          doctor.approvalStatus === "approved") ||
        (approvalFilter === "rejected" &&
          doctor.approvalStatus === "rejected");

      const matchesStatusFilter =
        statusFilter === "" ||
        (statusFilter === "active" && doctor.isActive !== false) ||
        (statusFilter === "inactive" && doctor.isActive === false);

      return matchesSearch && matchesApprovalFilter && matchesStatusFilter;
    });
  }, [doctors, search, approvalFilter, statusFilter]);

  const getStatusClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";
      case "rejected":
        return "border border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  const handleMessageChange = (doctorId, value) => {
    setAdminMessages((prev) => ({
      ...prev,
      [doctorId]: value,
    }));
  };

  const handleReviewMessageChange = (doctorId, value) => {
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Doctor Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage Doctors
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">
              Verify doctor applications, manage approval state, and control access.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Doctors
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
      </section>

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Doctors
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{stats.total}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Approved
          </p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">{stats.approved}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pending Verification
          </p>
          <h3 className="mt-3 text-3xl font-bold text-amber-600">{stats.pending}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Inactive
          </p>
          <h3 className="mt-3 text-3xl font-bold text-rose-600">{stats.inactive}</h3>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Doctor Directory</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search, filter, and manage doctor accounts.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr,0.9fr,0.9fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization, hospital, or license..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Approval Status
            </label>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value="">All Approval Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Account Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value="">All Account Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-slate-900">
                    {doctor.doctorName || "Doctor"}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-cyan-700">
                    {doctor.specialization || "Not added"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {doctor.hospital || "Hospital not added"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                    doctor.approvalStatus
                  )}`}
                >
                  {doctor.approvalStatus || "pending"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    License
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {doctor.licenseNumber || "Not added"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {doctor.experience ?? 0} years
                  </p>
                </div>
              </div>

              {doctor.approvalStatus === "pending" && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Review Message
                  </label>
                  <textarea
                    rows={3}
                    value={reviewMessages[doctor._id] || ""}
                    onChange={(e) =>
                      handleReviewMessageChange(doctor._id, e.target.value)
                    }
                    placeholder="Write approval or rejection note..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(doctor._id)}
                      disabled={actionLoadingId === doctor._id}
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {actionLoadingId === doctor._id ? "Processing..." : "Approve"}
                    </button>

                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={actionLoadingId === doctor._id}
                      className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                    >
                      {actionLoadingId === doctor._id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Admin Message
                </label>
                <textarea
                  rows={3}
                  value={adminMessages[doctor._id] || ""}
                  onChange={(e) => handleMessageChange(doctor._id, e.target.value)}
                  placeholder="Optional status note..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Account
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold ${doctor.isActive === false
                        ? "text-rose-600"
                        : "text-emerald-600"
                      }`}
                  >
                    {doctor.isActive === false ? "Inactive" : "Active"}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleActive(doctor._id)}
                  disabled={actionLoadingId === doctor._id}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${doctor.isActive === false
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {actionLoadingId === doctor._id
                    ? "Updating..."
                    : doctor.isActive === false
                      ? "Activate"
                      : "Deactivate"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 lg:col-span-2 xl:col-span-3">
            No doctors matched your search.
          </div>
        )}
      </section>
    </div>
  );
}

export default ManageDoctorsPage;