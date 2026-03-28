function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of appointments, consultations, and reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Today’s Appointments</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">08</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Pending Reports</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">04</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Issued Prescriptions</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">16</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Today’s Schedule</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your consultation schedule will appear here.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;