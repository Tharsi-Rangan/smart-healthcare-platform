import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyAppointments, getAppointmentById, cancelAppointment, rescheduleAppointment } from '../../services/appointmentApi';
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
  
  // Detail view modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [reschedulingApptId, setReschedulingApptId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  
  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelingApptId, setCancelingApptId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);
  
  // Error message state
  const [detailError, setDetailError] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');
  
  // Doctor availability state
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

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

  // View appointment details
  const viewAppointmentDetails = async (appointmentId) => {
    try {
      setDetailLoading(true);
      setDetailError('');
      const token = getToken();
      const response = await getAppointmentById(appointmentId, token);
      
      if (!response || (!response.data && !response._id)) {
        throw new Error('Invalid appointment data received');
      }
      
      setSelectedAppointment(response?.data || response);
      setDetailModalOpen(true);
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Could not load appointment details. Please try again.';
      setDetailError(errorMsg);
      setDetailModalOpen(true);
    } finally {
      setDetailLoading(false);
    }
  };
  
  // Check doctor availability for specific date
  const checkDoctorAvailability = async () => {
    try {
      setCheckingAvailability(true);
      // Default available time slots (9 AM to 5 PM, 1-hour intervals)
      // In production, fetch from doctor's availability API
      const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
      ];
      setAvailableSlots(timeSlots);
    } catch (err) {
      console.error('Error checking availability:', err);
      setRescheduleError('Could not fetch available slots. Please try later.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async () => {
    try {
      setCanceling(true);
      const token = getToken();
      await cancelAppointment(cancelingApptId, cancelReason, token);
      alert('✅ Appointment cancelled successfully!');
      setCancelModalOpen(false);
      setCancelingApptId(null);
      setCancelReason('');
      fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Error canceling appointment:', err);
      alert('❌ Could not cancel appointment. ' + (err.response?.data?.message || err.message));
    } finally {
      setCanceling(false);
    }
  };

  // Reschedule appointment with validation
  const handleRescheduleAppointment = async () => {
    setRescheduleError('');
    setRescheduleSuccess('');
    
    // Validation checks
    if (!rescheduleDate) {
      setRescheduleError('❌ Please select a new date for rescheduling.');
      return;
    }
    
    if (!rescheduleTime) {
      setRescheduleError('❌ Please select a new time slot for rescheduling.');
      return;
    }
    
    // Validate future date
    const selectedDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);
    if (selectedDateTime <= new Date()) {
      setRescheduleError('❌ New appointment must be scheduled for a future date and time.');
      return;
    }
    
    // Validate minimum 24 hours in advance
    const hoursAhead = (selectedDateTime - new Date()) / (1000 * 60 * 60);
    if (hoursAhead < 24) {
      setRescheduleError('⚠️ Appointments must be rescheduled at least 24 hours in advance.');
      return;
    }

    try {
      setRescheduling(true);
      const token = getToken();
      
      await rescheduleAppointment(
        reschedulingApptId,
        { appointmentDate: rescheduleDate, appointmentTime: rescheduleTime },
        token
      );
      
      setRescheduleSuccess('✅ Appointment rescheduled successfully!');
      
      setTimeout(() => {
        setRescheduleModalOpen(false);
        setReschedulingApptId(null);
        setRescheduleDate('');
        setRescheduleTime('');
        setRescheduleSuccess('');
        fetchAppointments(); // Refresh the list
      }, 1500);
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      
      // Handle specific error cases
      let errorMsg = 'Could not reschedule appointment. ';
      
      if (err.response?.data?.message) {
        errorMsg += err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMsg += 'Invalid date or time. Please check the selected slot.';
      } else if (err.response?.status === 409) {
        errorMsg += 'This time slot is already booked. Please choose another time.';
      } else if (err.response?.status === 403) {
        errorMsg += 'You do not have permission to reschedule this appointment.';
      } else if (err.response?.status === 404) {
        errorMsg += 'Appointment not found. Please refresh and try again.';
      } else {
        errorMsg += err.message || 'Please try again later.';
      }
      
      setRescheduleError(errorMsg);
    } finally {
      setRescheduling(false);
    }
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
        <div className="h-32 bg-linear-to-r from-cyan-600 to-sky-700 rounded-2xl"></div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 rounded-lg"></div>)}
        </div>
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl bg-linear-to-r from-cyan-600 to-sky-700 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="mt-1 text-cyan-100">Manage your online and offline consultations with doctors</p>
          </div>
          <div className="rounded-full bg-white/20 backdrop-blur p-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-white/10 backdrop-blur px-3 py-2">
            <p className="text-xs text-cyan-100">Total</p>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur px-3 py-2">
            <p className="text-xs text-cyan-100">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-300">{appointments.filter(a => a.status === 'confirmed').length}</p>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur px-3 py-2">
            <p className="text-xs text-cyan-100">Pending</p>
            <p className="text-2xl font-bold text-amber-300">{appointments.filter(a => a.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Info Banners */}
      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-sky-50 px-4 py-3 shadow-sm">
          <div className="flex gap-3">
            <div className="shrink-0 text-xl">📹</div>
            <div>
              <p className="font-semibold text-cyan-900">Video Consultations</p>
              <p className="text-xs text-cyan-700 mt-1">Ensure camera & microphone are working. Use stable internet connection.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-sky-200 bg-linear-to-br from-sky-50 to-sky-100 px-4 py-3 shadow-sm">
          <div className="flex gap-3">
            <div className="shrink-0 text-xl">🏥</div>
            <div>
              <p className="font-semibold text-sky-900">Clinic Visits</p>
              <p className="text-xs text-sky-700 mt-1">Visit at the scheduled date and time. Bring required documents.</p>
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
            ? 'border-cyan-300 bg-linear-to-br from-cyan-50 to-sky-50'
            : 'border-sky-300 bg-linear-to-br from-sky-50 to-sky-100'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`rounded-full p-2.5 ${
                  preSelected.consultationType === 'online'
                    ? 'bg-cyan-200'
                    : 'bg-sky-200'
                }`}>
                  <span className="text-2xl">
                    {preSelected.consultationType === 'online' ? '📹' : '🏥'}
                  </span>
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${
                    preSelected.consultationType === 'online'
                      ? 'text-cyan-600'
                      : 'text-sky-600'
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
        <div className="rounded-2xl border border-cyan-200 bg-linear-to-br from-cyan-50/50 to-sky-50/50 p-6 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <span className="text-2xl">📋</span>
            Your Appointments
          </h2>
          <button 
            onClick={fetchAppointments}
            className="flex items-center gap-2 rounded-lg bg-cyan-100 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-200 transition"
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
                        ? 'border-cyan-300 bg-linear-to-br from-cyan-50 to-sky-50 shadow-md' 
                        : 'border-sky-300 bg-linear-to-br from-sky-50 to-sky-100 shadow-md'
                      : 'border-cyan-300 bg-linear-to-br from-cyan-50 to-sky-50'
                  }`}
                >
                  {/* Top Row: Doctor Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`rounded-full p-1.5 ${
                          isOnline ? 'bg-cyan-200' : 'bg-sky-200'
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
                          ? 'bg-cyan-200 text-cyan-800'
                          : 'bg-sky-200 text-sky-800'
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
                    <div className="mb-4 rounded-lg bg-blue-100 px-3 py-2">
                      <p className="text-xs font-medium text-blue-800">
                        📍 Visit the clinic at the scheduled date and time. Bring your insurance card if applicable.
                      </p>
                    </div>
                  )}
                  {isOnline && !isConfirmed && (
                    <div className="mb-4 rounded-lg bg-amber-100 px-3 py-2">
                      <p className="text-xs font-medium text-amber-800">
                        ⏳ Waiting for admin confirmation. You'll be notified once approved.
                      </p>
                    </div>
                  )}
                  {isOnline && isConfirmed && !isToday && (
                    <div className="mb-4 rounded-lg bg-sky-100 px-3 py-2">
                      <p className="text-xs font-medium text-sky-800">
                        📅 Session available only on appointment date.
                      </p>
                    </div>
                  )}
                  {isOnline && isConfirmed && isToday && !isInWindow && (
                    <div className="mb-4 rounded-lg bg-orange-100 px-3 py-2">
                      <p className="text-xs font-medium text-orange-800">
                        🕐 Available 30 min before to 2 hours after appointment time.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
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
                    
                    {/* View Details Button */}
                    <button
                      onClick={() => viewAppointmentDetails(appt._id)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-200 py-2 font-bold text-sm text-slate-700 hover:bg-slate-300 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Details
                    </button>
                    
                    {/* Reschedule Button (only if pending or future) */}
                    {!isAppointmentDateToday(appt.appointmentDate) && (
                      <button
                        onClick={() => {
                          setReschedulingApptId(appt._id);
                          setRescheduleDate(appt.appointmentDate);
                          setRescheduleTime(appt.appointmentTime);
                          setRescheduleModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-200 py-2 font-bold text-sm text-amber-800 hover:bg-amber-300 transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reschedule
                      </button>
                    )}
                    
                    {/* Cancel Button (only if not already past appointment) */}
                    {!isAppointmentDateToday(appt.appointmentDate) && (
                      <button
                        onClick={() => {
                          setCancelingApptId(appt._id);
                          setCancelReason('');
                          setCancelModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-200 py-2 font-bold text-sm text-red-800 hover:bg-red-300 transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ DETAIL VIEW MODAL ============ */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="space-y-4 p-6 animate-pulse">
                <div className="h-8 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="space-y-2 mt-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-slate-200 rounded"></div>)}
                </div>
              </div>
            ) : selectedAppointment ? (
              <div className="p-6 space-y-4">
                {/* Error Display */}
                {detailError && (
                  <div className="rounded-lg bg-rose-50 p-4 border border-rose-200">
                    <p className="text-sm text-rose-700 font-medium">{detailError}</p>
                  </div>
                )}
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Appointment Details</h2>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="rounded-lg p-2 hover:bg-slate-100 transition"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Doctor Info Card */}
                <div className="rounded-xl bg-linear-to-br from-cyan-50 to-sky-50 p-5 border border-cyan-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">👨‍⚕️ {selectedAppointment.doctorName || 'Doctor'}</h3>
                      <p className="text-sm text-slate-600 mt-2">🎓 Specialty: {selectedAppointment.specialization || 'Not specified'}</p>
                      {selectedAppointment.doctorId && <p className="text-xs text-slate-500 mt-1">ID: {selectedAppointment.doctorId}</p>}
                    </div>
                  </div>
                </div>

                {/* Appointment Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase">📅 Date</p>
                    <p className="text-base font-bold text-slate-900 mt-2">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase">🕐 Time</p>
                    <p className="text-base font-bold text-slate-900 mt-2">{selectedAppointment.appointmentTime || 'TBA'}</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Type</p>
                    <p className="text-base font-bold text-slate-900 mt-2">
                      {selectedAppointment.consultationType === 'online' ? '📹 Video' : '🏥 Clinic'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
                    <p className={`text-base font-bold mt-2 ${selectedAppointment.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedAppointment.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </p>
                  </div>
                </div>

                {/* Reason for Visit */}
                {selectedAppointment.reason && (
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">💬 Reason for Visit</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedAppointment.reason}</p>
                  </div>
                )}

                {/* Patient Details */}
                {selectedAppointment.patientDetails && (
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-2">👤 Your Details</p>
                    <div className="space-y-1 text-sm text-blue-900">
                      <p><strong>Name:</strong> {selectedAppointment.patientDetails.fullName}</p>
                      <p><strong>Phone:</strong> {selectedAppointment.patientDetails.phone}</p>
                      <p><strong>Address:</strong> {selectedAppointment.patientDetails.address}</p>
                    </div>
                  </div>
                )}

                {/* Consultation Fee */}
                {selectedAppointment.consultationFee && (
                  <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-600 uppercase">💰 Consultation Fee</p>
                    <p className="text-lg font-bold text-emerald-700 mt-1">Rs. {selectedAppointment.consultationFee}</p>
                  </div>
                )}

                {/* Instructions */}
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">ℹ️ Instructions</p>
                  <p className="text-sm text-blue-900 leading-relaxed">
                    {selectedAppointment.consultationType === 'online' 
                      ? '📹 Video Consultation: Ensure your camera and microphone are working properly. You can join 30 minutes before the scheduled time. Check your internet connection beforehand.'
                      : '🏥 Clinic Visit: Please arrive 10-15 minutes early. Bring your ID and insurance card if applicable. Follow any pre-appointment instructions provided by the clinic.'}
                  </p>
                </div>

                {/* Close Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 font-bold text-white hover:bg-cyan-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                {detailError ? (
                  <div className="space-y-4">
                    <div className="text-rose-600 font-semibold">{detailError}</div>
                    <button
                      onClick={() => setDetailModalOpen(false)}
                      className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 transition"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-600">Could not load appointment details</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ RESCHEDULE MODAL ============ */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">📅 Reschedule Appointment</h3>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                disabled={rescheduling}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Success Message */}
            {rescheduleSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium">{rescheduleSuccess}</p>
              </div>
            )}
            
            {/* Error Message */}
            {rescheduleError && (
              <div className="mb-4 rounded-lg bg-rose-50 p-3 border border-rose-200">
                <p className="text-sm text-rose-700 font-medium">{rescheduleError}</p>
              </div>
            )}
            
            {!rescheduleSuccess && (
              <div className="space-y-4">
                {/* Current Appointment Info */}
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Current Appointment</p>
                  <p className="text-slate-800 mt-1">
                    {selectedAppointment?.doctorName} • {selectedAppointment?.appointmentTime}
                  </p>
                </div>

                {/* New Date Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select New Date *</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      if (e.target.value) {
                        checkDoctorAvailability();
                      }
                    }}
                    min={new Date(new Date().getTime() + 24*60*60*1000).toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-100"
                    disabled={rescheduling}
                  />
                  <p className="text-xs text-slate-500 mt-1">⚠️ Must be at least 24 hours from now</p>
                </div>

                {/* Time Slot Selection */}
                {rescheduleDate && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select New Time *</label>
                    {checkingAvailability ? (
                      <p className="text-sm text-slate-600">Loading available slots...</p>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setRescheduleTime(slot)}
                            className={`py-2 px-2 rounded-lg text-sm font-medium transition ${
                              rescheduleTime === slot
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            disabled={rescheduling}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600">No available slots for this date. Please select another date.</p>
                    )}
                  </div>
                )}

                {/* Restrictions Info */}
                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <strong>📋 Important:</strong> You can only reschedule to available slots. Appointments must be at least 24 hours in advance.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRescheduleModalOpen(false)}
                    className="flex-1 rounded-lg bg-slate-200 px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-300 transition disabled:opacity-50"
                    disabled={rescheduling}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleAppointment}
                    disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                    className="flex-1 rounded-lg bg-cyan-600 px-3 py-2.5 font-medium text-white hover:bg-cyan-700 transition disabled:opacity-50 disabled:bg-slate-300"
                  >
                    {rescheduling ? '⏳ Rescheduling...' : '✓ Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ CANCEL MODAL ============ */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Cancel Appointment</h2>
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-lg p-2 hover:bg-slate-100 transition"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Warning Message */}
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-900">
                  <strong>⚠️ Warning:</strong> This action cannot be undone. Are you sure you want to cancel this appointment?
                </p>
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Cancellation (Optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you're canceling..."
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={canceling}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {canceling ? 'Canceling...' : 'Cancel Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
