import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function DoctorLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-5 py-4 text-[15px] font-medium transition ${isActive
      ? "bg-cyan-100 text-cyan-700"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="flex w-[290px] flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-7 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-xl text-white">
              ⛑
            </div>
            <h1 className="text-[18px] font-bold text-slate-900">HealthConnect</h1>
          </div>

          <nav className="flex-1 space-y-3 px-4 py-6">
            <NavLink to="/doctor/dashboard" className={navClass}>
              <span>◫</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/doctor/profile" className={navClass}>
              <span>◌</span>
              <span>My Profile</span>
            </NavLink>

            <NavLink to="/doctor/appointments" className={navClass}>
              <span>🗓</span>
              <span>Appointments</span>
            </NavLink>

            <NavLink to="/doctor/availability" className={navClass}>
              <span>◔</span>
              <span>Availability</span>
            </NavLink>

            <NavLink to="/doctor/prescriptions" className={navClass}>
              <span>🎥</span>
              <span>Prescriptions</span>
            </NavLink>

            <NavLink to="/doctor/consultation" className={navClass}>
              <span>🎥</span>
              <span>Consultation</span>
            </NavLink>
            
            <NavLink to="/doctor/reports" className={navClass}>
              <span>🧾</span>
              <span>Patient Reports</span>
            </NavLink>
          </nav>

          <div className="space-y-2 border-t border-slate-200 px-4 py-6">
            <button className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-[15px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <span>⚙</span>
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-[15px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <span>↪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-end border-b border-slate-200 bg-white px-10 py-5">
            <div className="flex items-center gap-6">
              <div className="relative text-xl text-slate-500">
                🔔
                <span className="absolute -right-1 top-0 h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-lg font-semibold text-white">
                  {user?.name?.[0] || "D"}
                </div>

                <div className="leading-tight">
                  <p className="text-[17px] font-semibold text-slate-900">
                    {user?.name || "Doctor User"}
                  </p>
                  <p className="text-sm text-slate-500">Doctor</p>
                </div>

                <span className="text-slate-500">⌄</span>
              </div>
            </div>
          </header>

          <main className="flex-1 px-10 py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DoctorLayout;