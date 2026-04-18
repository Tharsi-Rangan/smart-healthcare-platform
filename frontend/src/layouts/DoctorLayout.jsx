import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function DoctorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/doctor/dashboard", label: "Dashboard" },
    { to: "/doctor/profile", label: "Profile" },
    { to: "/doctor/appointments", label: "Appointments" },
    { to: "/doctor/availability", label: "Availability" },
    { to: "/doctor/prescriptions", label: "Prescriptions" },
    { to: "/doctor/reports", label: "Reports" },
    { to: "/doctor/consultations", label: "Consultations" },
  ];

  const navClass = ({ isActive }) =>
    `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
      ? "bg-cyan-700 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const pageTitleMap = {
    "/doctor/dashboard": "Dashboard",
    "/doctor/profile": "Profile",
    "/doctor/appointments": "Appointments",
    "/doctor/availability": "Availability",
    "/doctor/prescriptions": "Prescriptions",
    "/doctor/reports": "Reports",
    "/doctor/consultations": "Consultations",
  };

  const pageTitle = pageTitleMap[location.pathname] || "Doctor Panel";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Smart Healthcare
            </p>
            <h1 className="mt-2 text-xl font-bold text-slate-900">
              Doctor Panel
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your clinical workflow
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Logged in as
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {user?.name || "Doctor"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Doctor workspace access
              </p>

              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {pageTitle}
                </h2>
                <p className="text-sm text-slate-500">
                  Welcome back, {user?.name || "Doctor"}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DoctorLayout;