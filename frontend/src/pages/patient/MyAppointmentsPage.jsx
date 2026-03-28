import { useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
} from "../../services/appointmentApi";

const mockAppointments = [
  {
    id: "a1",
    doctorName: "Dr. Sarah Khan",
    specialty: "Cardiology",
    appointmentDate: "2026-05-16",
    appointmentTime: "10:30",
    consultationType: "online",
    status: "pending",
  },
  {
    id: "a2",
    doctorName: "Dr. Imran Ahmed",
    specialty: "Dermatology",
    appointmentDate: "2026-05-19",
    appointmentTime: "12:00",
    consultationType: "offline",
    status: "confirmed",
  },
  {
    id: "a3",
    doctorName: "Dr. Nabila Rahman",
    specialty: "Pediatrics",
    appointmentDate: "2026-05-02",
    appointmentTime: "09:30",
    consultationType: "online",
    status: "completed",
  },
];

const statusBadgeClassMap = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
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
    appointmentDate: appointment.appointmentDate
      ? String(appointment.appointmentDate).slice(0, 10)
      : "",
    appointmentTime: appointment.appointmentTime || "",
    consultationType: appointment.consultationType || "online",
    status: appointment.status || "pending",
  };
};

function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isMockMode, setIsMockMode] = useState(false);
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

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getMyAppointments();
        const apiAppointments = Array.isArray(response?.data) ? response.data : [];

        setAppointments(apiAppointments.map(normalizeAppointment));
        setIsMockMode(false);
      } catch (error) {
        setAppointments(mockAppointments);
        setIsMockMode(true);
        setErrorMessage(
          error?.response?.data?.message ||
            "Unable to load live appointments. Showing sample data for now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    setActionLoadingId(appointmentId);
    setErrorMessage("");

    if (isMockMode) {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: "cancelled",
              }
            : appointment
        )
      );
      setActionLoadingId("");
      return;
    }

    try {
      await cancelAppointment(appointmentId);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Could not cancel on server. Updated locally for testing."
      );
    } finally {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: "cancelled",
              }
            : appointment
        )
      );
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

  const handleRescheduleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!rescheduleForm.appointmentDate || !rescheduleForm.appointmentTime) {
      setErrorMessage("Please provide both date and time for rescheduling.");
      return;
    }

    setActionLoadingId(rescheduleForm.appointmentId);

    if (isMockMode) {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === rescheduleForm.appointmentId
            ? {
                ...appointment,
                appointmentDate: rescheduleForm.appointmentDate,
                appointmentTime: rescheduleForm.appointmentTime,
                status: appointment.status === "cancelled" ? "cancelled" : "pending",
              }
            : appointment
        )
      );
      setActionLoadingId("");
      setRescheduleForm({
        appointmentId: "",
        appointmentDate: "",
        appointmentTime: "",
      });
      return;
    }

    try {
      await rescheduleAppointment(rescheduleForm.appointmentId, {
        appointmentDate: rescheduleForm.appointmentDate,
        appointmentTime: rescheduleForm.appointmentTime,
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Could not reschedule on server. Updated locally for testing."
      );
    } finally {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === rescheduleForm.appointmentId
            ? {
                ...appointment,
                appointmentDate: rescheduleForm.appointmentDate,
                appointmentTime: rescheduleForm.appointmentTime,
                status: appointment.status === "cancelled" ? "cancelled" : "pending",
              }
            : appointment
        )
      );
      setActionLoadingId("");
      setRescheduleForm({
        appointmentId: "",
        appointmentDate: "",
        appointmentTime: "",
      });
    }
  };

  const closeRescheduleForm = () => {
    setRescheduleForm({
      appointmentId: "",
      appointmentDate: "",
      appointmentTime: "",
    });
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading appointments...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track, cancel, and reschedule your upcoming consultations.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      {sortedAppointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No appointments found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => {
            const isCancelled = appointment.status === "cancelled";
            const isCompleted = appointment.status === "completed";
            const isActionDisabled = isCancelled || isCompleted;
            const isActionLoading = actionLoadingId === appointment.id;
            const badgeClass = statusBadgeClassMap[appointment.status] || "bg-slate-100 text-slate-700";

            return (
              <div
                key={appointment.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="text-lg font-semibold text-slate-800">{appointment.doctorName}</p>
                    <p>
                      <span className="font-medium text-slate-700">Specialty:</span>{" "}
                      {appointment.specialty}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Date:</span>{" "}
                      {appointment.appointmentDate}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Time:</span>{" "}
                      {appointment.appointmentTime}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Type:</span>{" "}
                      {appointment.consultationType}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeClass}`}>
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
