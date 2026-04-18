import { useEffect, useMemo, useState } from "react";
import { getAllUsers, updateUserStatus } from "../../api/adminUserApi";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllUsers({
        search,
        role: roleFilter,
        status: statusFilter,
      });

      setUsers(response.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      patients: users.filter((u) => u.role === "patient").length,
      doctors: users.filter((u) => u.role === "doctor").length,
      admins: users.filter((u) => u.role === "admin").length,
      active: users.filter((u) => u.accountStatus === "active").length,
      suspended: users.filter((u) => u.accountStatus === "suspended").length,
    };
  }, [users]);

  const handleStatusUpdate = async (userId, nextStatus) => {
    try {
      setActionLoadingId(userId);
      setMessage("");
      setError("");

      const response = await updateUserStatus(userId, {
        accountStatus: nextStatus,
      });

      setMessage(response.message || "User status updated successfully");
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoadingId("");
    }
  };

  const getStatusClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";
      case "suspended":
        return "border border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  const getRoleClasses = (role) => {
    switch ((role || "").toLowerCase()) {
      case "doctor":
        return "border border-cyan-200 bg-cyan-50 text-cyan-700";
      case "admin":
        return "border border-violet-200 bg-violet-50 text-violet-700";
      default:
        return "border border-slate-200 bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-base text-slate-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              User Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage Users
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">
              Review all patient, doctor, and admin accounts and manage their
              access state from one workspace.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Visible Users
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{stats.total}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Patients
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{stats.patients}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Doctors
          </p>
          <h3 className="mt-3 text-3xl font-bold text-cyan-700">{stats.doctors}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admins
          </p>
          <h3 className="mt-3 text-3xl font-bold text-violet-600">{stats.admins}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Active
          </p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">{stats.active}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Suspended
          </p>
          <h3 className="mt-3 text-3xl font-bold text-rose-600">{stats.suspended}</h3>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">User Directory</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search users and narrow the list by role or account status.
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
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value="">All Roles</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
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
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-slate-900">
                    {user.name || "User"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleClasses(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                      user.accountStatus
                    )}`}
                  >
                    {user.accountStatus?.replace("_", " ")}
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleStatusUpdate(
                      user._id,
                      user.accountStatus === "suspended" ? "active" : "suspended"
                    )
                  }
                  disabled={actionLoadingId === user._id}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${user.accountStatus === "suspended"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {actionLoadingId === user._id
                    ? "Updating..."
                    : user.accountStatus === "suspended"
                      ? "Activate"
                      : "Suspend"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 lg:col-span-2 xl:col-span-3">
            No users found for the selected filters.
          </div>
        )}
      </section>
    </div>
  );
}

export default ManageUsersPage;