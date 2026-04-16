import { useNavigate } from "react-router-dom";

function PatientVideoConsultationPage() {
  const navigate = useNavigate();

  const joinSession = () => {
    const roomName = `healthconnect-patient-${Date.now()}`;
    window.open(`https://meet.jit.si/${roomName}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Video Consultation</h1>
        <p className="text-sm text-slate-500">Connect with your doctor via secure video call</p>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
            <svg className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Ready for your consultation?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your appointment with <span className="font-semibold text-slate-700">Dr. Sarah Fernando</span> is scheduled for today at 10:00 AM
          </p>

          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Make sure your camera and microphone are working properly before joining.
          </div>

          <button onClick={joinSession}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Join Session
          </button>

          <button onClick={() => navigate("/patient/appointments")}
            className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            View My Appointments
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientVideoConsultationPage;