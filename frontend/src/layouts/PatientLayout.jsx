import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { fetchPatientProfile } from "../services/patientService";

function PatientLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState(user?.name || "Patient");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const menuRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchPatientProfile();
        const profile = response.data.profile;

        setProfileImage(profile.profileImage || "");
        setProfileName(profile.fullName || user?.name || "Patient");
        setProfileEmail(profile.email || user?.email || "");
      } catch (error) {
        setProfileImage("");
        setProfileName(user?.name || "Patient");
        setProfileEmail(user?.email || "");
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "P";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
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
                  Welcome, {profileName}
                </p>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition hover:border-cyan-300 hover:ring-2 hover:ring-cyan-100"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={profileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-cyan-700">
                      {getInitials(profileName)}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-14 z-20 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={profileName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-cyan-700">
                            {getInitials(profileName)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {profileName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {profileEmail}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/patient/profile");
                        }}
                        className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
                      >
                        My Profile
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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