import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPublicDoctorById } from '../../services/publicDoctorApi';
import { createAppointment } from '../../services/appointmentApi';
import { useAuth } from '../../features/auth/AuthContext';
import { getToken } from '../../features/auth/authStorage';

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function generateTimeSlots(startTime, endTime, durationMin = 30) {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM]     = endTime.split(':').map(Number);
  let current = startH * 60 + startM;
  const end   = endH * 60 + endM;
  while (current + durationMin <= end) {
    const h    = Math.floor(current / 60);
    const m    = current % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
    current += durationMin;
  }
  return slots;
}

function BookAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get doctor ID from query parameter, not route params
  const searchParams = new URLSearchParams(location.search);
  const doctorIdFromQuery = searchParams.get('doctorId');
  const id = doctorIdFromQuery;

  const [doctor, setDoctor]       = useState(location.state?.doctor || null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmit]   = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSlot]   = useState('');
  const [reason, setReason]       = useState('');
  const [type, setType]           = useState('online');
  const [phone, setPhone]         = useState(user?.phone || '');
  const [address, setAddress]     = useState(user?.address || '');

  useEffect(() => {
    (async () => {
      try {
        let doctorId = id;
        
        // If doctor passed via state, extract ID; otherwise use query param
        if (location.state?.doctor && !id) {
          doctorId = location.state.doctor.id || location.state.doctor._id;
        }
        
        if (!doctorId) {
          setError('No doctor selected. Please go back and choose a doctor.');
          setLoading(false);
          return;
        }
        
        // Always fetch full doctor data with availability (don't rely on state)
        // State doctor object doesn't include availability data
        const docData = await getPublicDoctorById(doctorId);
        console.log('Doctor data fetched with availability:', docData);
        console.log('Availability slots from API:', docData?.availability);
        setDoctor(docData);
        setAvailability(docData?.availability || []);
        setError('');
      } catch (err) {
        console.error('Error loading doctor:', err);
        setError('Failed to load doctor details. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Sort availability by day order
  const sortedAvail = [...availability].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  // Get the day name from a date string (YYYY-MM-DD)
  const getDayNameFromDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    // JavaScript getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
    // DAY_ORDER: Monday (0), Tuesday (1), ..., Sunday (6)
    // Convert: (getDay() + 6) % 7 maps Sun(0)->6, Mon(1)->0, Tue(2)->1, etc.
    const dayIndex = (date.getDay() + 6) % 7;
    return DAY_ORDER[dayIndex];
  };

  // Get availability slot for a specific date
  const getAvailabilityForDate = (dateStr) => {
    const dayName = getDayNameFromDate(dateStr);
    return sortedAvail.find(s => s.day === dayName && s.isActive !== false);
  };

  // Generate next 30 days that have doctor availability
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = getDayNameFromDate(dateStr);
      
      // Check if this day is in doctor's availability
      if (sortedAvail.some(s => s.day === dayName && s.isActive !== false)) {
        dates.push(dateStr);
      }
      
      if (dates.length >= 30) break;
    }
    return dates;
  };

  const availableDates = getAvailableDates();
  const selectedDaySlot = selectedDate ? getAvailabilityForDate(selectedDate) : null;

  const getNextDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00');
  };

  const timeSlots = selectedDaySlot
    ? generateTimeSlots(selectedDaySlot.startTime, selectedDaySlot.endTime, selectedDaySlot.slotDuration || 30)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !reason.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSubmit(true);
    
    try {
      // Convert 12-hour time (with AM/PM) to 24-hour format
      const convertTo24Hour = (time12) => {
        const [time, period] = time12.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      };
      
      // Use the actual doctor ID from doctor object
      const doctorId = doctor?.id || doctor?._id;
      const doctorAuthUserId = doctor?.authUserId;
      
      if (!doctorId) {
        throw new Error('Doctor ID is missing. Unable to create appointment.');
      }
      
      if (!doctorAuthUserId) {
        console.warn('Doctor authUserId is missing:', doctor);
      }

      const payload = {
        doctorId: String(doctorId),  // Ensure it's a string
        doctorAuthUserId: doctorAuthUserId || '',  // Pass it even if empty so backend handles it
        specialty: doctor?.specialization || '',
        appointmentDate: selectedDate,  // Format: YYYY-MM-DD
        appointmentTime: convertTo24Hour(selectedSlot),  // Format: HH:MM
        consultationType: type,
        reason: reason.trim(),
        patientDetails: {
          fullName: user?.name || 'Patient',
          phone: phone.trim(),
          address: address.trim(),
        },
      };

      console.log('Creating appointment with payload:', payload);
      const token = getToken();
      await createAppointment(payload, token);
      setSuccess(true);
    } catch (err) {
      console.error('Booking error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data,
        error: err.message,
      });
      const errorMsg = err.response?.data?.message || err.message || 'Failed to book appointment. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmit(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-1/3 bg-slate-200 rounded" />
      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
  );

  if (success) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm max-w-sm w-full">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Appointment Requested!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your appointment with <strong>{doctor?.name}</strong> on{' '}
          <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>{selectedSlot}</strong> has been submitted.
          Awaiting doctor confirmation.
        </p>
        <div className="mt-6 space-y-2">
          <button onClick={() => navigate('/patient/appointments')}
            className="w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition">
            View My Appointments
          </button>
          <button onClick={() => navigate('/patient/find-doctors')}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            Find More Doctors
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
        <p className="text-sm text-slate-500">Select a day and time slot</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Doctor summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-sm font-bold text-white overflow-hidden">
                {doctor?.profileImage
                  ? <img src={doctor.profileImage} alt="" className="h-full w-full object-cover" />
                  : (doctor?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR')
                }
              </div>
              <div>
                <p className="font-semibold text-slate-800">{doctor?.name}</p>
                <p className="text-xs text-cyan-600">{doctor?.specialization}</p>
              </div>
            </div>
            {doctor?.hospital && <p className="text-xs text-slate-500 mb-3">🏥 {doctor.hospital}</p>}
            <div className="rounded-xl bg-cyan-50 p-3 text-center mb-4">
              <p className="text-xs text-slate-500">Consultation Fee</p>
              <p className="text-lg font-bold text-cyan-700">
                {doctor?.consultationFee ? `LKR ${doctor.consultationFee.toLocaleString()}` : 'Free'}
              </p>
            </div>

            {/* Availability Summary */}
            {sortedAvail.length > 0 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-xs font-semibold text-emerald-700 mb-2">✓ Available Days</p>
                <div className="flex flex-wrap gap-1">
                  {sortedAvail
                    .filter(s => s.isActive !== false)
                    .map((s, idx) => (
                      <span key={`${s.day}-${idx}`} className="inline-block bg-white border border-emerald-200 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700">
                        {s.day.slice(0, 3)}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Consultation Type</h3>
            <div className="space-y-2">
              {[
                { value: 'online',  label: 'Video Consultation', icon: '📹' },
                { value: 'offline', label: 'In-Person Visit',    icon: '🏥' },
              ].map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-3 cursor-pointer rounded-xl border p-3 transition ${
                    type === opt.value ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                  <input type="radio" name="type" value={opt.value}
                    checked={type === opt.value} onChange={() => setType(opt.value)}
                    className="accent-cyan-600" />
                  <span className="text-sm font-medium text-slate-700">{opt.icon} {opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div className="col-span-2">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Date selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Date *</label>
              {availableDates.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  ⏰ This doctor has not set availability yet. Please check back later or choose another doctor.
                </div>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => { setSelectedDate(e.target.value); setSlot(''); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                  {selectedDate && (
                    <div className="rounded-lg bg-cyan-50 border border-cyan-200 px-3 py-2 text-sm">
                      <p className="font-medium text-cyan-800">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {selectedDaySlot && (
                        <p className="text-xs text-cyan-700 mt-1">
                          🕐 {selectedDaySlot.startTime} — {selectedDaySlot.endTime} ({selectedDaySlot.slotDuration}min slots)
                        </p>
                      )}
                    </div>
                  )}
                  {selectedDate && !getAvailabilityForDate(selectedDate) && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                      ❌ Doctor is not available on this date. Please select another date.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Time slot */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Time Slot * <span className="text-xs font-normal text-slate-500">({selectedDaySlot?.slotDuration}min each)</span>
                </label>
                {timeSlots.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                    ℹ️ No available time slots for this date. Please select another date.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Available times on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map(slot => (
                        <button 
                          type="button" 
                          key={slot} 
                          onClick={() => setSlot(slot)}
                          className={`rounded-xl border-2 py-2 px-3 text-sm font-semibold transition ${
                            selectedSlot === slot
                              ? 'border-cyan-400 bg-cyan-600 text-white shadow-md'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50'
                          }`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit *</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                rows={3} placeholder="Describe your symptoms or reason for consultation..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 resize-none" />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />
              </div>
            </div>

            {/* Summary */}
            {selectedDate && selectedSlot && (
              <div className="rounded-xl bg-cyan-50 border border-cyan-200 px-4 py-3 text-sm">
                <p className="font-semibold text-cyan-800 mb-1">Booking Summary</p>
                <p className="text-cyan-700">📅 <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{selectedSlot}</strong></p>
                <p className="text-cyan-700">👨‍⚕️ {doctor?.name} — {doctor?.specialization}</p>
                <p className="text-cyan-700">💰 {doctor?.consultationFee ? `LKR ${doctor.consultationFee.toLocaleString()}` : 'Free'}</p>
              </div>
            )}

            <button type="submit" disabled={submitting || !selectedDate || !selectedSlot || !reason.trim() || !phone.trim() || !address.trim()}
              className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-semibold text-white hover:bg-cyan-700 transition disabled:opacity-50">
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
