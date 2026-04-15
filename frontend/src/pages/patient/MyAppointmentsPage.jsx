import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hourglass,
  ListChecks,
  Plus,
  Search,
} from "lucide-react";
import {
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
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
  const appointmentId = appointment.id || appointment._id;

  return {
    id: appointmentId,
    doctorName:
      appointment.doctorName ||
      appointment.doctor?.name ||
      `Doctor ${appointment.doctorId || ""}`.trim(),
    specialty: appointment.specialty || appointment.doctor?.specialization || "N/A",
    appointmentDate: formatDateForUi(appointment.appointmentDate),
    appointmentTime: appointment.appointmentTime || "",
    consultationType: appointment.consultationType || "online",
    status: appointment.status || "pending",
  };
};

function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentId: "",
    appointmentDate: "",
    appointmentTime: "",
  });

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
      const response = await getMyAppointments();
      const apiAppointments = Array.isArray(response?.data) ? response.data : [];
      setAppointments(apiAppointments.map(normalizeAppointment));
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to load appointments right now."
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    setActionLoadingId(appointmentId);
    setErrorMessage("");

    try {
      const response = await cancelAppointment(appointmentId);
      const updated = normalizeAppointment(response.data);

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? updated : appointment
        )
      );
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not cancel appointment."
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const openRescheduleForm = (appointment) => {
    setRescheduleForm({
      appointmentId: appointment.id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
    });
  };

  const closeRescheduleForm = () => {
    setRescheduleForm({
      appointmentId: "",
      appointmentDate: "",
      appointmentTime: "",
    });
  };

  const handleRescheduleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!rescheduleForm.appointmentDate || !rescheduleForm.appointmentTime) {
      setErrorMessage("Please provide both date and time for rescheduling.");
      return;
    }

    setActionLoadingId(rescheduleForm.appointmentId);

    try {
      const response = await rescheduleAppointment(rescheduleForm.appointmentId, {
        appointmentDate: rescheduleForm.appointmentDate,
        appointmentTime: rescheduleForm.appointmentTime,
      });

      const updated = normalizeAppointment(response.data);

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === rescheduleForm.appointmentId ? updated : appointment
        )
      );

      closeRescheduleForm();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Could not reschedule appointment."
      );
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading appointments...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track, cancel, and reschedule your consultations with live status updates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/doctors"
            className="rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
          >
            <span className="inline-flex items-center gap-2">
              <Search size={16} />
              Find Doctors
            </span>
          </Link>
          <Link
            to="/book-appointment"
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Book New
            </span>
          </Link>
        </div>
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

      {errorMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      {sortedAppointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <p>No appointments found yet.</p>
          <Link
            to="/doctors"
            className="mt-4 inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Book Your First Appointment
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => {
            const isCancelled = appointment.status === "cancelled";
            const isCompleted = appointment.status === "completed";
            const isActionDisabled = isCancelled || isCompleted;
            const isActionLoading = actionLoadingId === appointment.id;
            const badgeClass =
              statusBadgeClassMap[appointment.status] ||
              "bg-slate-100 text-slate-700";

            return (
              <div
                key={appointment.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="text-lg font-semibold text-slate-800">
                      {appointment.doctorName}
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

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={isActionDisabled || isActionLoading}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isActionLoading ? "Please wait..." : "Cancel"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openRescheduleForm(appointment)}
                        disabled={isActionDisabled || isActionLoading}
                        className="rounded-lg border border-cyan-200 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>

                {rescheduleForm.appointmentId === appointment.id && (
                  <form
                    onSubmit={handleRescheduleSubmit}
                    className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto_auto]"
                  >
                    <input
                      type="date"
                      value={rescheduleForm.appointmentDate}
                      onChange={(event) =>
                        setRescheduleForm((prev) => ({
                          ...prev,
                          appointmentDate: event.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                    />

                    <input
                      type="time"
                      value={rescheduleForm.appointmentTime}
                      onChange={(event) =>
                        setRescheduleForm((prev) => ({
                          ...prev,
                          appointmentTime: event.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                    />

                    <button
                      type="submit"
                      disabled={isActionLoading}
                      className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={closeRescheduleForm}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    >
                      Close
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAppointmentsPage;