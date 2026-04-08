import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/verify-doctors", label: "Verify Doctors", icon: ShieldCheck },
  { to: "/admin/manage-users", label: "Manage Users", icon: Users },
  { to: "/admin/manage-doctors", label: "Manage Doctors", icon: Stethoscope },
];

const getNavItemClassName = ({ isActive }) => {
  if (isActive) {
    return "group flex items-center gap-3 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-sm";
  }

  return "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700";
};

function AdminLayout() {
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
            <p className="mt-1 text-sm text-cyan-700">Admin Portal</p>
          </div>

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
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
              Admin Focus
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Verify doctor profiles regularly to maintain platform trust and quality.
            </p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Admin Dashboard
                </h2>
                <p className="text-sm text-slate-500">
                  Welcome, {user?.name || "Admin"}
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

export default AdminLayout;