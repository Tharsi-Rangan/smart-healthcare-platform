import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { 
  getAllDoctors, 
  toggleDoctorActiveStatus, 
  getPendingDoctors,
  approveDoctor,
  rejectDoctor
} from "../../api/doctorApi";

function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState(""); // pending, approved, rejected, all
  const [statusFilter, setStatusFilter] = useState(""); // active, inactive, all
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [adminMessages, setAdminMessages] = useState({});
  const [reviewMessages, setReviewMessages] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    try {
      const [allResponse, pendingResponse] = await Promise.all([
        getAllDoctors(),
        getPendingDoctors()
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
      withHospital: pendingDoctors.filter((d) => d.hospital).length,
      withExperience: pendingDoctors.filter((d) => Number(d.experience) > 0).length,
    };
  }, [doctors, pendingDoctors]);

  const filteredDoctors = useMemo(() => {
    const value = search.toLowerCase();

    return doctors.filter((doctor) => {
      // Search filter
      const matchesSearch =
        doctor.doctorName?.toLowerCase().includes(value) ||
        doctor.specialization?.toLowerCase().includes(value) ||
        doctor.hospital?.toLowerCase().includes(value) ||
        doctor.licenseNumber?.toLowerCase().includes(value);

      // Approval status filter
      const matchesApprovalFilter =
        approvalFilter === "" ||
        (approvalFilter === "pending" && doctor.approvalStatus !== "approved" && doctor.approvalStatus !== "rejected") ||
        (approvalFilter === "approved" && doctor.approvalStatus === "approved") ||
        (approvalFilter === "rejected" && doctor.approvalStatus === "rejected");

      // Account status filter
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
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading doctors...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-600 to-sky-700 p-4 text-white shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Doctor Management
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              Manage Doctors
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-cyan-50 md:text-base">
              Verify doctor applications, manage approvals, and control doctor access.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <p className="text-xs text-cyan-100">Total Doctors</p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Doctors
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Approved
          </p>
          <h3 className="mt-2 text-2xl font-bold text-emerald-600">{stats.approved}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Pending Verification
          </p>
          <h3 className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Inactive
          </p>
          <h3 className="mt-2 text-2xl font-bold text-rose-600">{stats.inactive}</h3>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialization, hospital, or license..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Approval Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Approval Status</label>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">All Status</option>
                <option value="pending">Pending Verification</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Account Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Account Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">All Accounts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-slate-500 pt-2 border-t border-slate-100">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading doctors...
        </div>
      ) : filteredDoctors.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
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
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize whitespace-nowrap ${getStatusClasses(
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

                {doctor.adminReviewMessage && (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Admin Message
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {doctor.adminReviewMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Show approval/rejection buttons only for pending doctors */}
              {doctor.approvalStatus === "pending" && (
                <>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Admin Review Message
                    </label>
                    <textarea
                      rows="3"
                      value={reviewMessages[doctor._id] || ""}
                      onChange={(e) => handleReviewMessageChange(doctor._id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      placeholder="Optional review message for approval..."
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApprove(doctor._id)}
                      disabled={actionLoadingId === doctor._id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-70"
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={actionLoadingId === doctor._id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-70"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </>
              )}

              {/* Activate/Deactivate and Admin Note for approved doctors */}
              {doctor.approvalStatus === "approved" && (
                <>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Admin Note
                    </label>
                    <textarea
                      rows="2"
                      value={adminMessages[doctor._id] || ""}
                      onChange={(e) => handleMessageChange(doctor._id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      placeholder="Add a note for this doctor..."
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleToggleActive(doctor._id)}
                      disabled={actionLoadingId === doctor._id}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-70 ${
                        doctor.isActive === false
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                      }`}
                    >
                      {actionLoadingId === doctor._id
                        ? "Processing..."
                        : doctor.isActive === false
                        ? "Activate"
                        : "Deactivate"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">
            No doctors found
          </p>
          <p className="mt-2 text-slate-500">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default ManageDoctorsPage;