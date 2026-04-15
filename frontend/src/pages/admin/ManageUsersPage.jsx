import { useEffect, useMemo, useState } from "react";
import { getAllUsers, updateUserStatus } from "../../api/adminUserApi";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setFetching(true);
      setError("");

      const response = await getAllUsers();
      setUsers(response.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setInitialLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return [...users]
      .filter((user) => {
        const matchesSearch =
          !keyword ||
          user.name?.toLowerCase().includes(keyword) ||
          user.email?.toLowerCase().includes(keyword);

        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.accountStatus === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredUsers.length,
      patients: filteredUsers.filter((u) => u.role === "patient").length,
      doctors: filteredUsers.filter((u) => u.role === "doctor").length,
      admins: filteredUsers.filter((u) => u.role === "admin").length,
      active: filteredUsers.filter((u) => u.accountStatus === "active").length,
      suspended: filteredUsers.filter((u) => u.accountStatus === "suspended").length,
    };
  }, [filteredUsers]);

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

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "suspended":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  const getRoleBadge = (role) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return "bg-violet-50 text-violet-700 border border-violet-200";
      case "doctor":
        return "bg-cyan-50 text-cyan-700 border border-cyan-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  if (initialLoading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-base text-slate-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-gradient-to-r from-slate-950 via-sky-950 to-cyan-700 text-white shadow-sm">
        <div className="flex flex-col gap-8 px-8 py-9 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">
              User Management
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Manage Users
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-cyan-50 md:text-lg">
              Review all patient, doctor, and admin accounts from one workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white/10 px-6 py-5 backdrop-blur-sm">
              <p className="text-sm text-cyan-100">Visible Users</p>
              <p className="mt-2 text-4xl font-bold">{stats.total}</p>
            </div>

            <div className="rounded-[28px] bg-white/10 px-6 py-5 backdrop-blur-sm">
              <p className="text-sm text-cyan-100">Active Accounts</p>
              <p className="mt-2 text-4xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-medium text-emerald-700 shadow-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-600 shadow-sm">
          {error}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total
          </p>
          <h3 className="mt-4 text-3xl font-bold text-slate-900">{stats.total}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Patients
          </p>
          <h3 className="mt-4 text-3xl font-bold text-slate-900">{stats.patients}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Doctors
          </p>
          <h3 className="mt-4 text-3xl font-bold text-cyan-600">{stats.doctors}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Admins
          </p>
          <h3 className="mt-4 text-3xl font-bold text-violet-600">{stats.admins}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Active
          </p>
          <h3 className="mt-4 text-3xl font-bold text-emerald-600">{stats.active}</h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Suspended
          </p>
          <h3 className="mt-4 text-3xl font-bold text-rose-600">{stats.suspended}</h3>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">User Directory</h2>
            <p className="text-slate-500">
              Search users and narrow the list by role or account status.
            </p>
          </div>

          {fetching && (
            <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
              Refreshing...
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr,0.9fr,0.9fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="group rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 text-lg font-bold text-white shadow-sm">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold text-slate-900">
                      {user.name || "User"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                    user.accountStatus
                  )}`}
                >
                  {user.accountStatus
                    ? user.accountStatus.replace(/_/g, " ")
                    : "pending verification"}
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">Role</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">Email Verified</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {user.isEmailVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">Joined Date</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => handleStatusUpdate(user._id, "active")}
                  disabled={actionLoadingId === user._id}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {actionLoadingId === user._id ? "..." : "Activate"}
                </button>

                <button
                  onClick={() => handleStatusUpdate(user._id, "suspended")}
                  disabled={actionLoadingId === user._id}
                  className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {actionLoadingId === user._id ? "..." : "Suspend"}
                </button>

                <button
                  onClick={() =>
                    handleStatusUpdate(user._id, "pending_verification")
                  }
                  disabled={actionLoadingId === user._id}
                  className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {actionLoadingId === user._id ? "..." : "Pending"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 2xl:col-span-3">
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-white px-8 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                👥
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">
                No users found
              </h3>
              <p className="mx-auto mt-3 max-w-md text-slate-500">
                No matching users are available for the current search or filter settings.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ManageUsersPage;