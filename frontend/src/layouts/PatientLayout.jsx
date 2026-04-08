import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Pill,
  UserRound,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

const patientNavItems = [
  { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/profile", label: "Profile", icon: UserRound },
  { to: "/patient/medical-history", label: "Medical History", icon: HeartPulse },
  { to: "/patient/reports", label: "Reports", icon: FileText },
  { to: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
  { to: "/patient/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/patient/notifications", label: "Notifications", icon: Bell },
];

const getNavItemClassName = ({ isActive }) => {
  if (isActive) {
    return "group flex items-center gap-3 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-sm";
  }

  return "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700";
};

function PatientLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white px-4 py-5">
          <div className="mb-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
            <p className="text-lg font-bold text-cyan-900">Smart Healthcare</p>
            <p className="mt-1 text-sm text-cyan-700">Patient Portal</p>
          </div>

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {patientNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.to} to={item.to} className={getNavItemClassName}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Quick Tip
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Use Appointments to manage upcoming visits and reschedules quickly.
            </p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Patient Dashboard
                </h2>
                <p className="text-sm text-slate-500">
                  Welcome, {user?.name || "Patient"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default PatientLayout;