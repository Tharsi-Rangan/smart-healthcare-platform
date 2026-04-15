import { useEffect, useRef, useState } from "react";
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
import { fetchPatientProfile } from "../services/patientService";

const FILE_BASE_URL = "http://localhost:5002";

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState(user?.name || "Patient");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchPatientProfile();
        const profile = response.data.profile;

        setProfileImage(profile.profileImage || "");
        setProfileName(profile.fullName || user?.name || "Patient");
        setProfileEmail(profile.email || user?.email || "");
        setImageError(false);
      } catch (error) {
        setProfileImage("");
        setProfileName(user?.name || "Patient");
        setProfileEmail(user?.email || "");
        setImageError(false);
      }
    };

    loadProfile();

    const handleProfileUpdated = () => {
      loadProfile();
    };

    window.addEventListener("patient-profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("patient-profile-updated", handleProfileUpdated);
    };
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${FILE_BASE_URL}${imagePath}`;
  };

  const resolvedImage = getImageUrl(profileImage);

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
                  Welcome, {profileName}
                </p>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition hover:border-cyan-300 hover:ring-2 hover:ring-cyan-100"
                >
                  {resolvedImage && !imageError ? (
                    <img
                      src={resolvedImage}
                      alt={profileName}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
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
                        {resolvedImage && !imageError ? (
                          <img
                            src={resolvedImage}
                            alt={profileName}
                            className="h-full w-full object-cover"
                            onError={() => setImageError(true)}
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