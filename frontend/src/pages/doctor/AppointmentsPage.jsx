import { useMemo, useState } from "react";

const mockAppointments = [
  {
    id: "APT-1001",
    patientName: "Nimal Perera",
    date: "2026-03-30",
    time: "09:30 AM",
    type: "Video Consultation",
    reason: "Chest pain follow-up",
    status: "Confirmed",
  },
  {
    id: "APT-1002",
    patientName: "Kasuni Silva",
    date: "2026-03-30",
    time: "11:00 AM",
    type: "In-Person",
    reason: "Routine checkup",
    status: "Pending",
  },
  {
    id: "APT-1003",
    patientName: "Ahamed Rizwan",
    date: "2026-03-31",
    time: "02:15 PM",
    type: "Video Consultation",
    reason: "Blood pressure review",
    status: "Completed",
  },
  {
    id: "APT-1004",
    patientName: "Shalini Fernando",
    date: "2026-03-31",
    time: "04:00 PM",
    type: "Video Consultation",
    reason: "ECG discussion",
    status: "Cancelled",
  },
];

const statusClasses = {
  Confirmed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Completed: "bg-cyan-100 text-cyan-700",
  Cancelled: "bg-red-100 text-red-700",
};

function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter((appointment) => {
      const matchesSearch =
        appointment.patientName.toLowerCase().includes(search.toLowerCase()) ||
        appointment.reason.toLowerCase().includes(search.toLowerCase()) ||
        appointment.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View upcoming, pending, completed, and cancelled appointments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Today&apos;s Appointments</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">2</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Requests</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">1</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed This Week</p>
          <p className="mt-2 text-3xl font-bold text-cyan-700">5</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search patient, reason, or appointment ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div className="flex items-center justify-end text-sm text-slate-500">
            Showing {filteredAppointments.length} appointment(s)
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-800">
                      {appointment.patientName}
                    </h2>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[appointment.status]
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Appointment ID: {appointment.id}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-slate-800">Date:</span>{" "}
                      {appointment.date}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Time:</span>{" "}
                      {appointment.time}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Type:</span>{" "}
                      {appointment.type}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">Reason:</span>{" "}
                      {appointment.reason}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    View Details
                  </button>
                  <button className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600">
                    Open Consultation
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            No appointments found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsPage;