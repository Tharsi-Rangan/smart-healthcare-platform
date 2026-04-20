import { useState, useEffect, useCallback } from "react";
import {
  getAllAppointmentsAdmin,
  getAppointmentStats,
} from "../../services/appointmentApi";

const statusStyle = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getAppointmentStats();
      setStats(res?.data?.stats);
    } catch {
      setStats(null);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (activeFilter !== "All")
        params.status = activeFilter.toLowerCase();
      const res = await getAllAppointmentsAdmin(params);
      
      // Handle multiple response structures
      const appointments = res?.data?.appointments || res?.appointments || [];
      const pagination = res?.data?.pagination || res?.pagination || {};
      
      console.log("Appointments Response:", res);
      console.log("Fetched appointments:", appointments);
      
      setAppointments(appointments);
      setPagination(pagination);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filtered = appointments.filter(
    (a) =>
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(d).slice(0, 10);
    }
  };

  const openDetails = (appt) => {
    setSelectedAppt(appt);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppt(null);
  };

  const STAT_CARDS = [
    {
      label: "Total",
      value: stats?.total ?? "—",
      color: "text-slate-800",
      bg: "bg-slate-50",
      icon: "📊",
    },
    {
      label: "Pending",
      value: stats?.pending ?? "—",
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: "⏳",
    },
    {
      label: "Confirmed",
      value: stats?.confirmed ?? "—",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: "✓",
    },
    {
      label: "Completed",
      value: stats?.completed ?? "—",
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: "✔",
    },
    {
      label: "Cancelled",
      value: stats?.cancelled ?? "—",
      color: "text-red-500",
      bg: "bg-red-50",
      icon: "✕",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <section className="rounded-2xl border border-cyan-200 bg-linear-to-r from-cyan-600 to-sky-700 p-4 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Appointment Management
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">All Appointments</h1>
            <p className="mt-1 max-w-2xl text-sm text-cyan-50 md:text-base">
              Monitor and manage platform-wide appointments
            </p>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchAppointments();
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition"
            title="Refresh data"
          >
            ↻ Refresh
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border border-slate-200 ${s.bg} p-4 hover:shadow-md transition cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
              <span className="text-2xl opacity-50">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or doctor name..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition whitespace-nowrap ${
                activeFilter === f
                  ? "bg-cyan-600 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 sticky top-0">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Date & Time</span>
          <span>Type</span>
          <span>Status</span>
          <span>Fee</span>
          <span>Action</span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse grid grid-cols-7 gap-3 px-4 py-3"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <div key={j} className="h-4 bg-slate-100 rounded" />
                ))}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No appointments found
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((appt) => (
              <div
                key={appt._id}
                className="grid grid-cols-7 gap-3 items-center px-4 py-3 hover:bg-slate-50/50 transition border-l-4 border-l-cyan-500"
              >
                {/* Patient */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {appt.patientName || `Patient #${String(appt.patientId).substring(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {appt.patientDetails?.phone || "-"}
                  </p>
                </div>

                {/* Doctor */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {appt.doctorName || `Doctor #${String(appt.doctorId).substring(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {appt.specialty || "-"}
                  </p>
                </div>

                {/* Date & Time */}
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(appt.appointmentDate)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {appt.appointmentTime || "-"}
                  </p>
                </div>

                {/* Type */}
                <span className="flex items-center gap-1.5 text-sm">
                  {(appt.consultationType || appt.type) === "online" ? (
                    <>
                      <svg className="h-4 w-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <span className="text-cyan-600 font-medium">Online</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-purple-600 font-medium">Offline</span>
                    </>
                  )}
                </span>

                {/* Status Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[appt.status] || statusStyle.pending}`}>
                  {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1) || "Pending"}
                </span>

                {/* Fee */}
                <span className="text-sm font-semibold text-emerald-600">
                  Rs. {appt.consultationFee || 500}
                </span>

                {/* Action Button */}
                <button
                  onClick={() => openDetails(appt)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg text-xs font-medium transition whitespace-nowrap"
                  title="View details"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm font-medium text-slate-600">
            {page} / {pagination.pages || 1}
          </span>
          <button
            disabled={page >= (pagination.pages || 1)}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-slate-100 rounded-lg transition"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      ID: {selectedAppt._id?.substring(0, 12)}...
                    </p>
                  </div>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusStyle[selectedAppt.status]}`}>
                    {selectedAppt.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Patient Information</h3>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-lg font-semibold text-slate-800">
                          {selectedAppt.patientName || selectedAppt.patientDetails?.fullName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm text-slate-800">
                          {selectedAppt.patientDetails?.phone || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="text-sm text-slate-800">
                          {selectedAppt.patientDetails?.address || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Doctor Information</h3>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                      <div>
                        <p className="text-xs text-slate-500">Doctor</p>
                        <p className="text-lg font-semibold text-slate-800">
                          {selectedAppt.doctorName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Specialty</p>
                        <p className="text-sm text-slate-800">
                          {selectedAppt.specialty || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Consultation Fee</p>
                        <p className="text-lg font-semibold text-emerald-600">
                          Rs. {selectedAppt.consultationFee || 500}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Appointment Details</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-xs text-blue-600 mb-1">Date</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatDate(selectedAppt.appointmentDate)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-xs text-purple-600 mb-1">Time</p>
                    <p className="text-lg font-semibold text-purple-900">
                      {selectedAppt.appointmentTime || "-"}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-xs text-orange-600 mb-1">Type</p>
                    <p className="text-lg font-semibold text-orange-900 capitalize">
                      {selectedAppt.consultationType || "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {selectedAppt.reason && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Reason for Visit</h3>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {selectedAppt.reason}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t border-slate-200 pt-4 flex gap-4 text-xs text-slate-500">
                <div>
                  <span className="font-semibold">Created:</span> {new Date(selectedAppt.createdAt).toLocaleString()}
                </div>
                {selectedAppt.updatedAt !== selectedAppt.createdAt && (
                  <div>
                    <span className="font-semibold">Updated:</span> {new Date(selectedAppt.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-4 flex gap-2 justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition">
                  Edit Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAppointmentsPage;
