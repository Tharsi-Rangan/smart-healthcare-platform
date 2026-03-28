function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of platform users, doctors, and approvals.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Total Users</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">124</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Pending Doctors</h2>
          <p className="mt-3 text-3xl font-bold text-amber-500">07</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Approved Doctors</h2>
          <p className="mt-3 text-3xl font-bold text-emerald-500">19</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">System Summary</h2>
        <p className="mt-2 text-sm text-slate-500">
          Platform management data will appear here.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;