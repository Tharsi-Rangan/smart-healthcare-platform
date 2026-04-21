import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [viewMode, setViewMode] = useState('list'); // list | calendar
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarDateKey, setSelectedCalendarDateKey] = useState('');
  
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
  const detailModalContentRef = useRef(null);

  const anyModalOpen = detailModalOpen || rescheduleModalOpen || cancelModalOpen;

  useEffect(() => {
    if (!anyModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [anyModalOpen]);

  useEffect(() => {
    if (!detailModalOpen) return;
    requestAnimationFrame(() => {
      if (detailModalContentRef.current) {
        detailModalContentRef.current.scrollTop = 0;
      }
    });
  }, [detailModalOpen, selectedAppointment]);

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

  const toDateKey = (dateInput) => {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatShortDoctorName = (name) => {
    const cleaned = (name || 'Doctor').replace(/^Doctor\s*/i, '').trim();
    if (!cleaned) return 'Doctor';
    const first = cleaned.split(' ')[0];
    return first.length > 9 ? `${first.slice(0, 9)}…` : first;
  };

  const formatDisplayTime = (time) => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };

  const appointmentsByDate = filteredAppointments.reduce((acc, appt) => {
    const key = toDateKey(appt.appointmentDate);
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(appt);
    return acc;
  }, {});

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const firstWeekday = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const calendarStartDate = new Date(calendarYear, calendarMonthIndex, 1 - firstWeekday);
  const monthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarCells = Array.from({ length: 42 }, (_, idx) => {
    const date = new Date(calendarStartDate);
    date.setDate(calendarStartDate.getDate() + idx);
    return {
      date,
      dateKey: toDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === calendarMonthIndex,
      isToday: toDateKey(date) === toDateKey(new Date()),
    };
  });

  const selectedDateKey = selectedCalendarDateKey || toDateKey(new Date(calendarYear, calendarMonthIndex, 1));
  const selectedDayAppointments = (appointmentsByDate[selectedDateKey] || [])
    .slice()
    .sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''));

  const selectedDateLabel = selectedDateKey
    ? new Date(selectedDateKey).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Selected date';

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
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 p-6">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="h-40 bg-linear-to-r from-slate-200 to-slate-300 rounded-3xl animate-pulse"></div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>)}
          </div>
          
          {/* Cards Skeleton */}
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ============ ENHANCED HEADER ============ */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-cyan-600 via-cyan-500 to-blue-600 p-8 md:p-10 shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-48 w-48 rounded-full bg-white/5 blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-cyan-100 uppercase tracking-wider">
                📋 Appointment Management
              </span>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Total: {appointments.length}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
              Welcome Back! 👋
            </h1>
            <p className="text-cyan-100 text-base max-w-2xl">
              Manage and track all your online and offline consultations in one place
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              <div className="relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-lg p-3 border border-white/20 hover:bg-white/25 transition group">
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-cyan-100 text-xs font-bold uppercase tracking-wide">📊 Total</span>
                    <span className="text-xl">📋</span>
                  </div>
                  <p className="text-3xl font-black text-white">{appointments.length}</p>
                  <p className="text-cyan-200 text-xs mt-0.5">All your appointments</p>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-lg p-3 border border-white/20 hover:bg-white/25 transition group">
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-cyan-100 text-xs font-bold uppercase tracking-wide">✓ Confirmed</span>
                    <span className="text-xl">✅</span>
                  </div>
                  <p className="text-3xl font-black text-white">{appointments.filter(a => a.status === 'confirmed').length}</p>
                  <p className="text-cyan-200 text-xs mt-0.5">Ready to go</p>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-lg p-3 border border-white/20 hover:bg-white/25 transition group">
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-cyan-100 text-xs font-bold uppercase tracking-wide">⏳ Pending</span>
                    <span className="text-xl">⌛</span>
                  </div>
                  <p className="text-3xl font-black text-white">{appointments.filter(a => a.status === 'pending').length}</p>
                  <p className="text-cyan-200 text-xs mt-0.5">Awaiting approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ INFO BANNERS ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video Consultations Banner */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-100 to-cyan-50 p-6 shadow-lg border border-cyan-300 hover:shadow-xl transition">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-200 to-transparent opacity-0 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="text-4xl animate-bounce" style={{animationDelay: '0s'}}>📹</div>
              <div className="flex-1">
                <h3 className="font-bold text-cyan-900 mb-1">Video Consultations</h3>
                <p className="text-sm text-cyan-800">✓ Test camera & microphone • ✓ Stable internet • ✓ Quiet room</p>
              </div>
            </div>
          </div>
          
          {/* Clinic Visits Banner */}
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-100 to-blue-100 p-6 shadow-lg border border-cyan-300 hover:shadow-xl transition">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-200 to-transparent opacity-0 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="text-4xl animate-bounce" style={{animationDelay: '0.1s'}}>🏥</div>
              <div className="flex-1">
                <h3 className="font-bold text-cyan-900 mb-1">Clinic Visits</h3>
                <p className="text-sm text-cyan-800">✓ Arrive 10 min early • ✓ Bring ID card • ✓ Required documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============ ENHANCED SEARCH & FILTER ============ */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg">
          <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Search & Filter Appointments
          </h3>
          
          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">🔎 Search by Doctor or Specialty</label>
            <div className="relative group">
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Type doctor name, specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:ring-0 focus:border-cyan-500 hover:border-cyan-300 transition bg-linear-to-r from-slate-50 to-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">📋 Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm bg-white focus:outline-none focus:ring-0 focus:border-cyan-500 hover:border-cyan-300 transition font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">📅 All Types</option>
                <option value="online">📹 Video Consultation</option>
                <option value="offline">🏥 Clinic Visit</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">📌 Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm bg-white focus:outline-none focus:ring-0 focus:border-cyan-500 hover:border-cyan-300 transition font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">📌 All Status</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="pending">⏳ Pending</option>
              </select>
            </div>

            {/* Results Counter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">📊 Results</label>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-cyan-300 bg-linear-to-r from-cyan-50 to-blue-50 text-sm font-bold text-cyan-900 flex items-center gap-3 hover:border-cyan-400 transition">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-cyan-200 text-cyan-700 font-black text-lg">
                  {filteredAppointments.length}
                </span>
                <span className="text-slate-600">of</span>
                <span className="font-bold text-slate-700">{appointments.length}</span>
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
              className="w-full px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition border border-red-200 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters
            </button>
          )}
        </div>

      {/* Pre-selected from appointments page */}
      {preSelected && (
        <div className={`rounded-2xl border-2 p-5 shadow-lg transition transform hover:scale-[1.02] ${
          preSelected.consultationType === 'online'
            ? 'border-cyan-300 bg-linear-to-br from-cyan-50 to-sky-50'
            : 'border-sky-300 bg-linear-to-br from-sky-50 to-sky-100'
        }`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                    onClick={() => {
                      setSelectedAppointment(preSelected);
                      setReschedulingApptId(preSelected._id);
                      setRescheduleDate(toDateKey(preSelected.appointmentDate));
                      setRescheduleTime(preSelected.appointmentTime || '');
                      setRescheduleError('');
                      setRescheduleSuccess('');
                      setRescheduleModalOpen(true);
                    }}
                    disabled={rescheduling}
                    className="rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {rescheduling && reschedulingApptId === preSelected._id ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAppointment(preSelected);
                      setCancelingApptId(preSelected._id);
                      setCancelReason('');
                      setCancelModalOpen(true);
                    }}
                    disabled={canceling}
                    className="rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {canceling && cancelingApptId === preSelected._id ? 'Cancelling...' : 'Cancel'}
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

      {/* ============ APPOINTMENTS GRID ============ */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xl">
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-slate-200 pb-5 lg:mb-8 lg:flex-row lg:items-center lg:justify-between lg:pb-6">
          <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-black text-slate-900">
            <span className="text-3xl">📋</span>
            Your Appointments
            <span className="ml-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-cyan-100 text-cyan-700 text-sm font-bold border border-cyan-300">
              {filteredAppointments.length}
            </span>
          </h2>
          <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
            <div className="inline-flex rounded-xl border border-cyan-200 bg-cyan-50 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition ${
                  viewMode === 'list'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition ${
                  viewMode === 'calendar'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                Calendar
              </button>
            </div>

            {viewMode === 'calendar' && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-2 py-1.5">
                <button
                  onClick={() => {
                    const now = new Date();
                    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelectedCalendarDateKey(toDateKey(now));
                  }}
                  className="rounded-md px-2 py-1 text-[11px] font-bold text-cyan-700 hover:bg-cyan-100 transition"
                  title="Jump to current month"
                >
                  Today
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))}
                  className="rounded-md p-1 text-cyan-700 hover:bg-cyan-100 transition"
                  title="Previous month"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="min-w-30 text-center text-xs sm:text-sm font-bold text-slate-700">{monthLabel}</span>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))}
                  className="rounded-md p-1 text-cyan-700 hover:bg-cyan-100 transition"
                  title="Next month"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            <button 
              onClick={() => navigate('/patient/doctors')}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl sm:px-5 sm:text-sm"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Appointment
            </button>
            <button 
              onClick={fetchAppointments}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-100 to-blue-100 px-4 py-2.5 text-xs font-bold text-cyan-700 transition hover:from-cyan-200 hover:to-blue-200 hover:shadow-lg sm:text-sm"
            >
              <svg className="h-4 w-4 group-hover:rotate-180 transition duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-cyan-100 to-blue-100 shadow-lg">
              <span className="text-5xl">📭</span>
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-2xl font-black text-slate-800 mb-2">No Appointments Yet</p>
              <p className="text-slate-600 mb-6">Start your health journey by booking an appointment with a specialist doctor today!</p>
            </div>
            <button 
              onClick={() => navigate('/patient/doctors')}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-8 py-3.5 font-bold text-white transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Browse & Book Doctors
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <span className="text-4xl">🔍</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">No Results Found</p>
              <p className="text-slate-600 mt-1">Try adjusting your search filters or keywords</p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold px-4 py-2 transition text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-cyan-200 bg-white">
              <div className="min-w-190 p-4">
                <div className="mb-3 grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="rounded-lg bg-cyan-50 py-2 text-center text-xs font-black uppercase tracking-wide text-cyan-700">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarCells.map((cell) => {
                    const dayAppointments = appointmentsByDate[cell.dateKey] || [];

                    return (
                      <div
                        key={cell.dateKey}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCalendarDateKey(cell.dateKey)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCalendarDateKey(cell.dateKey);
                          }
                        }}
                        className={`min-h-29 rounded-xl border p-2 transition cursor-pointer ${
                          cell.isCurrentMonth
                            ? 'border-slate-200 bg-white hover:border-cyan-300'
                            : 'border-slate-100 bg-slate-50 text-slate-400'
                        } ${cell.isToday ? 'ring-2 ring-cyan-300 border-cyan-300' : ''} ${selectedDateKey === cell.dateKey ? 'ring-2 ring-blue-300 border-blue-300' : ''}`}
                        aria-label={`Select ${cell.dateKey}`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`text-xs font-black ${cell.isToday ? 'text-cyan-700' : 'text-slate-700'}`}>
                            {cell.day}
                          </span>
                          {dayAppointments.length > 0 && (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-100 px-1 text-[10px] font-black text-cyan-700">
                              {dayAppointments.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((appt) => {
                            const isConfirmed = appt.status === 'confirmed';
                            const aptId = appt._id || appt.id;

                            return (
                              <button
                                type="button"
                                key={aptId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewAppointmentDetails(aptId);
                                }}
                                className={`w-full rounded-md px-1.5 py-1 text-left text-[10px] font-bold transition hover:brightness-95 ${
                                  isConfirmed
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                                title="View appointment details"
                              >
                                <div className="truncate">
                                  {formatDisplayTime(appt.appointmentTime)} • {formatShortDoctorName(appt.doctorName)}
                                </div>
                              </button>
                            );
                          })}

                          {dayAppointments.length > 2 && (
                            <div className="px-1 text-[10px] font-bold text-slate-500">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Tip: Use filters above to narrow appointments shown in calendar view.
            </p>

            <div className="rounded-2xl border border-cyan-200 bg-linear-to-r from-cyan-50 to-blue-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-black text-slate-900">🗓️ {selectedDateLabel}</h4>
                <span className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-700">
                  {selectedDayAppointments.length} {selectedDayAppointments.length === 1 ? 'appointment' : 'appointments'}
                </span>
              </div>

              {selectedDayAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">No appointments on this day.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedDayAppointments.map((appt) => {
                    const isConfirmed = appt.status === 'confirmed';
                    const aptId = appt._id || appt.id;
                    return (
                      <button
                        key={aptId}
                        onClick={() => viewAppointmentDetails(aptId)}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-300 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-800 truncate">{appt.doctorName || 'Doctor'}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isConfirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {formatDisplayTime(appt.appointmentTime)} • {appt.consultationType === 'online' ? 'Video' : 'Clinic'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredAppointments.map((appt) => {
              const isToday = isAppointmentDateToday(appt.appointmentDate);
              const isInWindow = isWithinSessionWindow(appt.appointmentDate, appt.appointmentTime);
              const isConfirmed = appt.status === 'confirmed';
              const isOnline = appt.consultationType === 'online';
              const canJoinSession = isOnline && isConfirmed && isToday && isInWindow;
              const appointmentDate = new Date(appt.appointmentDate);
              const dayDiff = Math.floor((appointmentDate - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div
                  key={appt._id}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition transform hover:scale-[1.02] hover:shadow-xl ${
                    isOnline 
                      ? 'border-cyan-300 bg-linear-to-br from-cyan-50 to-blue-50' 
                      : 'border-sky-300 bg-linear-to-br from-sky-50 to-emerald-50'
                  }`}
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 z-10"></div>

                  {/* Content */}
                  <div className="relative z-20 p-6">
                    {/* Status badges */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-md ${
                        isOnline 
                          ? 'bg-cyan-600 text-white' 
                          : 'bg-sky-600 text-white'
                      }`}>
                        {isOnline ? '📹' : '🏥'} {isOnline ? 'Video' : 'Clinic'}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-md ${
                        isConfirmed 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {isConfirmed ? '✓ Confirmed' : '⏳ Pending'}
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`rounded-full p-4 ${
                        isOnline ? 'bg-cyan-200' : 'bg-sky-200'
                      }`}>
                        <span className="text-3xl block">
                          {isOnline ? '👨‍⚕️' : '🏥'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-900">{appt.doctorName || 'Doctor'}</h3>
                        <p className="text-sm text-slate-600 mt-1">🎓 {appt.specialization || 'General'}</p>
                        {dayDiff >= 0 && dayDiff < 7 && (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                            <span>📅</span> {dayDiff === 0 ? 'Today' : `in ${dayDiff} days`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date & Time Cards */}
                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/80 backdrop-blur p-3 border border-slate-200/50">
                        <p className="text-xs font-bold text-slate-500 uppercase">📅 Date</p>
                        <p className="text-sm font-black text-slate-900 mt-1">
                          {appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {appointmentDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/80 backdrop-blur p-3 border border-slate-200/50">
                        <p className="text-xs font-bold text-slate-500 uppercase">🕐 Time</p>
                        <p className="text-sm font-black text-slate-900 mt-1">{appt.appointmentTime}</p>
                        <p className="text-xs text-slate-600 mt-0.5">30 min session</p>
                      </div>
                    </div>

                    {/* Status Messages */}
                    {!isOnline && isConfirmed && (
                      <div className="mb-5 rounded-xl bg-blue-100 border border-blue-300 p-3">
                        <p className="text-xs font-bold text-blue-800">📍 Visit clinic in person</p>
                        <p className="text-xs text-blue-700 mt-1">Bring insurance card & documents</p>
                      </div>
                    )}
                    {isOnline && !isConfirmed && (
                      <div className="mb-5 rounded-xl bg-amber-100 border border-amber-300 p-3">
                        <p className="text-xs font-bold text-amber-800">⏳ Waiting for doctor confirmation</p>
                        <p className="text-xs text-amber-700 mt-1">You'll be notified when approved</p>
                      </div>
                    )}
                    {isOnline && isConfirmed && !isToday && (
                      <div className="mb-5 rounded-xl bg-sky-100 border border-sky-300 p-3">
                        <p className="text-xs font-bold text-sky-800">📅 Join on appointment day</p>
                        <p className="text-xs text-sky-700 mt-1">Session available from scheduled time</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
                      {isOnline && (
                        <button
                          onClick={() => joinSession(appt)}
                          disabled={!canJoinSession || joining === appt._id}
                          className={`col-span-2 flex items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-sm transition sm:col-span-1 ${
                            canJoinSession && joining !== appt._id
                              ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg transform hover:scale-105'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {joining === appt._id ? 'Joining...' : canJoinSession ? 'Join Now' : 'N/A'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => viewAppointmentDetails(appt._id)}
                        className={`flex items-center justify-center gap-2 rounded-lg bg-slate-200 hover:bg-slate-300 py-2.5 font-bold text-sm text-slate-700 transition ${isOnline ? 'col-span-2 sm:col-span-1' : 'col-span-2 sm:col-span-2'}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Details
                      </button>
                      
                      {!isAppointmentDateToday(appt.appointmentDate) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setReschedulingApptId(appt._id);
                              setRescheduleDate(toDateKey(appt.appointmentDate));
                              setRescheduleTime(appt.appointmentTime || '');
                              setRescheduleError('');
                              setRescheduleSuccess('');
                              setRescheduleModalOpen(true);
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg bg-amber-200 hover:bg-amber-300 py-2.5 font-bold text-sm text-amber-800 transition ${isOnline ? 'col-span-1' : 'col-span-1 sm:col-span-1'}`}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reschedule
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setCancelingApptId(appt._id);
                              setCancelReason('');
                              setCancelModalOpen(true);
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg bg-red-200 hover:bg-red-300 py-2.5 font-bold text-sm text-red-800 transition ${isOnline ? 'col-span-1' : 'col-span-1 sm:col-span-1'}`}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* ============ DETAIL VIEW MODAL ============ */}
      {detailModalOpen && createPortal(
        <div className="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-6 backdrop-blur-sm animate-in fade-in duration-200 sm:pt-8">
          <div ref={detailModalContentRef} className="w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {detailLoading ? (
              <div className="space-y-4 p-8 animate-pulse">
                <div className="h-10 bg-linear-to-r from-slate-200 to-slate-300 rounded-2xl"></div>
                <div className="h-5 bg-slate-200 rounded-lg w-2/3"></div>
                <div className="space-y-3 mt-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded-lg w-1/3"></div>
                      <div className="h-6 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedAppointment ? (
              <div className="p-8 space-y-6">
                {/* Error Display */}
                {detailError && (
                  <div className="rounded-2xl bg-rose-50 p-5 border-2 border-rose-200 flex items-start gap-3">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-rose-700">Error Loading Details</p>
                      <p className="text-sm text-rose-600 mt-1">{detailError}</p>
                    </div>
                  </div>
                )}
                
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b-2 border-slate-200">
                  <h2 className="text-3xl font-black text-slate-900">📋 Details</h2>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="rounded-full p-2.5 hover:bg-slate-100 transition"
                  >
                    <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Doctor Info Card */}
                <div className="rounded-2xl bg-linear-to-br from-cyan-50 to-blue-50 p-6 border-2 border-cyan-200 shadow-md">
                  <div className="flex items-start gap-5">
                    <div className="rounded-full bg-linear-to-br from-cyan-400 to-blue-500 p-5 text-white shadow-lg">
                      <span className="text-4xl block">👨‍⚕️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-slate-900">{selectedAppointment.doctorName || 'Doctor'}</h3>
                      <p className="text-sm text-slate-600 mt-2">🎓 Specialization: <span className="font-bold text-slate-800">{selectedAppointment.specialization || 'Not specified'}</span></p>
                      {selectedAppointment.doctorId && <p className="text-xs text-slate-500 mt-1">Doctor ID: <span className="font-mono">{selectedAppointment.doctorId}</span></p>}
                    </div>
                  </div>
                </div>

                {/* Appointment Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-5 border-2 border-slate-200 hover:border-cyan-300 transition">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">📅 Date</p>
                    <p className="text-xl font-black text-slate-900 mt-3">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long'
                      })}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5 border-2 border-slate-200 hover:border-cyan-300 transition">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">🕐 Time</p>
                    <p className="text-xl font-black text-slate-900 mt-3">{selectedAppointment.appointmentTime || 'TBA'}</p>
                    <p className="text-xs text-slate-600 mt-2">Duration: 30 minutes</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5 border-2 border-slate-200 hover:border-cyan-300 transition">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">📍 Type</p>
                    <p className="text-xl font-black text-slate-900 mt-3">
                      {selectedAppointment.consultationType === 'online' ? '📹 Video' : '🏥 Clinic'}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      {selectedAppointment.consultationType === 'online' ? 'Online Session' : 'In-Person Visit'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5 border-2 border-slate-200 hover:border-cyan-300 transition">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">📌 Status</p>
                    <p className={`text-xl font-black mt-3 ${selectedAppointment.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedAppointment.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      {selectedAppointment.status === 'confirmed' ? 'Ready to proceed' : 'Awaiting approval'}
                    </p>
                  </div>
                </div>

                {/* Reason for Visit */}
                {selectedAppointment.reason && (
                  <div className="rounded-2xl bg-blue-50 p-5 border-2 border-blue-200">
                    <p className="text-sm font-black text-blue-900 uppercase tracking-wide mb-2">💬 Reason for Visit</p>
                    <p className="text-sm text-blue-900 leading-relaxed bg-white rounded-xl p-3">{selectedAppointment.reason}</p>
                  </div>
                )}

                {/* Patient Details */}
                {selectedAppointment.patientDetails && (
                  <div className="rounded-2xl bg-emerald-50 p-5 border-2 border-emerald-200">
                    <p className="text-sm font-black text-emerald-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <span>👤</span> Your Contact Information
                    </p>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs text-emerald-600 font-bold uppercase">Name</p>
                        <p className="text-sm font-bold text-emerald-900 mt-1">{selectedAppointment.patientDetails.fullName}</p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs text-emerald-600 font-bold uppercase">📞 Phone</p>
                        <p className="text-sm font-bold text-emerald-900 mt-1">{selectedAppointment.patientDetails.phone}</p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs text-emerald-600 font-bold uppercase">📍 Address</p>
                        <p className="text-sm font-bold text-emerald-900 mt-1">{selectedAppointment.patientDetails.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consultation Fee */}
                {selectedAppointment.consultationFee && (
                  <div className="rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 p-5 border-2 border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-amber-900 uppercase tracking-wide">💰 Consultation Fee</p>
                        <p className="text-lg text-amber-600 mt-1">Not yet paid</p>
                      </div>
                      <p className="text-4xl font-black text-amber-700">Rs. {selectedAppointment.consultationFee}</p>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="rounded-2xl bg-linear-to-br from-cyan-50 to-blue-50 p-5 border-2 border-cyan-200">
                  <p className="text-sm font-black text-cyan-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span>ℹ️</span> Important Instructions
                  </p>
                  <div className="text-sm text-cyan-900 leading-relaxed bg-white rounded-xl p-4">
                    {selectedAppointment.consultationType === 'online' ? (
                      <>
                        <span className="font-bold">📹 Video Consultation:</span>{' '}
                        Ensure your camera and microphone are working properly. You can join 30 minutes before the scheduled time. Check your internet connection beforehand. Use a quiet and well-lit room.
                      </>
                    ) : (
                      <>
                        <span className="font-bold">🏥 Clinic Visit:</span>{' '}
                        Please arrive 10-15 minutes early. Bring your ID and insurance card if applicable. Follow any pre-appointment instructions provided by the clinic. Have recent medical reports if available.
                      </>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="w-full rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-6 py-3 font-bold text-white transition shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✓ Close
                </button>
              </div>
            ) : (
              <div className="p-8 text-center space-y-4">
                {detailError ? (
                  <div className="space-y-4">
                    <div className="text-5xl">❌</div>
                    <div className="text-rose-600 font-bold text-lg">{detailError}</div>
                    <button
                      onClick={() => setDetailModalOpen(false)}
                      className="rounded-lg bg-slate-200 px-6 py-2.5 text-slate-700 hover:bg-slate-300 transition font-bold"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl">🔍</div>
                    <p className="text-slate-600 font-medium">Could not load appointment details</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      , document.body)}

      {/* ============ RESCHEDULE MODAL ============ */}
      {rescheduleModalOpen && createPortal(
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-200">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-3xl">📅</span>
                Reschedule
              </h3>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="rounded-full p-2 hover:bg-slate-100 transition disabled:opacity-50"
                disabled={rescheduling}
              >
                <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Success Message */}
            {rescheduleSuccess && (
              <div className="mb-6 rounded-2xl bg-emerald-50 p-5 border-2 border-emerald-200 flex items-start gap-3 animate-in fade-in duration-300">
                <span className="text-2xl shrink-0">✅</span>
                <div>
                  <p className="text-sm font-bold text-emerald-900">Rescheduled Successfully!</p>
                  <p className="text-sm text-emerald-700 mt-1">{rescheduleSuccess}</p>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {rescheduleError && (
              <div className="mb-6 rounded-2xl bg-rose-50 p-5 border-2 border-rose-200 flex items-start gap-3">
                <span className="text-2xl shrink-0">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-rose-900">Error</p>
                  <p className="text-sm text-rose-700 mt-1">{rescheduleError}</p>
                </div>
              </div>
            )}
            
            {!rescheduleSuccess && (
              <div className="space-y-5">
                {/* Current Appointment Info */}
                <div className="rounded-2xl bg-linear-to-br from-cyan-50 to-blue-50 p-4 border-2 border-cyan-200">
                  <p className="text-xs font-black text-cyan-700 uppercase tracking-wide">📌 Current Appointment</p>
                  <div className="mt-3 rounded-lg bg-white p-3">
                    <p className="font-bold text-slate-900">
                      {selectedAppointment?.doctorName}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      🕐 {selectedAppointment?.appointmentTime}
                    </p>
                  </div>
                </div>

                {/* New Date Input */}
                <div>
                  <label className="flex text-sm font-black text-slate-900 mb-3 items-center gap-2">
                    <span>📅</span> Select New Date
                  </label>
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
                    className="w-full rounded-xl border-2 border-slate-300 hover:border-cyan-400 px-4 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-0 focus:border-cyan-500 disabled:bg-slate-100 transition"
                    disabled={rescheduling}
                  />
                  <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                    <span>⚠️</span> Must be at least 24 hours from now
                  </p>
                </div>

                {/* Time Slot Selection */}
                {rescheduleDate && (
                  <div>
                    <label className="flex text-sm font-black text-slate-900 mb-3 items-center gap-2">
                      <span>🕐</span> Select New Time
                    </label>
                    {checkingAvailability ? (
                      <div className="rounded-xl bg-slate-100 p-4 text-center">
                        <p className="text-sm text-slate-600 font-bold">⏳ Loading available slots...</p>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setRescheduleTime(slot)}
                            className={`py-3 px-2 rounded-xl text-sm font-bold transition transform ${
                              rescheduleTime === slot
                                ? 'bg-cyan-600 text-white shadow-lg scale-105'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                            }`}
                            disabled={rescheduling}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-amber-50 p-4 border-2 border-amber-200">
                        <p className="text-sm text-amber-800 font-bold">❌ No available slots</p>
                        <p className="text-xs text-amber-700 mt-1">Please select another date</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Important Notice */}
                <div className="rounded-2xl bg-linear-to-r from-orange-50 to-amber-50 p-4 border-2 border-orange-200">
                  <p className="text-xs font-black text-orange-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span>📋</span> Important
                  </p>
                  <p className="text-xs text-orange-800 leading-relaxed">
                    You can only reschedule to available time slots. New appointments must be at least 24 hours in advance. Your old appointment will be automatically cancelled.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRescheduleModalOpen(false)}
                    className="flex-1 rounded-xl bg-slate-200 hover:bg-slate-300 px-4 py-3.5 font-bold text-slate-700 transition disabled:opacity-50 shadow-md"
                    disabled={rescheduling}
                  >
                    ✕ Cancel
                  </button>
                  <button
                    onClick={handleRescheduleAppointment}
                    disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                    className="flex-1 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-4 py-3.5 font-bold text-white transition disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {rescheduling ? '⏳ Rescheduling...' : '✓ Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      , document.body)}

      {/* ============ CANCEL MODAL ============ */}
      {cancelModalOpen && createPortal(
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-linear-to-r from-red-600 to-red-700 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">Cancel?</h2>
                </div>
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-full p-2 hover:bg-white/20 transition disabled:opacity-50"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-5">
              {/* Warning Message */}
              <div className="rounded-2xl bg-red-50 p-5 border-2 border-red-200 flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">💔</span>
                <div>
                  <p className="text-sm font-bold text-red-900">This action cannot be undone</p>
                  <p className="text-sm text-red-700 mt-1">Once cancelled, you'll need to book a new appointment</p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="rounded-2xl bg-slate-50 p-4 border-2 border-slate-200">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wide mb-3">Appointment to Cancel</p>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">
                    👨‍⚕️ {selectedAppointment?.doctorName}
                  </p>
                  <p className="text-sm text-slate-700">
                    📅 {new Date(selectedAppointment?.appointmentDate).toLocaleDateString()} at {selectedAppointment?.appointmentTime}
                  </p>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="flex text-sm font-black text-slate-900 mb-3 items-center gap-2">
                  <span>💭</span> Why are you canceling?
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Your feedback helps us improve (optional)..."
                  rows="3"
                  className="w-full rounded-xl border-2 border-slate-300 hover:border-red-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-0 focus:border-red-500 disabled:bg-slate-100 transition resize-none placeholder-slate-400 bg-linear-to-b from-white to-slate-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 rounded-xl border-2 border-slate-300 hover:border-slate-400 px-4 py-3.5 font-bold text-slate-700 hover:bg-slate-50 transition shadow-md"
                >
                  ✕ Keep It
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={canceling}
                  className="flex-1 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-3.5 font-bold text-white transition disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {canceling ? '⏳ Canceling...' : '✓ Cancel Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

export default AppointmentsPage;
