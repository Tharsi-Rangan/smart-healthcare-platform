import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';

/**
 * User-friendly time picker component
 * Shows hours, minutes, and AM/PM with visual controls
 */
export function TimePickerInput({ value, onChange, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('09');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState('AM');
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  // Parse initial time value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hour = parseInt(h);
      const is24Hour = true; // HTML time input uses 24-hour format
      
      let displayHour = hour;
      let displayPeriod = 'AM';

      if (hour >= 12) {
        displayPeriod = 'PM';
        if (hour > 12) displayHour = hour - 12;
      } else if (hour === 0) {
        displayHour = 12;
      }

      setHours(String(displayHour).padStart(2, '0'));
      setMinutes(m || '00');
      setPeriod(displayPeriod);
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Convert to 24-hour format for HTML input
  const get24HourFormat = () => {
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${minutes}`;
  };

  // Handle time update
  const updateTime = () => {
    const timeValue = get24HourFormat();
    onChange(timeValue);
    setIsOpen(false);
  };

  // Handle increment/decrement
  const incrementHour = () => {
    let hour = parseInt(hours) + 1;
    if (hour > 12) hour = 1;
    setHours(String(hour).padStart(2, '0'));
  };

  const decrementHour = () => {
    let hour = parseInt(hours) - 1;
    if (hour < 1) hour = 12;
    setHours(String(hour).padStart(2, '0'));
  };

  const incrementMinute = () => {
    let minute = parseInt(minutes) + 15;
    if (minute >= 60) minute = 0;
    setMinutes(String(minute).padStart(2, '0'));
  };

  const decrementMinute = () => {
    let minute = parseInt(minutes) - 15;
    if (minute < 0) minute = 45;
    setMinutes(String(minute).padStart(2, '0'));
  };

  const togglePeriod = () => {
    setPeriod(period === 'AM' ? 'PM' : 'AM');
  };

  const displayValue = value
    ? `${hours}:${minutes} ${period}`
    : 'Select time';

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-600">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={inputRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white flex items-center justify-between hover:border-slate-300"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            {displayValue}
          </span>
        </button>

        {/* Time Picker Dropdown */}
        {isOpen && (
          <div
            ref={pickerRef}
            className="absolute right-0 top-12 z-50 rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="p-4">
              {/* Header */}
              <div className="mb-4 border-b border-slate-200 pb-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Select Time
                </p>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {hours}:{minutes} <span className="text-lg text-slate-600">{period}</span>
                </div>
              </div>

              {/* Time Controls */}
              <div className="flex gap-4">
                {/* Hours */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-medium uppercase text-slate-500">Hour</p>
                  <button
                    type="button"
                    onClick={incrementHour}
                    className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <div className="flex h-12 w-14 items-center justify-center rounded-lg border-2 border-cyan-500 bg-cyan-50 text-lg font-bold text-slate-900">
                    {hours}
                  </div>
                  <button
                    type="button"
                    onClick={decrementHour}
                    className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center text-2xl font-bold text-slate-300">:</div>

                {/* Minutes */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-medium uppercase text-slate-500">Min</p>
                  <button
                    type="button"
                    onClick={incrementMinute}
                    className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <div className="flex h-12 w-14 items-center justify-center rounded-lg border-2 border-cyan-500 bg-cyan-50 text-lg font-bold text-slate-900">
                    {minutes}
                  </div>
                  <button
                    type="button"
                    onClick={decrementMinute}
                    className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>

                {/* AM/PM Toggle */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-medium uppercase text-slate-500">Period</p>
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className={`rounded-lg px-3 py-2 font-semibold transition ${
                      period === 'AM'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className={`rounded-lg px-3 py-2 font-semibold transition ${
                      period === 'PM'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="mb-2 text-xs font-medium uppercase text-slate-500">
                  Quick Select
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Morning', h: '09', m: '00' },
                    { label: 'Noon', h: '12', m: '00' },
                    { label: 'Afternoon', h: '02', m: '00' },
                    { label: 'Evening', h: '05', m: '00' },
                    { label: 'Night', h: '08', m: '00' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setHours(preset.h);
                        setMinutes(preset.m);
                        setPeriod(preset.h < '12' ? 'AM' : 'PM');
                      }}
                      className="rounded-lg bg-slate-100 px-2 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateTime}
                  className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  Set Time
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimePickerInput;
