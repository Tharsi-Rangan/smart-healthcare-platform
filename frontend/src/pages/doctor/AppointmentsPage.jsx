import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDoctorAppointments,
  updateDoctorAppointmentStatus,
} from "../../api/doctorApi";
import { motion } from "framer-motion";

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const tabs = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const loadAppointments = useCallback(async () => {
    try {
      setError("");
      const response = await getDoctorAppointments();
      console.log("Doctor appointments response:", response);
      setAppointments(response?.data?.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, []);

  const appointmentStats = useMemo(() => {
    const stats = {
      total: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    appointments.forEach((item) => {
      const status = item.status?.toLowerCase();

      if (status === "pending") stats.pending += 1;
      if (status === "confirmed") stats.confirmed += 1;
      if (status === "completed") stats.completed += 1;
      if (status === "cancelled") stats.cancelled += 1;
    });

    return stats;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (activeTab === "All") return appointments;

    return appointments.filter(
      (item) => item.status?.toLowerCase() === activeTab.toLowerCase()
    );
  }, [appointments, activeTab]);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      setMessage("");
      setError("");

      const response = await updateDoctorAppointmentStatus(appointmentId, status);
      setMessage(response.message || "Appointment status updated");

      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update appointment");
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "confirmed":
        return "bg-cyan-50 text-cyan-700 border border-cyan-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderActions = (appointment) => {
    const status = appointment.status?.toLowerCase();

    if (status === "pending") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:from-cyan-700 hover:to-sky-800 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept
          </button>

          <button
            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      );
    }

    if (status === "confirmed") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate(appointment._id, "completed")}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete
          </button>

          <button
            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(
          appointment.status
        )}`}
      >
        {appointment.status || "unknown"}
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Header Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-700 to-sky-700 p-6 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-100">
              Appointment Management
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Manage Appointments
            </h1>
            <p className="mt-1 text-sm text-cyan-50">
              Review and manage patient bookings
            </p>
          </div>

          <div className="rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm border border-white/20 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-100">
              Total Appointments
            </p>
            <p className="mt-0.5 text-2xl font-bold">{appointmentStats.total}</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      {message && (
        <motion.div variants={itemVariants} className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-emerald-700">{message}</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div variants={itemVariants} className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">All</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{appointmentStats.total}</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pending</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600">{appointmentStats.pending}</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Confirmed</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-cyan-600">{appointmentStats.confirmed}</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Completed</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600">{appointmentStats.completed}</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Cancelled</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600">{appointmentStats.cancelled}</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Appointment Requests</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage and track patient appointments</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-md shadow-cyan-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className={`ml-1.5 text-xs ${
                  activeTab === tab ? "text-cyan-100" : "text-slate-400"
                }`}>
                  ({appointmentStats[tab.toLowerCase()] || 0})
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Appointment List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
              <p className="text-sm text-slate-500">Loading appointments...</p>
            </div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-sky-700 text-white shadow-md">
                          <span className="text-sm font-semibold">
                            {item.patientName?.[0]?.toUpperCase() || "P"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {item.patientName || `Patient #${item.patientId?.substring(0, 8) || "Unknown"}`}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {item.patientEmail || `ID: ${item.patientId?.substring(0, 8) || "Not provided"}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(
                        item.status
                      )}`}
                    >
                      {item.status || "unknown"}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Date
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{formatDate(item.appointmentDate)}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Time
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{item.appointmentTime || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Type
                      </p>
                      <p className="mt-1 text-sm font-medium capitalize text-slate-800">{item.consultationType || "-"}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment
                      </p>
                      <p className="mt-1 text-sm font-medium capitalize text-slate-800">{item.paymentStatus || "pending"}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  {item.reason && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.123 9.123 0 01-5.874-1.987c.326-.197.611-.435.851-.702.294-.326.54-.69.735-1.082A8.23 8.23 0 0112 21.75c4.556 0 8.25-3.694 8.25-8.25S16.556 5.25 12 5.25 3.75 8.944 3.75 13.5c0 1.129.23 2.204.647 3.18a8.99 8.99 0 01-.731 1.082 9.85 9.85 0 01-.851.702A10.12 10.12 0 011.5 13.5c0-5.799 4.701-10.5 10.5-10.5S22.5 7.701 22.5 13.5z" />
                        </svg>
                        Reason for Visit
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:min-w-[160px]">
                  {renderActions(item)}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-12 text-center shadow-sm">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-4 text-base font-semibold text-slate-800">No appointments found</p>
              <p className="mt-1 text-sm text-slate-500">
                There are no appointment requests in the selected filter.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default AppointmentsPage;