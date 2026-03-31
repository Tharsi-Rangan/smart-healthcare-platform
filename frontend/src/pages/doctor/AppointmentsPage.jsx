import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hourglass,
  ListChecks,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentApi";

const statusBadgeClassMap = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatDateForUi = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue).slice(0, 10);
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeAppointment = (appointment) => {
  return {
    id: appointment._id || appointment.id,
    patientName:
      appointment.patientName ||
      appointment.patient?.name ||
      `Patient ${appointment.patientId || ""}`.trim(),
    specialty: appointment.specialty || "N/A",
    appointmentDate: formatDateForUi(appointment.appointmentDate),
    appointmentTime: appointment.appointmentTime || "",
    consultationType: appointment.consultationType || "online",
    status: appointment.status || "pending",
  };
};

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((first, second) => {
      const firstDateTime = `${first.appointmentDate} ${first.appointmentTime}`;
      const secondDateTime = `${second.appointmentDate} ${second.appointmentTime}`;
      return secondDateTime.localeCompare(firstDateTime);
    });
  }, [appointments]);

  const appointmentStats = useMemo(() => {
    return sortedAppointments.reduce(
      (stats, appointment) => {
        stats.total += 1;

        if (appointment.status === "pending") {
          stats.pending += 1;
        }

        if (appointment.status === "confirmed") {
          stats.confirmed += 1;
        }

        if (appointment.status === "completed") {
          stats.completed += 1;
        }

        return stats;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
      }
    );
  }, [sortedAppointments]);

  const loadAppointments = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getDoctorAppointments();
      const apiAppointments = Array.isArray(response?.data) ? response.data : [];
      setAppointments(apiAppointments.map(normalizeAppointment));
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to load doctor appointments."
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusUpdate = async (appointmentId, status) => {
    setActionLoadingId(appointmentId);
    setErrorMessage("");

    try {
      const response = await updateAppointmentStatus(appointmentId, { status });
      const updated = normalizeAppointment(response.data);

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? updated : appointment
        )
      );
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to update appointment status."
      );
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading doctor appointments...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Doctor Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review your assigned patients and update consultation progress.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAppointments}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50 via-white to-cyan-100/30 p-5 shadow-sm">
          <div className="mb-2 inline-flex rounded-lg bg-cyan-100 p-2 text-cyan-700">
            <ListChecks size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{appointmentStats.total}</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
          <div className="mb-2 inline-flex rounded-lg bg-amber-100 p-2 text-amber-700">
            <Hourglass size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{appointmentStats.pending}</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
          <div className="mb-2 inline-flex rounded-lg bg-blue-100 p-2 text-blue-700">
            <BadgeCheck size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Confirmed</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{appointmentStats.confirmed}</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
          <div className="mb-2 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{appointmentStats.completed}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-linear-to-r from-sky-700 to-cyan-600 p-5 text-white shadow-md">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <Sparkles size={18} />
          Today Focus
        </h2>
        <p className="mt-1 text-sm text-cyan-100">
          Confirm pending appointments early and mark completed consultations right after sessions.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      {sortedAppointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No appointments found for this doctor.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => {
            const badgeClass =
              statusBadgeClassMap[appointment.status] ||
              "bg-slate-100 text-slate-700";

            const isActionLoading = actionLoadingId === appointment.id;
            const isCancelled = appointment.status === "cancelled";
            const isCompleted = appointment.status === "completed";

            return (
              <div
                key={appointment.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="text-lg font-semibold text-slate-800">
                      {appointment.patientName}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Specialty:</span>{" "}
                      {appointment.specialty}
                    </p>
                    <p>
                      <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                        <CalendarDays size={14} />
                        Date:
                      </span>{" "}
                      {appointment.appointmentDate}
                    </p>
                    <p>
                      <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                        <Clock3 size={14} />
                        Time:
                      </span>{" "}
                      {appointment.appointmentTime}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Type:</span>{" "}
                      <span className="capitalize">{appointment.consultationType}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeClass}`}
                    >
                      {appointment.status}
                    </span>

                    {!isCancelled && !isCompleted && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "confirmed")
                          }
                          className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isActionLoading ? "Please wait..." : "Confirm"}
                        </button>

                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "completed")
                          }
                          className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isActionLoading ? "Please wait..." : "Complete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;