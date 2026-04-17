import { useEffect, useState } from "react";
import { 
  FileText, 
  Activity, 
  Phone, 
  Mail, 
  User as UserIcon,
  Calendar,
  Layers,
  Clock,
  Heart,
  PlusCircle,
  FileUp,
  Settings,
  Sparkles,
  CalendarDays,
  ClipboardList,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { fetchPatientSummary } from "../../services/patientService";
import { getMyAppointments } from "../../services/appointmentApi";
import StatCard from "../../components/common/StatCard";
import AnimatedContainer from "../../components/common/AnimatedContainer";
import { formatDate } from "../../features/patient/patientUtils";
import { staggerContainer, itemVariants } from "../../features/patient/patientAnimations";

import { StatCardSkeleton, CardSectionSkeleton } from "../../components/common/Skeleton";
import HealthInsightCard from "../../components/patient/HealthInsightCard";

// Helper for UI date formatting (from remote logic)
const formatDateForUi = (dateValue) => {
  if (!dateValue) return "";
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return String(dateValue).slice(0, 10);
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
  if (appointment.status === "cancelled") return false;
  const dateTime = getAppointmentDateTime(appointment);
  if (!dateTime) return false;
  const now = new Date();
  const nextThreeDays = new Date(now);
  nextThreeDays.setDate(now.getDate() + 3);
  return dateTime >= now && dateTime <= nextThreeDays;
};

const normalizeAppointment = (appointment) => ({
  id: appointment._id || appointment.id,
  doctorName: appointment.doctorName || appointment.doctor?.name || `Doctor ${appointment.doctorId || ""}`.trim(),
  appointmentDate: formatDateForUi(appointment.appointmentDate),
  appointmentTime: appointment.appointmentTime || "",
  consultationType: appointment.consultationType || "online",
  status: appointment.status || "pending",
});

function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [nextThreeDaysAppointments, setNextThreeDaysAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleDownloadPassport = () => {
    window.print();
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Run both fetches in parallel
        const [summaryRes, appointmentsRes] = await Promise.all([
          fetchPatientSummary(),
          getMyAppointments()
        ]);

        // Process Summary
        setSummary(summaryRes.data.summary);

        // Process Appointments
        const appointments = Array.isArray(appointmentsRes?.data) ? appointmentsRes.data : [];
        const normalized = appointments.map(normalizeAppointment);
        const upcoming = normalized
          .filter(isInNextThreeDays)
          .sort((a, b) => {
            const da = getAppointmentDateTime(a);
            const db = getAppointmentDateTime(b);
            return (da?.getTime() || 0) - (db?.getTime() || 0);
          });

        setAppointmentCount(appointments.length);
        setNextThreeDaysAppointments(upcoming);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
             <div className="h-10 w-64 animate-pulse rounded-xl bg-cyan-200" />
             <div className="h-6 w-96 animate-pulse rounded-xl bg-cyan-100" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CardSectionSkeleton />
          <CardSectionSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AnimatedContainer className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
        <p className="text-sm text-cyan-600">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold text-cyan-700 underline">Try Again</button>
      </AnimatedContainer>
    );
  }

  const patientName = user?.name || summary?.profile?.fullName || "Patient";

  return (
    <AnimatedContainer className="space-y-5 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome back, <span className="text-cyan-600">{patientName}!</span>
          </h1>
          <p className="text-base font-medium text-slate-500">
            Here's what's happening with your health profile today.
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button 
            onClick={handleDownloadPassport}
            className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-700 px-3 py-2 text-sm font-bold text-white transition-all hover:from-cyan-700 hover:to-sky-800 md:flex"
          >
            <FileText className="h-4 w-4" />
            Medical Passport
          </button>
            <div className="hidden h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 md:flex">
              <Heart className="h-4 w-4 fill-current animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-3 md:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Upcoming Appointments" 
            value={appointmentCount} 
            icon={CalendarDays} 
            colorClass="healthBlue"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Medical Reports" 
            value={summary?.counts?.reports ?? 0} 
            icon={FileText} 
            colorClass="bg-cyan-50 text-cyan-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Medical History" 
            value={summary?.counts?.medicalHistory ?? 0} 
            icon={Activity} 
            colorClass="calmGreen"
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        {[
          { label: "Find Doctor", icon: Search, to: "/patient/doctors", color: "from-cyan-600 to-sky-700" },
          { label: "Upload Report", icon: FileUp, to: "/patient/reports", color: "from-sky-600 to-cyan-700" },
          { label: "My Appointments", icon: CalendarDays, to: "/patient/appointments", color: "from-cyan-700 to-sky-800" },
          { label: "Symptom Checker", icon: Sparkles, to: "/patient/symptom-checker", color: "from-sky-700 to-cyan-800" },
          { label: "Profile Settings", icon: Settings, to: "/patient/profile", color: "from-cyan-600 to-sky-700" },
        ].map((action, i) => (
          <Link 
            key={i}
            to={action.to}
            className="group flex items-center gap-4 rounded-xl bg-white p-2 shadow-sm border border-cyan-100 transition-all hover:shadow-md hover:border-cyan-200"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-transform group-hover:scale-110 ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-cyan-700">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
           {/* Upcoming Appointments Section (Unified from Remote) */}
           <div className="group rounded-2xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50/30 p-4 shadow-sm transition-all hover:shadow-md">
             <div className="mb-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
                    <CalendarDays className="h-4 w-4" />
                 </div>
                 <h2 className="text-lg font-bold text-slate-800 tracking-tight">Upcoming Visits</h2>
               </div>
               <Link to="/patient/appointments" className="text-sm font-bold text-cyan-600 hover:underline">View All</Link>
             </div>
             
             {nextThreeDaysAppointments.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 text-center">
                 <p className="text-lg font-medium text-slate-400">No appointments in the next 3 days.</p>
                 <Link to="/patient/doctors" className="mt-2 text-sm font-bold text-cyan-600">Find a doctor &rarr;</Link>
               </div>
             ) : (
               <div className="space-y-2">
                 {nextThreeDaysAppointments.slice(0, 3).map((apt) => (
                   <div key={apt.id} className="flex items-center justify-between rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-2 transition-colors hover:from-sky-100 hover:to-cyan-100">
                     <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-sky-700 shadow-sm font-bold text-white">
                           {apt.doctorName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{apt.doctorName}</p>
                          <p className="text-sm text-slate-500 capitalize">{apt.consultationType} • {apt.appointmentTime}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">{apt.appointmentDate}</p>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">{apt.status}</span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Recent Activity (From Summary) */}
           <div className="group rounded-2xl border border-cyan-200 bg-gradient-to-br from-white to-sky-50/30 p-4 shadow-sm transition-all hover:shadow-md">
             <div className="mb-4 flex items-center justify-between">
               <h2 className="text-lg font-bold text-slate-800 tracking-tight">Medical History</h2>
               <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                  <Activity className="h-4 w-4" />
               </div>
             </div>
             {summary?.latestMedicalHistory ? (
               <div className="space-y-3">
                 <div className="flex items-start gap-4">
                   <div className="h-8 w-8 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 mt-1"><Layers className="h-4 w-4" /></div>
                   <div>
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnosis</p>
                     <p className="text-xl font-bold text-slate-800">{summary.latestMedicalHistory.conditionName}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="h-8 w-8 flex items-center justify-center rounded-full bg-cyan-100 text-cyan-700"><Clock className="h-4 w-4" /></div>
                   <div>
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
                     <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700 capitalize">
                       {summary.latestMedicalHistory.status}
                     </span>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="py-10 text-center">
                 <p className="font-bold text-slate-400 text-lg">No medical history entries</p>
               </div>
             )}
           </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-4 print:hidden">
          <HealthInsightCard />
          
          {/* Latest Uploaded Report Snapshot */}
          <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50/40 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
               <h2 className="text-base font-bold text-slate-800 tracking-tight">Latest Report</h2>
               <FileText className="h-4 w-4 text-cyan-600" />
            </div>
            {summary?.latestReport ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 p-2 border border-cyan-200">
                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{summary.latestReport.title}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{summary.latestReport.reportType || "General Report"}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {formatDate(summary.latestReport.uploadedAt)}</div>
                </div>
              </div>
            ) : (
              <p className="py-4 text-center text-sm font-medium text-slate-400">No reports uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
}

export default DashboardPage;