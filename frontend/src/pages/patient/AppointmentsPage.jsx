import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelAppointment, getMyAppointments, rescheduleAppointment } from '../../services/appointmentApi';
import { getToken } from '../../features/auth/authStorage';
import { useAuth } from '../../features/auth/AuthContext';
import axios from 'axios';

function AppointmentsPage() {
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
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await getMyAppointments(token);
      
      console.log('[AppointmentsPage] Full response:', res);
      
      // Extract appointments from various response formats
      let appointmentList = [];
      
      if (res?.data?.appointments && Array.isArray(res.data.appointments)) {
        appointmentList = res.data.appointments;
        console.log('[AppointmentsPage] Got from res.data.appointments');
      } else if (res?.appointments && Array.isArray(res.appointments)) {
        appointmentList = res.appointments;
        console.log('[AppointmentsPage] Got from res.appointments');
      } else if (Array.isArray(res)) {
        appointmentList = res;
        console.log('[AppointmentsPage] Got from array res');
      } else {
        console.warn('[AppointmentsPage] No appointments found in response');
        appointmentList = [];
      }
      
      // Ensure it's an array
      const apptArray = Array.isArray(appointmentList) ? appointmentList : [];
      console.log('[AppointmentsPage] Total appointments fetched:', apptArray.length);
      
      // Log each appointment for debugging
      apptArray.forEach((apt, idx) => {
        console.log(`[${idx}] ID: ${apt._id}, Type: ${apt.consultationType}, Status: ${apt.status}, Doctor: ${apt.doctorName}`);
      });
      
      // Filter to show both online AND offline appointments (pending and confirmed)
      const filteredAppointments = apptArray.filter(apt => {
        const isValidType = apt.consultationType === 'online' || apt.consultationType === 'offline';
        const isValidStatus = apt.status === 'confirmed' || apt.status === 'pending';
        console.log(`[Filter] ${apt._id}: validType=${isValidType}, validStatus=${isValidStatus}`);
        return isValidType && isValidStatus;
      });
      
      console.log('[AppointmentsPage] Filtered appointments (online/offline + pending/confirmed):', filteredAppointments.length);
      setAppointments(filteredAppointments);
    } catch (err) {
      console.error('[AppointmentsPage] Error fetching appointments:', err);
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
      // Search filter - handle undefined values safely
      const doctorMatch = (appt.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const specializationMatch = (appt.specialization || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = doctorMatch || specializationMatch;
      
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
        `${API_URL}`,
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

  const handleCancelAppointment = async (appt) => {
    const reason = window.prompt('Optional: enter a reason for cancelling this appointment', '');
    if (reason === null) {
      return;
    }

    try {
      setActionLoading(`${appt._id}-cancel`);
      const token = getToken();
      await cancelAppointment(appt._id, reason, token);
      await fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRescheduleAppointment = async (appt) => {
    const appointmentDate = window.prompt(
      'Enter a new appointment date in YYYY-MM-DD format',
      new Date(appt.appointmentDate).toISOString().slice(0, 10)
    );

    if (!appointmentDate) {
      return;
    }

    const appointmentTime = window.prompt(
      'Enter a new appointment time in HH:mm format',
      appt.appointmentTime
    );

    if (!appointmentTime) {
      return;
    }

    try {
      setActionLoading(`${appt._id}-reschedule`);
      const token = getToken();
      await rescheduleAppointment(
        appt._id,
        {
          appointmentDate,
          appointmentTime,
        },
        token
      );
      await fetchAppointments();
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      alert(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(null);
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

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-2xl border border-slate-200 bg-white"></div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 rounded-lg"></div>)}
        </div>
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="mt-1 text-slate-600">Manage your online and offline consultations with doctors</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white p-4 shadow-sm">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs text-slate-500">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-600">{appointments.filter(a => a.status === 'confirmed').length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{appointments.filter(a => a.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Info Banners */}
      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-xl">📹</div>
            <div>
              <p className="font-semibold text-slate-900">Video Consultations</p>
              <p className="text-xs text-slate-600 mt-1">Ensure camera & microphone are working. Use stable internet connection.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-xl">🏥</div>
            <div>
              <p className="font-semibold text-slate-900">Clinic Visits</p>
              <p className="text-xs text-slate-600 mt-1">Visit at the scheduled date and time. Bring required documents.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
        <h3 className="font-semibold text-slate-900 mb-4">🔍 Search & Filter</h3>
        
        {/* Search Bar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Search Doctor or Specialization</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Type doctor name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Filter Options Grid */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            >
              <option value="all">📅 All Types</option>
              <option value="online">📹 Video Only</option>
              <option value="offline">🏥 Clinic Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            >
              <option value="all">📌 All Status</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="pending">⏳ Pending</option>
            </select>
          </div>

          {/* Results Counter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Results</label>
            <div className="w-full px-3 py-2.5 rounded-lg border border-cyan-300 bg-cyan-50 text-sm font-medium text-cyan-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold">
                {filteredAppointments.length}
              </span>
              of {appointments.length}
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterStatus('all');
            }}
            className="mt-4 w-full px-4 py-2 rounded-lg bg-cyan-50 text-cyan-700 font-medium hover:bg-cyan-100 transition text-sm border border-cyan-200"
          >
            ✕ Clear All Filters
          </button>
        )}
      </div>

      {/* Pre-selected from appointments page */}
      {preSelected && (
        <div className={`rounded-2xl border-2 p-5 shadow-lg transition transform hover:scale-102 ${
          preSelected.consultationType === 'online'
            ? 'border-slate-200 bg-white'
            : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`rounded-full p-2.5 ${
                  preSelected.consultationType === 'online'
                    ? 'bg-slate-100'
                    : 'bg-slate-100'
                }`}>
                  <span className="text-2xl">
                    {preSelected.consultationType === 'online' ? '📹' : '🏥'}
                  </span>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${
                    preSelected.consultationType === 'online'
                      ? 'text-slate-600'
                      : 'text-slate-600'
                  }`}>
                    {preSelected.consultationType === 'online' ? 'Ready to Join Video' : 'Clinic Appointment'}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900">{preSelected.doctorName}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">🎓 {preSelected.specialization}</p>
              <p className="text-sm font-medium text-slate-700">
                📅 {new Date(preSelected.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })} at {preSelected.appointmentTime}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {preSelected.status !== 'cancelled' && preSelected.status !== 'completed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRescheduleAppointment(preSelected)}
                    disabled={actionLoading === `${preSelected._id}-reschedule`}
                    className="rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === `${preSelected._id}-reschedule` ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(preSelected)}
                    disabled={actionLoading === `${preSelected._id}-cancel`}
                    className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === `${preSelected._id}-cancel` ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
              )}
              {preSelected.consultationType === 'online' && (
                <button 
                  onClick={() => joinSession(preSelected)} 
                  disabled={joining === preSelected._id}
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {joining === preSelected._id ? 'Joining...' : 'Join Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All appointments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <span className="text-2xl">📋</span>
            Your Appointments
          </h2>
          <button 
            onClick={fetchAppointments}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-16 space-y-5">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">No appointments yet</p>
              <p className="text-slate-500 mt-1">Start by booking an appointment with a doctor</p>
            </div>
            <button 
              onClick={() => navigate('/patient/doctors')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-2.5 font-medium text-white hover:bg-cyan-700 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Browse Doctors
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800">No appointments match your filters</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredAppointments.map(appt => {
              const isToday = isAppointmentDateToday(appt.appointmentDate);
              const isInWindow = isWithinSessionWindow(appt.appointmentDate, appt.appointmentTime);
              const isConfirmed = appt.status === 'confirmed';
              const isOnline = appt.consultationType === 'online';
              const canJoinSession = isOnline && isConfirmed && isToday && isInWindow;
              
              return (
                <div
                  key={appt._id}
                  className={`rounded-2xl border-2 p-5 transition hover:shadow-lg ${
                    (isOnline && canJoinSession) || (!isOnline && isConfirmed)
                      ? isOnline 
                        ? 'border-slate-200 bg-white shadow-md' 
                        : 'border-slate-200 bg-white shadow-md'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Top Row: Doctor Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`rounded-full p-1.5 ${
                          isOnline ? 'bg-slate-100' : 'bg-slate-100'
                        }`}>
                          <span className="text-lg">
                            {isOnline ? '📹' : '🏥'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{appt.doctorName || 'Doctor'}</h3>
                      </div>
                      <p className="text-sm text-slate-600">🎓 {appt.specialization}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        isOnline 
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {isOnline ? '📹 Video' : '🏥 Clinic'}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${
                        isConfirmed ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}>
                        {isConfirmed ? '✓ Confirmed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="mb-4 rounded-lg bg-white/50 px-3 py-2">
                    <p className="text-sm font-medium text-slate-900">
                      📅 {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      🕐 {appt.appointmentTime}
                    </p>
                  </div>

                  {/* Status Messages */}
                  {!isOnline && isConfirmed && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs font-medium text-slate-700">
                        📍 Visit the clinic at the scheduled date and time. Bring your insurance card if applicable.
                      </p>
                    </div>
                  )}
                  {isOnline && !isConfirmed && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs font-medium text-amber-800">
                        ⏳ Waiting for admin confirmation. You'll be notified once approved.
                      </p>
                    </div>
                  )}
                  {isOnline && isConfirmed && !isToday && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs font-medium text-slate-700">
                        📅 Session available only on appointment date.
                      </p>
                    </div>
                  )}
                  {isOnline && isConfirmed && isToday && !isInWindow && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs font-medium text-slate-700">
                        🕐 Available 30 min before to 2 hours after appointment time.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleRescheduleAppointment(appt)}
                          disabled={actionLoading === `${appt._id}-reschedule`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === `${appt._id}-reschedule` ? 'Rescheduling...' : 'Reschedule'}
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appt)}
                          disabled={actionLoading === `${appt._id}-cancel`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === `${appt._id}-cancel` ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </>
                    )}
                    {isOnline && (
                      <button
                        onClick={() => joinSession(appt)}
                        disabled={!canJoinSession}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-bold text-sm transition ${
                          canJoinSession && joining !== appt._id
                            ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {joining === appt._id ? 'Joining...' : canJoinSession ? 'Join Now' : 'N/A'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsPage;
