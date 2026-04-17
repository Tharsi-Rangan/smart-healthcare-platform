import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
} from "../../services/appointmentApi";

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const statusConfig = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setFilter] = useState("All");
  const [actionId, setActionId] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDoctorAppointments();
      setAppointments(res?.data?.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const msg = (type, text) => {
    if (type === "ok") {
      setSuccess(text);
      setError("");
    } else {
      setError(text);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  const handleConfirm = async (id) => {
    setActionId(id + "confirm");
    try {
      await confirmAppointment(id);
      msg("ok", "Appointment confirmed.");
      load();
    } catch (err) {
      msg("err", err.response?.data?.message || "Failed to confirm.");
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm("Decline this appointment?")) return;
    setActionId(id + "cancel");
    try {
      await cancelAppointment(id, "Declined by doctor");
      msg("ok", "Appointment declined.");
      load();
    } catch (err) {
      msg("err", err.response?.data?.message || "Failed to decline.");
    } finally {
      setActionId(null);
    }
  };

  const handleComplete = async (id) => {
    setActionId(id + "complete");
    try {
      await completeAppointment(id, "Consultation completed.");
      msg("ok", "Marked as completed.");
      load();
    } catch (err) {
      msg("err", err.response?.data?.message || "Failed.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = appointments.filter((a) =>
    activeFilter === "All" ? true : a.status === activeFilter.toLowerCase()
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Appointment Requests</h1>
        <p className="text-sm text-slate-500">
          Review and manage patient appointment requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-cyan-600", bg: "bg-cyan-50" },
          {
            label: "Pending",
            value: stats.pending,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "text-blue-600",
            bg: "bg-sky-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border border-slate-200 ${s.bg} p-4`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>
              {loading ? "..." : s.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeFilter === f
                ? "bg-cyan-600 text-white"
                : "border border-cyan-200 bg-white text-cyan-600 hover:bg-cyan-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-36 rounded-2xl border bg-white"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="font-medium text-slate-700">
            No {activeFilter.toLowerCase()} appointments
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div
              key={appt._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                    {appt.patientName?.charAt(0) || "P"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {appt.patientName || `Patient #${appt.patientId?.substring(0, 8) || "N/A"}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {appt.patientEmail || appt.patientId || "N/A"}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    statusConfig[appt.status] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {appt.status || "unknown"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                <span>
                  📅{" "}
                  {new Date(appt.appointmentDate).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>🕐 {appt.appointmentTime || appt.timeSlot || "-"}</span>
                <span className="capitalize">
                  📱 {appt.consultationType || appt.type || "-"}
                </span>
              </div>

              <div className="rounded-xl bg-cyan-50 px-3 py-2 mb-3 border border-cyan-200">
                <p className="text-xs text-slate-400">Reason</p>
                <p className="text-sm text-slate-700">
                  {appt.reason || "No reason provided"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                {appt.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleConfirm(appt._id)}
                      disabled={!!actionId}
                      className="flex items-center gap-1 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {actionId === appt._id + "confirm"
                        ? "Confirming..."
                        : "Accept"}
                    </button>
                    <button
                      onClick={() => handleDecline(appt._id)}
                      disabled={!!actionId}
                      className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      {actionId === appt._id + "cancel" ? "Declining..." : "Decline"}
                    </button>
                  </>
                )}

                {appt.status === "confirmed" && (
                  <>
                    {(appt.consultationType || appt.type) === "video" && (
                      <button
                        onClick={() => navigate("/doctor/video")}
                        className="flex items-center gap-1 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Start Consultation
                      </button>
                    )}
                    <button
                      onClick={() => handleComplete(appt._id)}
                      disabled={!!actionId}
                      className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-600 hover:bg-cyan-100 disabled:opacity-60"
                    >
                      {actionId === appt._id + "complete" ? "..." : "Mark Complete"}
                    </button>
                    <button
                      onClick={() => handleDecline(appt._id)}
                      disabled={!!actionId}
                      className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentsPage;
