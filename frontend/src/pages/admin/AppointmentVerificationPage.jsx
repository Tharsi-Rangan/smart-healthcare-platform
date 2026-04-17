import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  CheckCircle,
  Clock3,
  AlertCircle,
  FileText,
} from "lucide-react";
import apiClient from "../../services/apiClient";

function AppointmentVerificationPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await apiClient.get("/api/appointments/admin/pending");
      setAppointments(response.data?.data?.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      setConfirming(appointmentId);
      setMessage("");
      setError("");

      const response = await apiClient.put(
        `/api/appointments/${appointmentId}/confirm`,
        { confirmedByAdmin: true },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage(response.data?.message || "Appointment confirmed successfully");
      await fetchPendingAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm appointment");
    } finally {
      setConfirming(null);
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to reject this appointment? This action cannot be undone.")) {
      return;
    }

    try {
      setConfirming(appointmentId);
      setMessage("");
      setError("");

      const response = await apiClient.put(
        `/api/appointments/${appointmentId}/status`,
        { status: "cancelled" },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage(response.data?.message || "Appointment rejected successfully");
      await fetchPendingAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject appointment");
    } finally {
      setConfirming(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4 pb-5">
      {/* Header */}
      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-600 to-sky-700 p-4 text-white shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-cyan-100">
            Appointment Verification
          </p>
          <h1 className="text-xl font-bold md:text-2xl">
            Verify Paid Appointments
          </h1>
          <p className="mt-1 text-sm text-cyan-50">
            Review appointments with completed payments and confirm them for consultation.
          </p>
        </div>
      </section>

      {/* Alerts */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-gradient-to-r from-cyan-50 to-sky-50 animate-pulse"
            />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
          <p className="font-semibold text-slate-800">All set!</p>
          <p className="text-sm text-slate-500 mt-1">
            No pending appointments to verify right now.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_200px]">
                {/* Appointment & Patient Info */}
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {apt.patientDetails?.fullName || `Patient #${apt.patientId?.substring(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-500">{apt.patientDetails?.phone}</p>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Appointment ID:</span> {apt._id}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Specialty:</span> {apt.specialty}
                  </p>
                </div>

                {/* Date & Time Info */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(apt.appointmentDate)}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Clock3 className="h-4 w-4" />
                    {apt.appointmentTime}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                      ✓ Payment Verified
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 md:justify-start md:pt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirmAppointment(apt._id)}
                    disabled={confirming === apt._id}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {confirming === apt._id ? "Confirming..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectAppointment(apt._id)}
                    disabled={confirming === apt._id}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 transition hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Additional Details */}
              {apt.reason && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-600 mb-1">Reason:</p>
                  <p className="text-xs text-slate-600">{apt.reason}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentVerificationPage;
