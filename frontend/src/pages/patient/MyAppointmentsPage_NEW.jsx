import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPatientAppointments,
  cancelAppointment,
} from "../../services/appointmentApi";

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const statusConfig = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setFilter] = useState("All");
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPatientAppointments();
      setAppointments(res?.data?.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancelling(id);
    try {
      await cancelAppointment(id, "Cancelled by patient");
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = appointments.filter((a) =>
    activeFilter === "All" ? true : a.status === activeFilter.toLowerCase()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-sm text-slate-500">
          Manage your upcoming and past appointments
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 h-24"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50">
            <svg
              className="h-7 w-7 text-cyan-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="font-medium text-slate-700">
            No {activeFilter.toLowerCase()} appointments
          </p>
          <button
            onClick={() => navigate("/patient/find-doctors")}
            className="mt-4 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition"
          >
            Find Doctors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((appt) => (
            <div
              key={appt._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Top row: Doctor Info + Status */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {appt.doctorName || `Doctor #${appt.doctorId?.substring(0, 8) || "N/A"}`}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {appt.specialty || appt.specialization || "Specialist"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize whitespace-nowrap ${
                    statusConfig[appt.status] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {appt.status || "unknown"}
                </span>
              </div>

              {/* Middle row: Appointment details */}
              <div className="mb-5 grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatDate(appt.appointmentDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{appt.appointmentTime || appt.timeSlot || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  {(appt.consultationType || appt.type) === "video" ? (
                    <>
                      <svg
                        className="h-4 w-4 text-slate-400"
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
                      <span>Video</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span>In-Person</span>
                    </>
                  )}
                </div>
              </div>

              {/* Reason */}
              {appt.reason && (
                <div className="mb-4 rounded-lg bg-cyan-50 px-3 py-2 border border-cyan-200">
                  <p className="text-xs text-slate-500">Reason</p>
                  <p className="text-sm text-slate-700">{appt.reason}</p>
                </div>
              )}

              {/* Bottom row: Payment + Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  {appt.paymentStatus === "paid" && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600">
                      ✓ Payment Completed
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {appt.status === "confirmed" && (
                    <>
                      {appt.paymentStatus === "pending" && (
                        <button
                          onClick={() =>
                            navigate("/patient/payments", {
                              state: { appointment: appt },
                            })
                          }
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          💳 Pay Now
                        </button>
                      )}
                      {(appt.consultationType || appt.type) === "video" && (
                        <button
                          onClick={() =>
                            navigate("/patient/consultation", {
                              state: { appointment: appt },
                            })
                          }
                          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition flex items-center gap-2"
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
                          Join Call
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(appt._id)}
                        disabled={cancelling === appt._id}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appt.status === "pending" && (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      disabled={cancelling === appt._id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointmentsPage;
