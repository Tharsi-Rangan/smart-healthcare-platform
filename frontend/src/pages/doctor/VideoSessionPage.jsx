import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorAppointments, completeAppointment } from '../../services/appointmentApi';
import { startConsultation, endConsultation, createPrescription } from '../../services/consultationApi';
import { useAuth } from '../../features/auth/AuthContext';

const emptyRx = () => ({ name: '', dosage: '', frequency: '', duration: '', notes: '' });

function VideoSessionPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeSession, setActive]      = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [sessionTime, setTimer]         = useState(0);
  const [showRxForm, setRxForm]         = useState(false);
  const [submittingRx, setSubmitRx]     = useState(false);
  const [rx, setRx] = useState({
    diagnosis: '', notes: '', medications: [emptyRx()],
  });

  useEffect(() => { fetchAppointments(); }, []);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setTimer(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getDoctorAppointments('confirmed');
      setAppointments(res.data?.appointments?.filter(a => a.type === 'video') || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (appt) => {
    try {
      const res = await startConsultation({
        appointmentId: appt._id,
        patientId:     appt.patientId,
        patientName:   appt.patientName,
        doctorName:    user?.name || 'Doctor',
        specialization: appt.specialization,
      });
      const c = res.data?.consultation;
      setConsultation(c);
      setActive(appt);
      setTimer(0);
      window.open(`https://meet.jit.si/${c.roomName}`, '_blank');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not start session.');
    }
  };

  const endSession = async () => {
    if (!window.confirm('End this consultation?')) return;
    try {
      if (consultation?._id) {
        await endConsultation(consultation._id, '');
      }
      await completeAppointment(activeSession._id);
      setActive(null);
      setConsultation(null);
      setTimer(0);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not end session.');
    }
  };

  const addMed    = () => setRx(p => ({ ...p, medications: [...p.medications, emptyRx()] }));
  const removeMed = (i) => setRx(p => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));
  const updateMed = (i, field, val) => setRx(p => ({
    ...p,
    medications: p.medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m),
  }));

  const submitRx = async () => {
    if (!rx.diagnosis.trim() || rx.medications.some(m => !m.name || !m.dosage || !m.frequency)) {
      alert('Fill all required prescription fields.');
      return;
    }
    setSubmitRx(true);
    try {
      await createPrescription({
        consultationId: consultation?._id || '',
        appointmentId:  activeSession._id,
        patientId:      activeSession.patientId,
        patientName:    activeSession.patientName,
        doctorName:     user?.name || 'Doctor',
        specialization: activeSession.specialization,
        diagnosis:      rx.diagnosis,
        medications:    rx.medications,
        notes:          rx.notes,
      });
      setRxForm(false);
      setRx({ diagnosis: '', notes: '', medications: [emptyRx()] });
      alert('Prescription issued successfully.');
    } catch {
      alert('Failed to issue prescription.');
    } finally {
      setSubmitRx(false);
    }
  };

  if (activeSession) return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Video Consultation</h1>
        <p className="text-sm text-slate-500">Patient: {activeSession.patientName}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Video area */}
        <div className="col-span-2 space-y-3">
          <div className="relative overflow-hidden rounded-2xl bg-teal-600" style={{ height: 380 }}>
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1">
              <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-medium text-white">Live</span>
            </div>
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white">
                  {activeSession.patientName?.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="mt-2 text-sm text-white/80">Session in progress</p>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 rounded-lg bg-black/40 px-3 py-1">
              <span className="text-sm text-white">{activeSession.patientName} (Patient)</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => window.open(`https://meet.jit.si/${consultation?.roomName}`, '_blank')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Rejoin Video
            </button>
            <button onClick={endSession}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
              End Session
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-2">Patient Info</h3>
            <div className="space-y-1.5 text-sm">
              <p><span className="text-slate-400 text-xs">Name</span><br/><span className="font-medium">{activeSession.patientName}</span></p>
              <p><span className="text-slate-400 text-xs">Reason</span><br/><span className="text-slate-700">{activeSession.reason}</span></p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Session Duration</p>
            <p className="text-3xl font-bold text-teal-600 mt-1">
              {String(Math.floor(sessionTime / 60)).padStart(2,'0')}:{String(sessionTime % 60).padStart(2,'0')}
            </p>
            <p className="text-xs text-slate-400">minutes</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <h3 className="font-semibold text-slate-800 mb-1">Quick Actions</h3>
            <button onClick={() => setRxForm(!showRxForm)}
              className="w-full rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-500">
              {showRxForm ? 'Close Rx Form' : 'Issue Prescription'}
            </button>
            <button onClick={() => navigate('/doctor/reports')}
              className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Prescription Form */}
      {showRxForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">Issue Prescription</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Diagnosis *</label>
              <input value={rx.diagnosis} onChange={e => setRx(p => ({ ...p, diagnosis: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Primary diagnosis" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
              <input value={rx.notes} onChange={e => setRx(p => ({ ...p, notes: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Additional instructions" />
            </div>
          </div>

          {rx.medications.map((med, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 rounded-xl bg-slate-50 p-3">
              {[
                ['Medicine *','name','Paracetamol 500mg'],
                ['Dosage *','dosage','1 tablet'],
                ['Frequency *','frequency','Twice daily'],
                ['Duration','duration','5 days'],
                ['Notes','notes','After meals'],
              ].map(([label, field, ph]) => (
                <div key={field}>
                  <label className="text-xs text-slate-500 block mb-1">{label}</label>
                  <input value={med[field]} onChange={e => updateMed(i, field, e.target.value)}
                    placeholder={ph}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-400" />
                </div>
              ))}
              {rx.medications.length > 1 && (
                <div className="flex items-end">
                  <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={addMed} className="text-sm text-teal-600 hover:underline">+ Add Medication</button>
            <button onClick={submitRx} disabled={submittingRx}
              className="ml-auto rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60">
              {submittingRx ? 'Issuing...' : 'Issue Prescription'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Consultations</h1>
        <p className="text-sm text-slate-500">Conduct telemedicine video consultations</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Confirmed Video Appointments</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No confirmed video appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(appt => (
              <div key={appt._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-800">{appt.patientName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.timeSlot} • {appt.reason}
                  </p>
                </div>
                <button onClick={() => startSession(appt)}
                  className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoSessionPage;
