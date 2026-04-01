import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function DoctorLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-cyan-50 text-cyan-700 font-semibold"
        : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-cyan-700">
              Smart Healthcare
            </h1>
            <p className="mt-1 text-sm text-slate-500">Doctor Portal</p>
          </div>

          <nav className="space-y-2">
            <NavLink to="/doctor/dashboard" className={navItemClass}>
              Dashboard
            </NavLink>

            <NavLink to="/doctor/profile" className={navItemClass}>
              Profile
            </NavLink>

            <NavLink to="/doctor/availability" className={navItemClass}>
              Availability
            </NavLink>

            <NavLink to="/doctor/appointments" className={navItemClass}>
              Appointments
            </NavLink>

            <NavLink to="/doctor/reports" className={navItemClass}>
              Reports
            </NavLink>

            <NavLink to="/doctor/prescriptions" className={navItemClass}>
              Prescriptions
            </NavLink>
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Doctor Dashboard
                </h2>
                <p className="text-sm text-slate-500">
                  Welcome, {user?.name || "Doctor"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
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

export default DoctorLayout;