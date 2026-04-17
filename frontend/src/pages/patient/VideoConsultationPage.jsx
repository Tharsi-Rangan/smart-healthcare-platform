import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { endVideoSession } from "../../services/consultationApi";
import { getPatientAppointments } from "../../services/appointmentApi";
import { Video, Mic, MicOff, Phone } from "lucide-react";

function VideoConsultationPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const response = await getPatientAppointments();
        const appointmentsList = response.data?.appointments || [];
        const confirmedAppointments = appointmentsList.filter((apt) => apt.status === "confirmed");
        setAppointments(confirmedAppointments);
        if (confirmedAppointments.length > 0) {
          setSelectedAppointment(confirmedAppointments[0]);
        }
      } catch (err) {
        setError("Failed to load appointments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleStartSession = async () => {
    if (!selectedAppointment) {
      setError("Please select an appointment");
      return;
    }

    const appointmentId = selectedAppointment._id || selectedAppointment.id;
    navigate(`/patient/video-consultation/${appointmentId}`);
  };

  const handleEndSession = async () => {
    try {
      setLoading(true);
      if (selectedAppointment) {
        const appointmentId = selectedAppointment._id || selectedAppointment.id;
        await endVideoSession(appointmentId);
      }
      setSessionActive(false);
    } catch (err) {
      setError("Failed to end session");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Active video session view
  if (sessionActive) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Video Session Active</h1>
          <p className="text-sm text-slate-500">You are connected with {selectedAppointment?.doctorName}</p>
        </div>

        {/* Video placeholder - In production, integrate Twilio Video here */}
        <div className="rounded-2xl border-2 border-cyan-500 bg-black aspect-video flex items-center justify-center">
          <div className="text-center">
            <Video size={64} className="mx-auto mb-4 text-cyan-400" />
            <p className="text-white text-lg font-semibold">Video Session</p>
            <p className="text-slate-400 text-sm mt-2">Room active</p>
            <p className="text-slate-500 text-xs mt-1">Integration with Twilio Video SDK</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 bg-slate-100 rounded-xl p-6">
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-3 rounded-full transition ${
              isAudioEnabled
                ? "bg-cyan-600 text-white hover:bg-cyan-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-3 rounded-full transition ${
              isVideoEnabled
                ? "bg-cyan-600 text-white hover:bg-cyan-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            title={isVideoEnabled ? "Stop Camera" : "Start Camera"}
          >
            <Video size={20} />
          </button>

          <button
            onClick={handleEndSession}
            disabled={loading}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            title="End Call"
          >
            <Phone size={20} />
          </button>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          ℹ️ Your session is being recorded automatically. Duration: 30 minutes max.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Video Consultation</h1>
        <p className="text-sm text-slate-500">
          Connect with your doctor via secure video call
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && !sessionActive ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Video size={32} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            No Confirmed Appointments
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            You need a confirmed appointment to start a video consultation.
          </p>
          <button
            onClick={() => navigate("/patient/appointments")}
            className="mt-6 rounded-lg bg-cyan-600 px-6 py-2.5 font-semibold text-white hover:bg-cyan-700"
          >
            View Appointments
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-800 mb-4">
                Confirmed Appointments
              </h3>
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <button
                    key={apt._id || apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className={`w-full rounded-lg p-3 text-left text-sm transition ${
                      selectedAppointment?._id === apt._id ||
                      selectedAppointment?.id === apt.id
                        ? "bg-cyan-100 border border-cyan-300 text-cyan-900"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <p className="font-medium">{apt.doctorName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(apt.appointmentDate).toLocaleDateString()}{" "}
                      {apt.appointmentTime}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedAppointment && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-50">
                  <Video size={48} className="text-cyan-600\" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Ready for your consultation?
                </h2>
                <p className="mt-3 text-slate-600">
                  You are scheduled with{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedAppointment.doctorName}
                  </span>{" "}
                  on{" "}
                  <span className="font-semibold text-slate-800">
                    {new Date(
                      selectedAppointment.appointmentDate
                    ).toLocaleDateString()}
                  </span>{" "}
                  at{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedAppointment.appointmentTime}
                  </span>
                </p>

                <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                  ℹ️ Make sure your camera and microphone are working properly
                  before joining.
                </div>

                <button
                  onClick={handleStartSession}
                  disabled={loading}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-50 transition\"
                >
                  <Video size={20} />
                  {loading ? "Connecting..." : "Start Video Session"}
                </button>

                <button
                  onClick={() => navigate("/patient/appointments")}
                  className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  View All Appointments
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoConsultationPage;