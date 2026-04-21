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
  Search,
  Stethoscope,
  Video,
  MapPin
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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

const normalizeAppointment = (appointment) => {
  // Extract doctor name from various possible fields
  let doctorName = appointment.doctorName || 
                   appointment.doctor?.name || 
                   appointment.doctor?.fullName ||
                   appointment.doctorFullName ||
                   "Doctor";
  
  // If it's still showing as ID (long string with hyphens), try to get from enriched data
  if (doctorName.length > 30 && (doctorName.includes('-') || doctorName.startsWith('Doctor'))) {
    doctorName = appointment.enrichedDoctorName || "Doctor";
  }

  return {
    id: appointment._id || appointment.id,
    doctorName: doctorName,
    doctorId: appointment.doctorId || appointment.doctor?._id || appointment.doctor?.id,
    specialization: appointment.specialization || appointment.doctor?.specialization || appointment.doctor?.specialty || "General Practitioner",
    appointmentDate: formatDateForUi(appointment.appointmentDate),
    appointmentTime: appointment.appointmentTime || "",
    consultationType: appointment.consultationType || "online",
    status: appointment.status || "pending",
    reason: appointment.reason || appointment.reasonForVisit || "",
    fee: appointment.consultationFee || appointment.fee || 0,
  };
};

const getAppointmentCountdown = (appointment) => {
  const dateTime = getAppointmentDateTime(appointment);
  if (!dateTime) return "";
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const apptDate = new Date(dateTime);
  apptDate.setHours(0, 0, 0, 0);
  
  const diffTime = apptDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getConsultationIcon = (type) => {
  return type === 'online' ? '🎥' : '🏥';
};

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

        // Debug: Log appointment response
        console.log('[Dashboard] Appointments API Response:', appointmentsRes);

        // Process Appointments - handle multiple response formats
        let appointmentList = [];
        if (appointmentsRes?.data?.appointments && Array.isArray(appointmentsRes.data.appointments)) {
          appointmentList = appointmentsRes.data.appointments;
          console.log('[Dashboard] Got appointments from res.data.appointments');
        } else if (appointmentsRes?.data && Array.isArray(appointmentsRes.data)) {
          appointmentList = appointmentsRes.data;
          console.log('[Dashboard] Got appointments from res.data');
        } else if (appointmentsRes?.appointments && Array.isArray(appointmentsRes.appointments)) {
          appointmentList = appointmentsRes.appointments;
          console.log('[Dashboard] Got appointments from res.appointments');
        } else if (Array.isArray(appointmentsRes)) {
          appointmentList = appointmentsRes;
          console.log('[Dashboard] Got appointments from res (array)');
        }
        
        console.log('[Dashboard] Total appointments fetched:', appointmentList.length);
        
        const normalized = appointmentList.map(normalizeAppointment);
        const upcoming = normalized
          .filter(isInNextThreeDays)
          .sort((a, b) => {
            const da = getAppointmentDateTime(a);
            const db = getAppointmentDateTime(b);
            return (da?.getTime() || 0) - (db?.getTime() || 0);
          });

        setAppointmentCount(appointmentList.length);
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
            className="hidden items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-sky-700 px-3 py-2 text-sm font-bold text-white transition-all hover:from-cyan-700 hover:to-sky-800 md:flex"
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
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
        {[
          { label: "Find Doctor", icon: Search, to: "/patient/doctors", color: "from-cyan-600 to-sky-700" },
          { label: "Upload Report", icon: FileUp, to: "/patient/reports", color: "from-sky-600 to-cyan-700" },
          { label: "My Appointments", icon: CalendarDays, to: "/patient/appointments", color: "from-cyan-700 to-sky-800" },
          { label: "Symptom Checker", icon: Sparkles, to: "/patient/symptom-checker", color: "from-sky-700 to-cyan-800" },
          { label: "Personal Medical Records", icon: ClipboardList, to: "/patient/medical-history", color: "from-emerald-600 to-cyan-700", compact: true },
          { label: "Profile Settings", icon: Settings, to: "/patient/profile", color: "from-cyan-600 to-sky-700" },
        ].map((action, i) => (
          <Link 
            key={i}
            to={action.to}
            className={`group flex items-center gap-4 rounded-xl bg-white shadow-sm border border-cyan-100 transition-all hover:shadow-md hover:border-cyan-200 ${action.compact ? 'p-2.5' : 'p-2'}`}
          >
            <div className={`flex ${action.compact ? 'h-9 w-9' : 'h-8 w-8'} shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-white transition-transform group-hover:scale-110 ${action.color}`}>
              <action.icon className={action.compact ? "h-4 w-4" : "h-4 w-4"} />
            </div>
            <div className="min-w-0">
              <span className={`${action.compact ? 'text-sm' : 'text-sm'} font-bold text-slate-700 group-hover:text-cyan-700`}>{action.label}</span>
              {action.compact && (
                <p className="text-[11px] font-medium text-slate-500">View all your records</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
           {/* Enhanced Upcoming Appointments Section */}
           <div className="group rounded-2xl border-2 border-cyan-200 bg-linear-to-br from-white to-cyan-50/40 p-5 shadow-md transition-all hover:shadow-lg">
             <div className="mb-5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="rounded-xl bg-linear-to-br from-cyan-100 to-cyan-50 p-2.5 text-cyan-700">
                    <CalendarDays className="h-5 w-5" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Appointments</h2>
                   <p className="text-xs text-slate-500 mt-0.5">{nextThreeDaysAppointments.length} appointments scheduled</p>
                 </div>
               </div>
               <Link to="/patient/appointments" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 hover:underline transition">
                 View All →
               </Link>
             </div>
             
             {nextThreeDaysAppointments.length === 0 ? (
               <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-cyan-200 bg-cyan-50 py-12 text-center">
                 <p className="mb-3 text-lg font-medium text-slate-400">📅 No appointments in the next 3 days</p>
                 <button
                   onClick={() => navigate('/patient/doctors')}
                   className="text-sm font-bold text-cyan-600 transition hover:text-cyan-700"
                 >
                   Find a doctor →
                 </button>
               </div>
             ) : (
               <div className="space-y-2.5">
                 {nextThreeDaysAppointments.slice(0, 6).map((apt) => {
                   const countdown = getAppointmentCountdown(apt);
                   const icon = getConsultationIcon(apt.consultationType);
                   const isToday = countdown === 'Today';

                   return (
                     <div
                       key={apt.id}
                       className={`group/card overflow-hidden rounded-2xl border-2 p-4 transition-all hover:shadow-lg ${
                         isToday
                           ? 'border-emerald-300 bg-linear-to-br from-emerald-50 via-cyan-50 to-emerald-50 hover:border-emerald-400'
                           : 'border-cyan-200 bg-linear-to-br from-cyan-50 via-sky-50 to-cyan-50 hover:border-cyan-300'
                       }`}
                     >
                       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                         <div className="flex min-w-0 flex-1 items-start gap-4">
                           <div
                             className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-lg font-bold text-white shadow-md ${
                               isToday ? 'from-emerald-500 to-emerald-700' : 'from-cyan-500 to-sky-700'
                             }`}
                           >
                             {apt.doctorName ? apt.doctorName.charAt(0).toUpperCase() : 'D'}
                           </div>

                           <div className="min-w-0 flex-1">
                             <div className="mb-1 flex items-center gap-2">
                               <p className="truncate text-base font-bold text-slate-900">{apt.doctorName || 'Doctor'}</p>
                               <span className="shrink-0 text-lg">{icon}</span>
                             </div>
                             <p className="mb-2 text-xs font-medium text-slate-500">{apt.specialization}</p>
                             <div className="flex flex-wrap items-center gap-3">
                               <div className="flex items-center gap-1 rounded-lg bg-white/60 px-2.5 py-1 text-xs text-slate-600">
                                 <Clock className="h-3.5 w-3.5 text-cyan-600" />
                                 <span className="font-medium">{apt.appointmentTime}</span>
                               </div>
                               <div
                                 className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                                   apt.consultationType === 'online'
                                     ? 'bg-blue-100 text-blue-700'
                                     : 'bg-purple-100 text-purple-700'
                                 }`}
                               >
                                 {apt.consultationType === 'online' ? (
                                   <>
                                     <Video className="h-3.5 w-3.5" /> Video Call
                                   </>
                                 ) : (
                                   <>
                                     <MapPin className="h-3.5 w-3.5" /> Clinic Visit
                                   </>
                                 )}
                               </div>
                             </div>
                           </div>
                         </div>

                         <div className="flex flex-col items-end gap-2">
                           <p className={`text-sm font-bold leading-none ${isToday ? 'text-emerald-700' : 'text-cyan-700'}`}>
                             {countdown}
                           </p>
                           <span
                             className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                               apt.status === 'confirmed'
                                 ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                                 : 'border-orange-300 bg-orange-100 text-orange-700'
                             }`}
                           >
                             {apt.status}
                           </span>
                           <button
                             onClick={() => navigate('/patient/appointments', { state: { selectedAppointmentId: apt.id } })}
                             className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all opacity-0 group-hover/card:opacity-100 ${
                               isToday
                                 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                 : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                             }`}
                             title="View appointment details"
                           >
                             View Details
                           </button>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}

           </div>

        </div>

        {/* Sidebar Insights */}
        <div className="space-y-4 print:hidden">
          <HealthInsightCard />

          {/* Latest Uploaded Report Snapshot */}
          <div className="rounded-2xl border border-cyan-200 bg-linear-to-br from-white to-cyan-50/40 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-slate-800">Latest Report</h2>
              <FileText className="h-4 w-4 text-cyan-600" />
            </div>
            {summary?.latestReport ? (
              <div className="space-y-2">
                <div className="rounded-xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-sky-50 p-2">
                  <p className="line-clamp-1 text-sm font-bold text-slate-800">{summary.latestReport.title}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{summary.latestReport.reportType || "General Report"}</p>
                </div>
                <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> {formatDate(summary.latestReport.uploadedAt)}
                  </div>
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