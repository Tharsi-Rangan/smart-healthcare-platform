import { useCallback, useEffect, useMemo, useState } from "react";
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

  const loadAppointments = useCallback(async () => {
    try {
      setError("");
      const response = await getDoctorAppointments();
      setAppointments(response?.data?.appointments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

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
      setError(err?.response?.data?.message || "Failed to update appointment");
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "border border-amber-200 bg-amber-50 text-amber-700";
      case "confirmed":
        return "border border-cyan-200 bg-cyan-50 text-cyan-700";
      case "completed":
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";
      case "cancelled":
        return "border border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border border-slate-200 bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderActions = (appointment) => {
    const status = appointment.status?.toLowerCase();

    if (status === "pending") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
            className="rounded-xl bg-cyan-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-800"
          >
            Accept
          </button>

          <button
            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            Reject
          </button>
        </div>
      );
    }

    if (status === "confirmed") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusUpdate(appointment._id, "completed")}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            Complete
          </button>

          <button
            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(
          appointment.status
        )}`}
      >
        {appointment.status || "unknown"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Appointment Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Appointments
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Review consultation requests and keep appointment updates organized.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Appointments
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {appointmentStats.total}
            </p>
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

      <section className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">All</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{appointmentStats.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pending</p>
          <p className="mt-3 text-3xl font-bold text-amber-600">{appointmentStats.pending}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Confirmed</p>
          <p className="mt-3 text-3xl font-bold text-cyan-700">{appointmentStats.confirmed}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completed</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{appointmentStats.completed}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cancelled</p>
          <p className="mt-3 text-3xl font-bold text-rose-600">{appointmentStats.cancelled}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab
                  ? "bg-cyan-700 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading appointments...
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.patientName ||
                          `Patient #${item.patientId?.substring(0, 8) || "Unknown"}`}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.patientEmail ||
                          `ID: ${item.patientId?.substring(0, 8) || "Not provided"}`}
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

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <p className="text-xs font-medium text-slate-400">Date</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(item.appointmentDate)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <p className="text-xs font-medium text-slate-400">Time</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {item.appointmentTime || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <p className="text-xs font-medium text-slate-400">Type</p>
                      <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                        {item.consultationType || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <p className="text-xs font-medium text-slate-400">Payment</p>
                      <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                        {item.paymentStatus || "pending"}
                      </p>
                    </div>
                  </div>

                  {item.reason && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-medium text-slate-400">Reason</p>
                      <p className="mt-1 text-sm text-slate-700">{item.reason}</p>
                    </div>
                  )}
                </div>

                <div className="lg:min-w-[170px]">{renderActions(item)}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-800">No appointments found</p>
            <p className="mt-1 text-sm text-slate-500">
              There are no appointments in the selected filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default AppointmentsPage;