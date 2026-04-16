import { useEffect, useMemo, useState } from "react";
import {
  getDoctorAppointments,
  updateDoctorAppointmentStatus,
} from "../../api/doctorApi";

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const tabs = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const loadAppointments = async () => {
    try {
      setError("");
      const response = await getDoctorAppointments();
      setAppointments(response.data?.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

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
    return date.toLocaleDateString();
  };

  const renderActions = (appointment) => {
    const status = appointment.status?.toLowerCase();

    if (status === "pending") {
      return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button
            onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
            className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Accept Request
          </button>

          <button
            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
            className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            Reject Request
          </button>
        </div>
      );
    }

    if (status === "confirmed") {
      return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button
            onClick={() => handleStatusUpdate(appointment._id, "completed")}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Mark Completed
          </button>

          <button
            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Cancel Appointment
          </button>
        </div>
      );
    }

    return (
      <div
        className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusBadgeClasses(
          appointment.status
        )}`}
      >
        {appointment.status || "unknown"}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-4xl border border-slate-200 bg-linear-to-r from-cyan-600 to-sky-700 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">
              Doctor Appointment Workflow
            </p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              Manage Appointments
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-cyan-50">
              Review appointment requests, accept or reject bookings, and update
              consultation progress.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Total Requests</p>
            <p className="mt-2 text-3xl font-bold">{appointmentStats.total}</p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-base text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-base text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            All
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {appointmentStats.total}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Pending
          </p>
          <h3 className="mt-3 text-3xl font-bold text-amber-600">
            {appointmentStats.pending}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Confirmed
          </p>
          <h3 className="mt-3 text-3xl font-bold text-cyan-600">
            {appointmentStats.confirmed}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Completed
          </p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {appointmentStats.completed}
          </h3>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Cancelled
          </p>
          <h3 className="mt-3 text-3xl font-bold text-rose-600">
            {appointmentStats.cancelled}
          </h3>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Appointment Requests
          </h2>
          <p className="text-slate-500">
            Filter patient bookings by their current status.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${activeTab === tab
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Appointment List */}
      <section className="space-y-6">
        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 text-base text-slate-500 shadow-sm">
            Loading appointments...
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((item) => (
            <div
              key={item._id}
              className="rounded-4xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="grid gap-6 xl:grid-cols-[1fr,240px]">
                <div>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {item.patientName || `Patient #${item.patientId?.substring(0, 8) || "Unknown"}`}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {item.patientEmail || `ID: ${item.patientId || "Not provided"}`}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(
                        item.status
                      )}`}
                    >
                      {item.status || "unknown"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Date
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {formatDate(item.appointmentDate)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Time
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {item.appointmentTime || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Type
                      </p>
                      <p className="mt-1 font-medium capitalize text-slate-900">
                        {item.consultationType || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Payment Status
                      </p>
                      <p className="mt-1 font-medium capitalize text-slate-900">
                        {item.paymentStatus || "pending"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Current Status
                      </p>
                      <p className="mt-1 font-medium capitalize text-slate-900">
                        {item.status || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 px-5 py-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Reason
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.reason || "No reason provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start xl:justify-end">
                  <div className="w-full xl:w-55">{renderActions(item)}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">
              No appointments found
            </p>
            <p className="mt-2 text-slate-500">
              There are no appointment requests in the selected filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default AppointmentsPage;
