import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { getDoctorAppointments } from "../../services/appointmentApi";

const formatDateForUi = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue).slice(0, 10);
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getAppointmentDateTime = (appointment) => {
  const datePart = formatDateForUi(appointment.appointmentDate);
  const timePart = appointment.appointmentTime || "00:00";
  const dateTime = new Date(`${datePart}T${timePart}:00`);

  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
};

const isInNextThreeDays = (appointment) => {
  if (appointment.status === "cancelled") {
    return false;
  }

  const dateTime = getAppointmentDateTime(appointment);

  if (!dateTime) {
    return false;
  }

  const now = new Date();
  const nextThreeDays = new Date(now);
  nextThreeDays.setDate(now.getDate() + 3);

  return dateTime >= now && dateTime <= nextThreeDays;
};

const normalizeAppointment = (appointment) => ({
  id: appointment._id || appointment.id,
  patientName:
    appointment.patientName ||
    appointment.patient?.name ||
    `Patient ${appointment.patientId || ""}`.trim(),
  appointmentDate: formatDateForUi(appointment.appointmentDate),
  appointmentTime: appointment.appointmentTime || "",
  consultationType: appointment.consultationType || "online",
  status: appointment.status || "pending",
});

function DashboardPage() {
  const [todayAppointmentCount, setTodayAppointmentCount] = useState(0);
  const [nextThreeDaysAppointments, setNextThreeDaysAppointments] = useState([]);

  useEffect(() => {
    const loadDoctorAppointments = async () => {
      try {
        const response = await getDoctorAppointments();
        const appointments = Array.isArray(response?.data) ? response.data : [];
        const normalizedAppointments = appointments.map(normalizeAppointment);

        const today = new Date();
        const todayLabel = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const todayAppointments = normalizedAppointments.filter(
          (appointment) =>
            appointment.appointmentDate === todayLabel &&
            appointment.status !== "cancelled"
        );

        const upcomingAppointments = normalizedAppointments
          .filter(isInNextThreeDays)
          .sort((first, second) => {
            const firstDateTime = getAppointmentDateTime(first);
            const secondDateTime = getAppointmentDateTime(second);

            if (!firstDateTime || !secondDateTime) {
              return 0;
            }

            return firstDateTime.getTime() - secondDateTime.getTime();
          });

        setTodayAppointmentCount(todayAppointments.length);
        setNextThreeDaysAppointments(upcomingAppointments);
      } catch {
        setTodayAppointmentCount(0);
        setNextThreeDaysAppointments([]);
      }
    };

    loadDoctorAppointments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of appointments, consultations, and reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Today’s Appointments</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">{todayAppointmentCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Pending Reports</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">04</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Issued Prescriptions</h2>
          <p className="mt-3 text-3xl font-bold text-cyan-700">16</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800">
            <CalendarDays size={18} className="text-cyan-700" />
            Upcoming Appointments
          </h2>
          <Link
            to="/doctor/appointments"
            className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
          >
            View All
          </Link>
        </div>

        {nextThreeDaysAppointments.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming appointments for the next 3 days.</p>
        ) : (
          <div className="space-y-3">
            {nextThreeDaysAppointments.slice(0, 4).map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-800">{appointment.patientName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {appointment.appointmentDate} at {appointment.appointmentTime} ({appointment.consultationType})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Today’s Schedule</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your consultation schedule will appear here.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;