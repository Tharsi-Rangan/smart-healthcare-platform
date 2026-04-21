import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, FileText, Stethoscope, Video } from "lucide-react";
import { getPatientAppointments } from "../../services/appointmentApi";
import {
  formatAppointmentDate,
  formatAppointmentDateTime,
  formatWindowText,
  getAppointmentId,
  getJoinState,
  getParticipantName,
} from "../../utils/videoConsultation";

function VideoConsultationPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPatientAppointments();
        const appointmentsList = response.data?.appointments || [];
        const videoAppointments = appointmentsList.filter(
          (appointment) =>
            appointment.consultationType === "online" &&
            ["confirmed", "completed"].includes(appointment.status)
        );

        setAppointments(videoAppointments);

        if (videoAppointments.length > 0) {
          setSelectedAppointmentId(getAppointmentId(videoAppointments[0]));
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load video consultations");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const selectedAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) => getAppointmentId(appointment) === selectedAppointmentId
      ) || null,
    [appointments, selectedAppointmentId]
  );

  const joinState = getJoinState(selectedAppointment, now);

  const handleJoinRoom = () => {
    if (!selectedAppointment || !joinState.canJoin) {
      return;
    }

    navigate(`/patient/video-consultation/${getAppointmentId(selectedAppointment)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Video Consultation</h1>
        <p className="text-sm text-slate-500">
          Select any online consultation, review the details, and join when the room opens.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-600" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Video size={32} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            No Video Consultations
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Confirmed online appointments will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/patient/appointments")}
            className="mt-6 rounded-lg bg-cyan-600 px-6 py-2.5 font-semibold text-white transition hover:bg-cyan-700"
          >
            View Appointments
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-800">Your Video Consultations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a consultation to preview its details.
            </p>

            <div className="mt-4 space-y-3">
              {appointments.map((appointment) => {
                const appointmentId = getAppointmentId(appointment);
                const isSelected = appointmentId === selectedAppointmentId;
                const state = getJoinState(appointment, now);

                return (
                  <button
                    key={appointmentId}
                    type="button"
                    onClick={() => setSelectedAppointmentId(appointmentId)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-cyan-300 bg-cyan-50 text-cyan-950"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {getParticipantName(appointment, "patient")}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatAppointmentDateTime(appointment)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${
                          state.canJoin
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {state.canJoin ? "Open" : appointment.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedAppointment ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
                    Consultation Details
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {getParticipantName(selectedAppointment, "patient")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAppointment.specialization ||
                      selectedAppointment.specialty ||
                      "General consultation"}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase text-cyan-700">
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CalendarDays size={16} />
                    Date
                  </p>
                  <p className="mt-2 text-slate-900">
                    {formatAppointmentDate(selectedAppointment)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock size={16} />
                    Time
                  </p>
                  <p className="mt-2 text-slate-900">
                    {selectedAppointment.appointmentTime || "Unknown"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Stethoscope size={16} />
                    Doctor
                  </p>
                  <p className="mt-2 text-slate-900">
                    {selectedAppointment.doctorName || "Doctor"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Video size={16} />
                    Join Window
                  </p>
                  <p className="mt-2 text-slate-900">
                    {formatWindowText(selectedAppointment)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText size={16} />
                  Reason
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {selectedAppointment.reason || "No reason provided."}
                </p>
              </div>

              <div
                className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                  joinState.canJoin
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {joinState.message}
              </div>

              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={!joinState.canJoin}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                <Video size={18} />
                Join Video Room
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default VideoConsultationPage;
