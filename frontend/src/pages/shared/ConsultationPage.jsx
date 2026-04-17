import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyAppointments } from '../../services/appointmentApi';
import { getToken } from '../../features/auth/authStorage';
import { useAuth } from '../../features/auth/AuthContext';
import axios from 'axios';

function ConsultationPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user } = useAuth();
  const preSelected = location.state?.appointment;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [joining, setJoining]           = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterType, setFilterType]     = useState('all'); // all, online, offline
  const [filterStatus, setFilterStatus] = useState('all'); // all, confirmed, pending

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = getToken();
      const res = await getMyAppointments(token);
      
      console.log('FULL Patient appointments response:', JSON.stringify(res, null, 2));
      
      // Handle both response formats
      const appointmentList = res?.data?.appointments || 
                             res?.appointments || 
                             (Array.isArray(res) ? res : []);
      
      const apptArray = Array.isArray(appointmentList) ? appointmentList : [];
      console.log('Parsed appointments array:', apptArray);
      console.log('Total appointments fetched:', apptArray.length);
      
      // Check each appointment's consultationType and status
      apptArray.forEach((apt, idx) => {
        console.log(`[${idx}] Appointment ${apt._id}:`, {
          consultationType: apt.consultationType,
          status: apt.status,
          doctorName: apt.doctorName,
          date: apt.appointmentDate,
          time: apt.appointmentTime
        });
      });
      
      // Filter for both online AND offline appointments (show pending and confirmed)
      const allConsultations = apptArray.filter(
        a => a.consultationType === 'online' || a.consultationType === 'offline'
      );
      
      console.log('Filtered online + offline consultations:', allConsultations.length);
      console.log('Filtered results:', allConsultations);
      setAppointments(allConsultations);
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

  // Filter appointments based on search and filters
  const getFilteredAppointments = () => {
    return appointments.filter(appt => {
      // Search filter
      const matchesSearch = appt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appt.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = filterType === 'all' || appt.consultationType === filterType;
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || appt.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredAppointments = getFilteredAppointments();

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

  // Notify doctor that patient joined the session
  const notifyDoctorPatientJoined = async (appointmentId, doctorId, patientName, appointmentTime) => {
    try {
      const token = getToken();
      const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`;
      
      await axios.post(
        `${API_URL}/patient-joined-session`,
        {
          doctorId,
          patientName,
          appointmentId,
          appointmentTime,
          message: `${patientName} has joined the video consultation. Please join now.`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      console.error('Error notifying doctor:', err);
    }
  };

  const joinSession = async (appt) => {
    // Step 1: Check if appointment is confirmed by admin
    if (appt.status !== 'confirmed') {
      alert(`⏳ Your appointment is not yet confirmed by the administrator.\n\nStatus: ${appt.status}\n\nWe'll notify you once confirmed.`);
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
        console.log('Payment not completed yet. Redirecting to payment page.');
        alert('Please complete the payment first.');
        window.location.href = `/payment/${appt._id}`;
        return;
      }

      // Check if payment is admin approved
      if (payment.adminStatus !== 'approved') {
        const statusMessage = payment.adminStatus === 'rejected'
          ? `Your payment was rejected. Reason: ${payment.rejectionReason || 'Not specified'}\n\nPlease try making another payment.`
          : `⏳ Your payment is awaiting admin approval.\n\nThis usually takes a few minutes. Please check back soon or contact support.`;
        alert(statusMessage);
        return;
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      alert('Could not verify payment status. Please try again or contact support.');
      return;
    }

    // Step 3: Validate appointment date
    if (!isAppointmentDateToday(appt.appointmentDate)) {
      const apptDate = new Date(appt.appointmentDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      alert(`❌ This appointment is scheduled for ${apptDate}.\n\nYou can only join the session on the appointment date.`);
      return;
    }

    // Step 4: Validate session time window
    if (!isWithinSessionWindow(appt.appointmentDate, appt.appointmentTime)) {
      const [hours, minutes] = appt.appointmentTime.split(':');
      alert(`⏰ Session can only be joined 30 minutes before to 2 hours after the appointment time (${hours}:${minutes}).\n\nPlease check back at the correct time.`);
      return;
    }

    try {
      setJoining(appt._id);
      console.log('Patient joining session for appointment:', appt._id);

      // Notify doctor that patient is joining
      await notifyDoctorPatientJoined(
        appt._id,
        appt.doctorId,
        user?.name || 'Patient',
        appt.appointmentTime
      );

      // Open video room
      const roomName = appt.consultationRoomId || `mediconnect-${appt._id}`;
      console.log('Opening Jitsi room:', roomName);
      const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(roomName)}`;
      window.open(jitsiUrl, '_blank', 'width=1200,height=700');
    } catch (err) {
      console.error('Error joining session:', err);
      alert(`❌ Could not join session. ${err.message || 'Please try again.'}`);
    } finally {
      setJoining(null);
    }
  };

  if (loading) return <div className="consultation-loading">Loading...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-xs text-slate-500">Manage your online and offline consultations with doctors</p>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
        <strong>📹 Video Consultations:</strong> Make sure your camera and microphone are working. Use a stable internet connection.<br/>
        <strong>🏥 Offline Consultations:</strong> Visit the clinic on the scheduled date and time.
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex gap-2 items-end">
          {/* Search Bar */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-700 mb-1">Search by Doctor or Specialization</label>
            <input
              type="text"
              placeholder="Search doctor name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex gap-3 flex-wrap">
          {/* Consultation Type Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="online">📹 Video Only</option>
              <option value="offline">🏥 Clinic Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="confirmed">✓ Confirmed</option>
              <option value="pending">⏳ Pending</option>
            </select>
          </div>

          {/* Results Counter */}
          <div className="flex items-end">
            <span className="text-xs text-slate-600 font-medium">
              {filteredAppointments.length} of {appointments.length} appointments
            </span>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium underline ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Pre-selected from appointments page */}
      {preSelected && (
        <div className={`rounded-xl border p-4 shadow-sm ${
          preSelected.consultationType === 'online'
            ? 'border-cyan-200 bg-cyan-50'
            : 'border-blue-200 bg-blue-50'
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
            preSelected.consultationType === 'online'
              ? 'text-cyan-600'
              : 'text-blue-600'
          }`}>
            {preSelected.consultationType === 'online' ? '📹 Ready to Join Video' : '🏥 Clinic Appointment'}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{preSelected.doctorName}</p>
              <p className="text-xs text-slate-500">{preSelected.specialization}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(preSelected.appointmentDate).toLocaleDateString()} at {preSelected.timeSlot}
              </p>
            </div>
            <div className="flex gap-2">
              {preSelected.consultationType === 'online' && (
                <button onClick={() => joinSession(preSelected)} disabled={joining === preSelected._id}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700 transition disabled:opacity-60">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {joining === preSelected._id ? 'Joining...' : 'Join Session'}
                </button>
              )}
              <button
                onClick={() => navigate(`/patient/prescriptions?appointmentId=${preSelected._id}&doctorId=${preSelected.doctorId}&doctorName=${preSelected.doctorName}`)}
                className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All confirmed video appointments */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Confirmed Appointments</h2>
        {loading ? (
          <div className="space-y-2">
            {[1,2].map(i => <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-lg" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">No confirmed appointments</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                You'll see video and clinic consultations here once you book appointments and they're confirmed by the admin.
              </p>
            </div>
            <div className="flex gap-2 mt-4 justify-center">
              <button onClick={() => navigate('/patient/appointments')}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                → View all appointments
              </button>
              <button onClick={fetchAppointments}
                className="text-xs text-slate-500 hover:text-slate-700">
                ↻ Refresh
              </button>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">No appointments match your filters</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Try adjusting your search query or filters to find appointments.
              </p>
            </div>
            <button onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterStatus('all');
            }}
              className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAppointments.map(appt => {
              const isToday = isAppointmentDateToday(appt.appointmentDate);
              const isInWindow = isWithinSessionWindow(appt.appointmentDate, appt.appointmentTime);
              const isConfirmed = appt.status === 'confirmed';
              const isOnline = appt.consultationType === 'online';
              const canJoinSession = isOnline && isConfirmed && isToday && isInWindow;
              
              return (
                <div
                  key={appt._id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                    (isOnline && canJoinSession) || (!isOnline && isConfirmed)
                      ? isOnline ? 'bg-cyan-50 border border-cyan-200' : 'bg-sky-50 border border-sky-200'
                      : 'bg-slate-50 border border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{appt.doctorName || 'Doctor'}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        isOnline 
                          ? 'bg-cyan-100 text-cyan-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isOnline ? '📹 Video' : '🏥 Clinic'}
                      </span>
                      {!isConfirmed && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          ⏳ Pending
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          ✓ Confirmed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      📅 {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                    </p>
                    {!isOnline && isConfirmed && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        📍 Please visit the clinic at the scheduled date and time
                      </p>
                    )}
                    {isOnline && !isConfirmed && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        ⏳ Waiting for admin to confirm this appointment
                      </p>
                    )}
                    {isOnline && isConfirmed && !isToday && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        📅 Session available on appointment date only
                      </p>
                    )}
                    {isOnline && isConfirmed && isToday && !isInWindow && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        🕐 Available 30 min before to 2 hours after appointment time
                      </p>
                    )}
                  </div>
                  {isOnline && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => joinSession(appt)}
                        disabled={!canJoinSession}
                        className={`flex items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                          canJoinSession && joining !== appt._id
                            ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {joining === appt._id ? 'Joining...' : canJoinSession ? 'Join' : 'N/A'}
                      </button>
                      <button
                        onClick={() => navigate(`/patient/prescriptions?appointmentId=${appt._id}&doctorId=${appt.doctorId}&doctorName=${appt.doctorName}`)}
                        className="flex items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Prescription
                      </button>
                    </div>
                  )}
                  {!isOnline && (
                    <button
                      onClick={() => navigate(`/patient/prescriptions?appointmentId=${appt._id}&doctorId=${appt.doctorId}&doctorName=${appt.doctorName}`)}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Prescription
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultationPage;
