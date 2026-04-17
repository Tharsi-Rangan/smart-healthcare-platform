import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorAppointments, getMyAppointments, completeAppointment } from '../../services/appointmentApi';
import { startConsultation, endConsultation, createPrescription } from '../../services/consultationApi';
import { getToken } from '../../features/auth/authStorage';
import { useAuth } from '../../features/auth/AuthContext';
import axios from 'axios';

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
      const token = getToken();
      console.log('Fetching appointments with token:', token ? 'present' : 'missing');
      
      // Try fetching with doctor-specific endpoint first
      let appointments = [];
      try {
        const res = await getDoctorAppointments(token);
        console.log('FULL Doctor appointments response:', JSON.stringify(res, null, 2));
        
        // Handle both response formats
        const appointmentList = res?.data?.appointments || 
                               res?.appointments || 
                               (Array.isArray(res) ? res : []);
        
        appointments = Array.isArray(appointmentList) ? appointmentList : [];
        console.log('Parsed appointments array:', appointments);
      } catch (doctorErr) {
        console.warn('Doctor-specific endpoint failed, trying generic endpoint:', doctorErr);
        // Fallback to /my endpoint for both patients and doctors
        const res = await getMyAppointments(token);
        console.log('FULL Generic /my response:', JSON.stringify(res, null, 2));
        
        const appointmentList = res?.data?.appointments || 
                               res?.appointments || 
                               (Array.isArray(res) ? res : []);
        appointments = Array.isArray(appointmentList) ? appointmentList : [];
        console.log('Parsed appointments array:', appointments);
      }
      
      console.log('Total appointments fetched:', appointments.length);
      console.log('All doctor appointments:', appointments);
      
      // Check each appointment's consultationType and status
      appointments.forEach((apt, idx) => {
        console.log(`[${idx}] Appointment ${apt._id}:`, {
          consultationType: apt.consultationType,
          status: apt.status,
          patientName: apt.patientDetails?.fullName || apt.patientName,
          date: apt.appointmentDate,
          time: apt.appointmentTime
        });
      });
      
      // Filter for ONLY online appointments (show pending and confirmed)
      const onlineAppointments = appointments.filter(
        a => a.consultationType === 'online'
      );
      
      console.log('Filtered online appointments:', onlineAppointments.length);
      console.log('Filtered results:', onlineAppointments);
      setAppointments(onlineAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if today is the appointment date
  const isAppointmentDateToday = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);
    
    return today.getTime() === apptDate.getTime();
  };

  // Check if current time is within 30 min before appointment time
  const isWithinSessionWindow = (appointmentDate, appointmentTime) => {
    const now = new Date();
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    
    const apptDateTime = new Date(appointmentDate);
    apptDateTime.setHours(hours, minutes, 0, 0);
    
    const windowStart = new Date(apptDateTime.getTime() - 30 * 60000); // 30 min before
    const windowEnd = new Date(apptDateTime.getTime() + 2 * 60 * 60000); // 2 hours after
    
    return now >= windowStart && now <= windowEnd;
  };

  // Notify patient that doctor started the session
  const notifyPatientSessionStarted = async (appointmentId, patientId, doctorName, appointmentTime) => {
    try {
      const token = getToken();
      const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`;
      
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
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      console.error('Error notifying patient:', err);
    }
  };

  const startSession = async (appt) => {
    try {
      // Step 1: Check appointment confirmation status
      if (appt.status !== 'confirmed') {
        alert(`⏳ This appointment has not been confirmed by the administrator yet.\n\nStatus: ${appt.status}\n\nYou'll be notified once it's confirmed.`);
        return;
      }

      // Step 2: Check payment approval status
      try {
        const token = getToken();
        const paymentResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/status/${appt._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const payment = paymentResponse.data?.data || paymentResponse.data;
        console.log('Payment status check:', payment);

        // Check if payment exists
        if (!payment || payment.status !== 'completed') {
          alert('⚠️ Patient payment is not yet completed. They will need to complete payment before you can start the session.');
          return;
        }

        // Check if payment is admin approved
        if (payment.adminStatus !== 'approved') {
          const message = payment.adminStatus === 'rejected'
            ? '⚠️ The patient\'s payment was rejected by admin. They will need to make another payment.'
            : '⏳ The patient\'s payment is awaiting admin approval. Once approved, you can start the session.';
          alert(message);
          return;
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        alert('Could not verify payment status. Please try again.');
        return;
      }

      // Step 3: Validate date and time
      if (!isAppointmentDateToday(appt.appointmentDate)) {
        const apptDate = new Date(appt.appointmentDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        alert(`❌ This appointment is scheduled for ${apptDate}.\n\nYou can only start the session on the appointment date.`);
        return;
      }

      if (!isWithinSessionWindow(appt.appointmentDate, appt.appointmentTime)) {
        const [hours, minutes] = appt.appointmentTime.split(':');
        alert(`⏰ Session can only be started 30 minutes before to 2 hours after the appointment time (${hours}:${minutes}).\n\nPlease check back at the correct time.`);
        return;
      }

      // Start consultation on backend
      console.log('Starting consultation for appointment:', appt._id);
      const res = await startConsultation({
        appointmentId: appt._id,
        patientId: appt.patientId,
        patientName: appt.patientDetails?.fullName || 'Patient',
        doctorName: user?.name || 'Doctor',
        specialization: appt.specialty,
      });
      
      console.log('Consultation started response:', res);
      
      const consultationData = res?.data?.data || res?.data?.consultation || res.data;
      if (!consultationData) {
        throw new Error('Invalid consultation response from server');
      }
      
      setConsultation(consultationData);
      setActive(appt);
      setTimer(0);

      // Notify patient that session started
      await notifyPatientSessionStarted(
        appt._id,
        appt.patientId,
        user?.name || 'Doctor',
        appt.appointmentTime
      );

      // Open video room
      const roomName = consultationData.roomName || `mediconnect-${appt._id}`;
      console.log('Opening Jitsi room:', roomName);
      window.open(`https://meet.jit.si/${encodeURIComponent(roomName)}`, '_blank', 'width=1200,height=700');
    } catch (err) {
      console.error('Error starting session:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Could not start session. Please try again.';
      alert(`❌ ${errorMsg}`);
    }
  };

  const endSession = async () => {
    if (!window.confirm('End this consultation?')) return;
    try {
      if (consultation?._id) {
        console.log('Ending consultation:', consultation._id);
        await endConsultation(consultation._id, '');
      }
      console.log('Completing appointment:', activeSession._id);
      await completeAppointment(activeSession._id);
      
      setActive(null);
      setConsultation(null);
      setTimer(0);
      setRxForm(false);
      
      alert('✅ Consultation ended and appointment marked complete.');
      fetchAppointments();
    } catch (err) {
      console.error('Error ending session:', err);
      alert(`❌ ${err.response?.data?.message || 'Could not end session properly.'}`);
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
      alert('⚠️ Please fill all required prescription fields:\n- Diagnosis\n- For each medication: Name, Dosage, Frequency');
      return;
    }
    setSubmitRx(true);
    try {
      console.log('Submitting prescription:', rx);
      await createPrescription({
        consultationId: consultation?._id || '',
        appointmentId:  activeSession._id,
        patientId:      activeSession.patientId,
        doctorName:     user?.name || 'Doctor',
        diagnosis:      rx.diagnosis,
        medications:    rx.medications,
        notes:          rx.notes,
      });
      setRxForm(false);
      setRx({ diagnosis: '', notes: '', medications: [emptyRx()] });
      alert('✅ Prescription issued successfully! Patient can view it in their prescriptions.');
    } catch (err) {
      console.error('Error issuing prescription:', err);
      alert(`❌ ${err.response?.data?.message || 'Failed to issue prescription. Please try again.'}`);
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
          <div className="relative overflow-hidden rounded-2xl bg-cyan-600" style={{ height: 380 }}>
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
              <svg className="h-4 w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <p className="text-3xl font-bold text-cyan-600 mt-1">
              {String(Math.floor(sessionTime / 60)).padStart(2,'0')}:{String(sessionTime % 60).padStart(2,'0')}
            </p>
            <p className="text-xs text-slate-400">minutes</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <h3 className="font-semibold text-slate-800 mb-1">Quick Actions</h3>
            <button onClick={() => setRxForm(!showRxForm)}
              className="w-full rounded-xl bg-cyan-600 py-2 text-sm font-semibold text-white hover:bg-cyan-700">
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Primary diagnosis" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
              <input value={rx.notes} onChange={e => setRx(p => ({ ...p, notes: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-cyan-400" />
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
            <button onClick={addMed} className="text-sm text-cyan-600 hover:underline">+ Add Medication</button>
            <button onClick={submitRx} disabled={submittingRx}
              className="ml-auto rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">
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
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-slate-700 font-medium">No confirmed video appointments</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              You'll see online appointments here once patients book with you and the admin confirms them.
            </p>
            <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-sm text-cyan-700">
              <p className="font-medium mb-2">💡 What's needed:</p>
              <ul className="text-left text-xs space-y-1 max-w-sm mx-auto">
                <li>✓ Patient books an appointment with consultation type "Online"</li>
                <li>✓ Admin approves the appointment (status: confirmed)</li>
                <li>✓ Appointment is on today's date or future date</li>
              </ul>
            </div>
            <button onClick={fetchAppointments}
              className="mt-4 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
              ↻ Refresh appointments
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(appt => {
              const isConfirmed = appt.status === 'confirmed';
              const isToday = isAppointmentDateToday(appt.appointmentDate);
              const isInWindow = isWithinSessionWindow(appt.appointmentDate, appt.appointmentTime);
              const canStartSession = isConfirmed && isToday && isInWindow;
              
              return (
                <div
                  key={appt._id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                    canStartSession
                      ? 'bg-cyan-50 border-2 border-cyan-200'
                      : 'bg-slate-50 border border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{appt.patientDetails?.fullName || appt.patientName || 'Patient'}</p>
                      {!isConfirmed && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          ⏳ Pending Confirmation
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">
                          ✓ Confirmed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      📅 {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">📝 {appt.reason}</p>
                    <p className="text-xs text-cyan-600 font-medium mt-1">🌐 Online Consultation</p>
                    {!isConfirmed && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        ⏳ Waiting for admin to confirm this appointment
                      </p>
                    )}
                    {isConfirmed && !isToday && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        📅 Session available on appointment date only
                      </p>
                    )}
                    {isConfirmed && isToday && !isInWindow && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        🕐 Available 30 min before to 2 hours after appointment time
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => startSession(appt)}
                    disabled={!canStartSession}
                    className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      canStartSession
                        ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {canStartSession ? 'Start Session' : 'Not Available'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoSessionPage;
