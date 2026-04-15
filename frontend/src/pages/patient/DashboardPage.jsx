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
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../features/auth/AuthContext";
import { fetchPatientSummary } from "../../services/patientService";
import StatCard from "../../components/common/StatCard";
import AnimatedContainer from "../../components/common/AnimatedContainer";
import { formatDate } from "../../features/patient/patientUtils";
import { staggerContainer, itemVariants } from "../../features/patient/patientAnimations";
import { Link } from "react-router-dom";

function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetchPatientSummary();
        setSummary(response.data.summary);
      } catch (err) {
        setError(err.message || "Failed to load patient summary");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500"></div>
          <div className="text-base font-medium text-slate-500">Loading your health dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AnimatedContainer className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </AnimatedContainer>
    );
  }

  const patientName = user?.name || summary?.profile?.fullName || "Patient";

  return (
    <AnimatedContainer className="space-y-10 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome back, <span className="text-sky-600">{patientName}!</span>
          </h1>
          <p className="text-lg font-medium text-slate-500">
            Here's what's happening with your health profile today.
          </p>
        </div>
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 md:flex">
          <Heart className="h-6 w-6 fill-current animate-pulse" />
        </div>
      </div>

      {/* Stats Grid with Staggered Entrance */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-6 md:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Medical History" 
            value={summary?.counts?.medicalHistory ?? 0} 
            icon={Activity} 
            colorClass="healthBlue"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Medical Reports" 
            value={summary?.counts?.reports ?? 0} 
            icon={FileText} 
            colorClass="bg-blue-50 text-blue-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Blood Group" 
            value={summary?.profile?.bloodGroup || "--"} 
            icon={Layers} 
            colorClass="calmGreen"
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions - Good for Seniors & Easy Navigation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "New Condition", icon: PlusCircle, to: "/patient/medical-history", color: "bg-emerald-500" },
          { label: "Upload Report", icon: FileUp, to: "/patient/reports", color: "bg-sky-500" },
          { label: "Profile Settings", icon: Settings, to: "/patient/profile", color: "bg-slate-700" },
          { label: "Emergency Help", icon: Phone, to: "#", color: "bg-rose-500" },
        ].map((action, i) => (
          <Link 
            key={i}
            to={action.to}
            className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110 ${action.color}`}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-slate-900">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Snapshot */}
        <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Personal Details</h2>
            <div className="rounded-2xl bg-slate-50 p-3 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
               <UserIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><UserIcon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</p>
                <p className="text-lg font-semibold text-slate-700">{summary?.profile?.fullName || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><Mail className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                <p className="text-lg font-semibold text-slate-700">{summary?.profile?.email || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><Phone className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                <p className="text-lg font-semibold text-slate-700">{summary?.profile?.phone || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Medical History */}
        <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Activity</h2>
            <div className="rounded-2xl bg-emerald-50 p-3 group-hover:bg-emerald-100 transition-colors">
               <Activity className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          {summary?.latestMedicalHistory ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mt-1"><Layers className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnosis</p>
                  <p className="text-xl font-bold text-slate-800">{summary.latestMedicalHistory.conditionName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><Clock className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 capitalize">
                    {summary.latestMedicalHistory.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><Calendar className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Recorded</p>
                  <p className="text-lg font-semibold text-slate-700">{formatDate(summary.latestMedicalHistory.diagnosisDate)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-slate-50 text-slate-200">
                <Activity className="h-10 w-10" />
              </div>
              <p className="font-bold text-slate-400 text-lg">No medical history entries</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
}

export default DashboardPage;