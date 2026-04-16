import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPatientAppointments } from '../../services/appointmentApi';
import { getConsultationByAppointment } from '../../services/consultationApi';

function ConsultationPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [joining, setJoining]           = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPatientAppointments('confirmed');
        setAppointments(res.data?.appointments?.filter(a => a.type === 'video') || []);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const joinSession = async (appt) => {
    setJoining(appt._id);
    try {
      // Try to get existing room from consultation-service
      let roomName;
      try {
        const res = await getConsultationByAppointment(appt._id);
        roomName = res.data?.consultation?.roomName;
      } catch {
        // No consultation started yet — generate a room name
        roomName = `mediconnect-${appt._id}`;
      }
      window.open(`https://meet.jit.si/${roomName}`, '_blank');
    } catch {
      alert('Could not join session. Please try again.');
    } finally {
      setJoining(null);
    }
  };

  // Pre-select appointment passed from MyAppointmentsPage
  const preSelected = location.state?.appointment;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Video Consultation</h1>
        <p className="text-xs text-slate-500">Connect with your doctor via secure video call</p>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Make sure your camera and microphone are working before joining. Use a stable internet connection.
      </div>

      {/* Pre-selected from appointments page */}
      {preSelected && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 shadow-sm">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">Ready to Join</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{preSelected.doctorName}</p>
              <p className="text-xs text-slate-500">{preSelected.specialization}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(preSelected.appointmentDate).toLocaleDateString()} at {preSelected.timeSlot}
              </p>
            </div>
            <button onClick={() => joinSession(preSelected)} disabled={joining === preSelected._id}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition disabled:opacity-60">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {joining === preSelected._id ? 'Joining...' : 'Join Session'}
            </button>
          </div>
        </div>
      )}

      {/* All confirmed video appointments */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Confirmed Video Appointments</h2>
        {loading ? (
          <div className="space-y-2">
            {[1,2].map(i => <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-lg" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">No confirmed video appointments</p>
            <button onClick={() => navigate('/patient/appointments')}
              className="mt-2 text-xs text-teal-600 hover:underline">
              View all appointments →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map(appt => (
              <div key={appt._id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-800">{appt.doctorName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.timeSlot} • {appt.specialization}
                  </p>
                </div>
                <button onClick={() => joinSession(appt)} disabled={joining === appt._id}
                  className="flex items-center gap-0.5 rounded-lg bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-500 transition disabled:opacity-60">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {joining === appt._id ? 'Joining...' : 'Join'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultationPage;
