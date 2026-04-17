import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAdminDashboardSummary } from "../../api/doctorApi";
import { getAllUsers } from "../../api/adminUserApi";

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [doctorResponse, userResponse] = await Promise.all([
          getAdminDashboardSummary(),
          getAllUsers(),
        ]);

        setSummary(doctorResponse.data?.summary || null);
        setUsers(userResponse.data?.users || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const doctorStats = useMemo(
    () => [
      {
        title: "Total Doctors",
        value: summary?.totalDoctors ?? 0,
        helper: "All registered doctor accounts",
      },
      {
        title: "Approved Doctors",
        value: summary?.approvedDoctors ?? 0,
        helper: "Doctors verified by admin",
      },
      {
        title: "Pending Reviews",
        value: summary?.pendingDoctors ?? 0,
        helper: "Profiles waiting for approval",
      },
      {
        title: "Availability Slots",
        value: summary?.totalAvailabilitySlots ?? 0,
        helper: "Configured doctor schedules",
      },
    ],
    [summary]
  );

  const userStats = useMemo(
    () => [
      {
        title: "Patients",
        value: users.filter((u) => u.role === "patient").length,
      },
      {
        title: "Doctors",
        value: users.filter((u) => u.role === "doctor").length,
      },
      {
        title: "Admins",
        value: users.filter((u) => u.role === "admin").length,
      },
      {
        title: "Active Accounts",
        value: users.filter((u) => u.accountStatus === "active").length,
      },
    ],
    [users]
  );

  const quickActions = [
    {
      title: "Verify Doctors",
      description: "Approve or reject doctor registrations.",
      to: "/admin/verify-doctors",
    },
    {
      title: "Manage Doctors",
      description: "Monitor doctor records and account activity.",
      to: "/admin/manage-doctors",
    },
    {
      title: "Manage Patients",
      description: "Review patient, doctor, and admin accounts.",
      to: "/admin/manage-users",
    },
    {
      title: "Transactions",
      description: "Access payment monitoring section.",
      to: "/admin/transactions",
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading admin dashboard...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="space-y-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[34px] border border-cyan-200/30 bg-gradient-to-br from-cyan-600 via-sky-700 to-cyan-700 text-white shadow-xl shadow-cyan-500/20"
      >
        {/* Abstract shapes for premium depth */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-20 h-24 w-24 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-8 px-8 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-100">
              Platform Administration
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50">
              Monitor doctor approvals, manage platform users, and control key
              admin actions from one connected dashboard.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-xs text-cyan-100">Pending Reviews</p>
            <p className="mt-1 text-3xl font-bold">
              {summary?.pendingDoctors ?? 0}
            </p>
          </div>
        </div>
      </motion.section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600 shadow-sm">
          {error}
        </div>
      )}

      <motion.section variants={itemVariants} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Doctor Summary</h2>
          <p className="text-xs text-slate-500">
            Main doctor-related statistics in the platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {doctorStats.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.title}
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                {item.value}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {item.helper}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="space-y-4"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Summary</h2>
          <p className="mt-1 text-slate-500">
            Overview of account roles related to admin management.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {userStats.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.title}
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                {item.value}
              </h3>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="rounded-[30px] border border-slate-200/50 bg-white/60 p-8 shadow-sm backdrop-blur-xl"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <p className="text-xs text-slate-500">
            Open the main admin pages used in your module.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md"
            >
              <p className="text-base font-semibold text-slate-900">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
              <div className="mt-3">
                <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 transition group-hover:bg-cyan-100">
                  Open
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>
    </motion.div>
    </div>
  );
}

export default DashboardPage;