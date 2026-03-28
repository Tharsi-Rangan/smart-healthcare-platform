import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

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
        <aside className="w-72 border-r border-slate-200 bg-white p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-cyan-700">
              Smart Healthcare
            </h1>
            <p className="mt-1 text-sm text-slate-500">Patient Portal</p>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            <Link
              to="/patient/dashboard"
              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Dashboard
            </Link>
            <Link
              to="/patient/profile"
              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Profile
            </Link>
            <Link
              to="/patient/medical-history"
              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Medical History
            </Link>
            <Link
              to="/patient/reports"
              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Reports
            </Link>
            <Link
              to="/patient/prescriptions"
              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Prescriptions
            </Link>
            <Link
              to="/patient/appointments"
              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Appointments
            </Link>
            <Link
              to="/patient/notifications"
              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Notifications
            </Link>
          </nav>
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

export default PatientLayout;