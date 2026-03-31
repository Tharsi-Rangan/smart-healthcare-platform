import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Pill,
  Search,
  Sparkles,
} from "lucide-react";
import { getMyAppointments } from "../../services/appointmentApi";

function DashboardPage() {
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [appointmentLoadError, setAppointmentLoadError] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setAppointmentLoadError(false);
        const response = await getMyAppointments();
        const appointments = Array.isArray(response?.data) ? response.data : [];

        setAppointmentCount(appointments.length);
      } catch {
        setAppointmentLoadError(true);
        setAppointmentCount(0);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Patient Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Here is your healthcare summary and quick access panel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50 via-white to-cyan-100/40 p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-cyan-100 p-2 text-cyan-700">
            <CalendarDays size={18} />
          </div>
          <p className="text-sm font-medium text-slate-600">Upcoming Appointments</p>
          <p className="mt-3 text-4xl font-bold text-cyan-700">{appointmentCount}</p>
          <p className="mt-2 text-xs text-slate-500">Live count from appointment service</p>
          {appointmentLoadError && <p className="mt-2 text-xs text-amber-600">Unable to load live appointment count.</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2 text-slate-700">
            <FileText size={18} />
          </div>
          <p className="text-sm font-medium text-slate-600">Medical Reports</p>
          <p className="mt-3 text-4xl font-bold text-slate-800">12</p>
          <p className="mt-2 text-xs text-slate-500">Available in your records</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2 text-slate-700">
            <Pill size={18} />
          </div>
          <p className="text-sm font-medium text-slate-600">Prescriptions</p>
          <p className="mt-3 text-4xl font-bold text-slate-800">05</p>
          <p className="mt-2 text-xs text-slate-500">Recent prescription updates</p>
        </div>
      </div>

      <div className="rounded-2xl bg-linear-to-r from-cyan-700 to-sky-600 p-6 text-white shadow-md">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100">
          <Sparkles size={16} />
          Today Highlight
        </p>
        <h2 className="mt-1 text-2xl font-bold">Manage appointments faster</h2>
        <p className="mt-2 max-w-2xl text-sm text-cyan-100">
          Book a new slot, review upcoming consultations, and reschedule in one place.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/doctors"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
          >
            Find Doctors
          </Link>
          <Link
            to="/patient/appointments"
            className="rounded-xl border border-cyan-200/70 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Open My Appointments
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/book-appointment"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-base font-semibold text-slate-800">Book Appointment</p>
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            <Search size={14} />
            Action
          </p>
          <p className="mt-1 text-sm text-slate-500">Choose doctor, date, and time.</p>
        </Link>

        <Link
          to="/patient/appointments"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            <ClipboardList size={14} />
            Action
          </p>
          <p className="text-base font-semibold text-slate-800">Manage Appointments</p>
          <p className="mt-1 text-sm text-slate-500">Cancel or reschedule quickly.</p>
        </Link>

        <Link
          to="/patient/reports"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            <FileText size={14} />
            Action
          </p>
          <p className="text-base font-semibold text-slate-800">Medical Reports</p>
          <p className="mt-1 text-sm text-slate-500">Track your report history.</p>
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;