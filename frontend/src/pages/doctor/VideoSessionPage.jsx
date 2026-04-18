import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorAppointments,
  getMyAppointments,
  completeAppointment,
} from "../../services/appointmentApi";
import {
  startConsultation,
  endConsultation,
  createPrescription,
} from "../../services/consultationApi";
import { getToken } from "../../features/auth/authStorage";
import { useAuth } from "../../features/auth/AuthContext";
import axios from "axios";

const emptyRx = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  notes: "",
});

function VideoSessionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActive] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [sessionTime, setTimer] = useState(0);
  const [showRxForm, setRxForm] = useState(false);
  const [submittingRx, setSubmitRx] = useState(false);
  const [rx, setRx] = useState({
    diagnosis: "",
    notes: "",
    medications: [emptyRx()],
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();

      let appointments = [];
      try {
        const res = await getDoctorAppointments(token);
        const appointmentList =
          res?.data?.appointments || res?.appointments || (Array.isArray(res) ? res : []);
        appointments = Array.isArray(appointmentList) ? appointmentList : [];
      } catch {
        const res = await getMyAppointments(token);
        const appointmentList =
          res?.data?.appointments || res?.appointments || (Array.isArray(res) ? res : []);
        appointments = Array.isArray(appointmentList) ? appointmentList : [];
      }

      const onlineAppointments = appointments.filter(
        (a) => a.consultationType === "online"
      );

      setAppointments(onlineAppointments);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const isAppointmentDateToday = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);

    return today.getTime() === apptDate.getTime();
  };

  const isWithinSessionWindow = (appointmentDate, appointmentTime) => {
    const now = new Date();
    const [hours, minutes] = appointmentTime.split(":").map(Number);

    const apptDateTime = new Date(appointmentDate);
    apptDateTime.setHours(hours, minutes, 0, 0);

    const windowStart = new Date(apptDateTime.getTime() - 30 * 60000);
    const windowEnd = new Date(apptDateTime.getTime() + 2 * 60 * 60000);

    return now >= windowStart && now <= windowEnd;
  };

  const notifyPatientSessionStarted = async (
    appointmentId,
    patientId,
    doctorName,
    appointmentTime
  ) => {
    try {
      const token = getToken();
      const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/notifications`;

      await axios.post(
        `${API_URL}/consultation-started`,
        {
          patientId,
          doctorName,
          appointmentId,
          appointmentTime,
          message: `Dr. ${doctorName} has started the video consultation. Please join now.`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch {
      // ignore notification failure
    }
  };

  const startSession = async (appt) => {
    try {
      if (appt.status !== "confirmed") {
        alert(
          `⏳ This appointment has not been confirmed by the administrator yet.\n\nStatus: ${appt.status}\n\nYou'll be notified once it's confirmed.`
        );
        return;
      }

      try {
        const token = getToken();
        const paymentResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payments/status/${appt._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const payment = paymentResponse.data?.data || paymentResponse.data;

        if (!payment || payment.status !== "completed") {
          alert(
            "⚠️ Patient payment is not yet completed. They will need to complete payment before you can start the session."
          );
          return;
        }

        if (payment.adminStatus !== "approved") {
          const message =
            payment.adminStatus === "rejected"
              ? "⚠️ The patient's payment was rejected by admin. They will need to make another payment."
              : "⏳ The patient's payment is awaiting admin approval. Once approved, you can start the session.";
          alert(message);
          return;
        }
      } catch {
        alert("Could not verify payment status. Please try again.");
        return;
      }

      if (!isAppointmentDateToday(appt.appointmentDate)) {
        const apptDate = new Date(appt.appointmentDate).toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );
        alert(
          `❌ This appointment is scheduled for ${apptDate}.\n\nYou can only start the session on the appointment date.`
        );
        return;
      }

      if (!isWithinSessionWindow(appt.appointmentDate, appt.appointmentTime)) {
        const [hours, minutes] = appt.appointmentTime.split(":");
        alert(
          `⏰ Session can only be started 30 minutes before to 2 hours after the appointment time (${hours}:${minutes}).\n\nPlease check back at the correct time.`
        );
        return;
      }

      const res = await startConsultation({
        appointmentId: appt._id,
        patientId: appt.patientId,
        patientName: appt.patientDetails?.fullName || "Patient",
        doctorName: user?.name || "Doctor",
        specialization: appt.specialty,
      });

      const consultationData = res?.data?.data || res?.data?.consultation || res.data;
      if (!consultationData) {
        throw new Error("Invalid consultation response from server");
      }

      setConsultation(consultationData);
      setActive(appt);
      setTimer(0);

      await notifyPatientSessionStarted(
        appt._id,
        appt.patientId,
        user?.name || "Doctor",
        appt.appointmentTime
      );

      const roomName = consultationData.roomName || `mediconnect-${appt._id}`;
      window.open(
        `https://meet.jit.si/${encodeURIComponent(roomName)}`,
        "_blank",
        "width=1200,height=700"
      );
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not start session. Please try again.";
      alert(`❌ ${errorMsg}`);
    }
  };

  const endSession = async () => {
    if (!window.confirm("End this consultation?")) return;
    try {
      if (consultation?._id) {
        await endConsultation(consultation._id, "");
      }
      await completeAppointment(activeSession._id);

      setActive(null);
      setConsultation(null);
      setTimer(0);
      setRxForm(false);

      alert("✅ Consultation ended and appointment marked complete.");
      fetchAppointments();
    } catch {
      alert("❌ Could not end session properly.");
    }
  };

  const addMed = () =>
    setRx((p) => ({ ...p, medications: [...p.medications, emptyRx()] }));
  const removeMed = (i) =>
    setRx((p) => ({
      ...p,
      medications: p.medications.filter((_, idx) => idx !== i),
    }));
  const updateMed = (i, field, val) =>
    setRx((p) => ({
      ...p,
      medications: p.medications.map((m, idx) =>
        idx === i ? { ...m, [field]: val } : m
      ),
    }));

  const submitRx = async () => {
    if (
      !rx.diagnosis.trim() ||
      rx.medications.some((m) => !m.name || !m.dosage || !m.frequency)
    ) {
      alert(
        "⚠️ Please fill all required prescription fields:\n- Diagnosis\n- For each medication: Name, Dosage, Frequency"
      );
      return;
    }
    setSubmitRx(true);
    try {
      await createPrescription({
        consultationId: consultation?._id || "",
        appointmentId: activeSession._id,
        patientId: activeSession.patientId,
        doctorName: user?.name || "Doctor",
        diagnosis: rx.diagnosis,
        medications: rx.medications,
        notes: rx.notes,
      });
      setRxForm(false);
      setRx({ diagnosis: "", notes: "", medications: [emptyRx()] });
      alert("✅ Prescription issued successfully! Patient can view it in their prescriptions.");
    } catch {
      alert("❌ Failed to issue prescription. Please try again.");
    } finally {
      setSubmitRx(false);
    }
  };

  if (activeSession) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Live Consultation
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Video Session
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Patient: {activeSession.patientName}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Session Duration
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {String(Math.floor(sessionTime / 60)).padStart(2, "0")}:
                {String(sessionTime % 60).padStart(2, "0")}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div
                className="relative overflow-hidden rounded-2xl bg-slate-100"
                style={{ height: 380 }}
              >
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs font-medium text-white">Live</span>
                </div>

                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-700 text-3xl font-bold text-white">
                      {activeSession.patientName?.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Session in progress</p>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/80 px-3 py-1">
                  <span className="text-sm text-white">
                    {activeSession.patientName} (Patient)
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() =>
                    window.open(
                      `https://meet.jit.si/${consultation?.roomName}`,
                      "_blank"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Rejoin Video
                </button>

                <button
                  onClick={endSession}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-800">Patient Info</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-400">Name</span>
                  <br />
                  <span className="font-medium text-slate-800">
                    {activeSession.patientName}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Reason</span>
                  <br />
                  <span className="text-slate-700">{activeSession.reason}</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-800">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setRxForm(!showRxForm)}
                  className="w-full rounded-xl bg-cyan-700 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800"
                >
                  {showRxForm ? "Close Rx Form" : "Issue Prescription"}
                </button>
                <button
                  onClick={() => navigate("/doctor/reports")}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        {showRxForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800">Issue Prescription</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Diagnosis *
                </label>
                <input
                  value={rx.diagnosis}
                  onChange={(e) => setRx((p) => ({ ...p, diagnosis: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Primary diagnosis"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Notes
                </label>
                <input
                  value={rx.notes}
                  onChange={(e) => setRx((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Additional instructions"
                />
              </div>
            </div>

            {rx.medications.map((med, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-5"
              >
                {[
                  ["Medicine *", "name", "Paracetamol 500mg"],
                  ["Dosage *", "dosage", "1 tablet"],
                  ["Frequency *", "frequency", "Twice daily"],
                  ["Duration", "duration", "5 days"],
                  ["Notes", "notes", "After meals"],
                ].map(([label, field, ph]) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs text-slate-500">{label}</label>
                    <input
                      value={med[field]}
                      onChange={(e) => updateMed(i, field, e.target.value)}
                      placeholder={ph}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-cyan-400"
                    />
                  </div>
                ))}

                {rx.medications.length > 1 && (
                  <div className="flex items-end">
                    <button
                      onClick={() => removeMed(i)}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={addMed}
                className="text-sm font-medium text-cyan-700 hover:underline"
              >
                + Add Medication
              </button>

              <button
                onClick={submitRx}
                disabled={submittingRx}
                className="ml-auto rounded-xl bg-cyan-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
              >
                {submittingRx ? "Issuing..." : "Issue Prescription"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
          Telemedicine
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Consultations
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          Conduct telemedicine video consultations from confirmed online appointments.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">
          Confirmed Video Appointments
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="space-y-4 py-12 text-center">
            <div className="text-6xl">📅</div>
            <p className="font-medium text-slate-700">No confirmed video appointments</p>
            <p className="mx-auto max-w-sm text-sm text-slate-500">
              You'll see online appointments here once patients book with you and the admin confirms them.
            </p>
            <div className="mx-auto mt-4 max-w-md rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-700">
              <p className="mb-2 font-medium">What's needed:</p>
              <ul className="space-y-1 text-left text-xs">
                <li>✓ Patient books an appointment with consultation type "Online"</li>
                <li>✓ Admin approves the appointment (status: confirmed)</li>
                <li>✓ Appointment is on today's date or future date</li>
              </ul>
            </div>
            <button
              onClick={fetchAppointments}
              className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
            >
              ↻ Refresh appointments
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const isConfirmed = appt.status === "confirmed";
              const isToday = isAppointmentDateToday(appt.appointmentDate);
              const isInWindow = isWithinSessionWindow(
                appt.appointmentDate,
                appt.appointmentTime
              );
              const canStartSession = isConfirmed && isToday && isInWindow;

              return (
                <div
                  key={appt._id}
                  className={`rounded-2xl border p-4 transition ${canStartSession
                      ? "border-cyan-200 bg-cyan-50"
                      : "border-slate-200 bg-slate-50"
                    }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-800">
                          {appt.patientDetails?.fullName || appt.patientName || "Patient"}
                        </p>

                        {!isConfirmed && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Pending Confirmation
                          </span>
                        )}

                        {isConfirmed && (
                          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">
                            Confirmed
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        📅 {new Date(appt.appointmentDate).toLocaleDateString()} at{" "}
                        {appt.appointmentTime}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">📝 {appt.reason}</p>
                      <p className="mt-1 text-xs font-medium text-cyan-700">
                        🌐 Online Consultation
                      </p>

                      {!isConfirmed && (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          Waiting for admin to confirm this appointment
                        </p>
                      )}

                      {isConfirmed && !isToday && (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          Session available on appointment date only
                        </p>
                      )}

                      {isConfirmed && isToday && !isInWindow && (
                        <p className="mt-1 text-xs font-medium text-orange-600">
                          Available 30 min before to 2 hours after appointment time
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => startSession(appt)}
                      disabled={!canStartSession}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${canStartSession
                          ? "bg-cyan-700 text-white hover:bg-cyan-800"
                          : "cursor-not-allowed bg-slate-300 text-slate-500"
                        }`}
                    >
                      {canStartSession ? "Start Session" : "Not Available"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default VideoSessionPage;