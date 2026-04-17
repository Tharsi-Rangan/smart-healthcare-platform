import { useEffect, useMemo, useState } from "react";
import { getAllUsers, updateUserStatus } from "../../api/adminUserApi";
import { Users, Shield, Clock } from "lucide-react";

function ManagePatientsPage() {
  const [patients, setPatients] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      setError("");
      const response = await getAllUsers();
      // Filter only patients
      const allUsers = response.data?.users || [];
      const patientsOnly = allUsers.filter((user) => user.role === "patient");
      setPatients(patientsOnly);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return patients
      .filter((patient) => {
        const matchesSearch =
          !keyword ||
          patient.name?.toLowerCase().includes(keyword) ||
          patient.email?.toLowerCase().includes(keyword) ||
          patient.phone?.toLowerCase().includes(keyword);
        const matchesStatus = !statusFilter || patient.accountStatus === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [patients, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: patients.length,
      active: patients.filter((p) => p.accountStatus === "active").length,
      suspended: patients.filter((p) => p.accountStatus === "suspended").length,
      pending: patients.filter((p) => p.accountStatus === "pending_verification").length,
    };
  }, [patients]);

  const handleStatusUpdate = async (patientId, nextStatus) => {
    try {
      setActionLoadingId(patientId);
      setMessage("");
      setError("");
      const response = await updateUserStatus(patientId, { accountStatus: nextStatus });
      setMessage(response.message || "Patient status updated");
      await loadPatients();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally {
      setActionLoadingId("");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      suspended: "bg-rose-50 text-rose-700 border-rose-200",
      pending_verification: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (initialLoading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-r from-cyan-600 to-sky-700 p-4 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Patient Administration
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              Manage Patients
            </h1>
            <p className="mt-2 max-w-2xl text-base text-cyan-50">
              View and manage all patient accounts, verify users, and control access.
            </p>
          </div>

          {message && (
            <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs text-cyan-100">{message}</p>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-slate-400" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Total Patients
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Active
              </p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-600">
                {stats.active}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Pending
              </p>
              <h3 className="mt-1 text-2xl font-bold text-amber-600">
                {stats.pending}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-rose-400" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Suspended
              </p>
              <h3 className="mt-1 text-2xl font-bold text-rose-600">
                {stats.suspended}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="grid gap-2 rounded-[32px] border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Search by Name, Email, or Phone
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g., John Doe or john@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending_verification">Pending Verification</option>
          </select>
        </div>
      </section>

      {/* Patients List */}
      <section className="space-y-3">
        {filteredPatients.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Header with Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-900">
                      {patient.name || "Patient"}
                    </h3>
                    <p className="truncate text-sm text-slate-500 mt-1">
                      {patient.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${getStatusColor(
                      patient.accountStatus
                    )}`}
                  >
                    {(patient.accountStatus || "pending").replace(/_/g, " ")}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4 pb-4 border-b border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Verified:</span>
                    <span className={`font-semibold ${patient.isEmailVerified ? "text-emerald-600" : "text-slate-600"}`}>
                      {patient.isEmailVerified ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-800">
                      {patient.phone || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joined:</span>
                    <span className="font-semibold text-slate-800">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      handleStatusUpdate(patient._id, "active")
                    }
                    disabled={actionLoadingId === patient._id}
                    className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                      patient.accountStatus === "active"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {actionLoadingId === patient._id ? "..." : "Active"}
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(patient._id, "pending_verification")
                    }
                    disabled={actionLoadingId === patient._id}
                    className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                      patient.accountStatus === "pending_verification"
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {actionLoadingId === patient._id ? "..." : "Pending"}
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(patient._id, "suspended")
                    }
                    disabled={actionLoadingId === patient._id}
                    className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                      patient.accountStatus === "suspended"
                        ? "bg-rose-600 text-white hover:bg-rose-700"
                        : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {actionLoadingId === patient._id ? "..." : "Suspend"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-900">No patients found</p>
            <p className="text-sm text-slate-500 mt-2">
              {search || statusFilter
                ? "Try adjusting your search or filters"
                : "No patients to display"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ManagePatientsPage;