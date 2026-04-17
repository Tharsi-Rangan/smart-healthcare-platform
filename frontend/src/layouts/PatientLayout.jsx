import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Search,
  Sparkles,
  Video,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { fetchPatientProfile } from "../services/patientService";
import NotificationBell from "../components/common/NotificationBell";

const FILE_BASE_URL = "http://localhost:5002";

const patientNavItems = [
  { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/doctors", label: "Find Doctors", icon: Search },
  { to: "/patient/appointments", label: "My Appointments", icon: CalendarDays },
  { to: "/patient/medical-history", label: "Medical Records", icon: FileText },
  { to: "/patient/symptom-checker", label: "Symptom Checker", icon: Sparkles },
  { to: "/patient/consultation", label: "Video Consultation", icon: Video },
  { to: "/patient/payments", label: "Payments", icon: CreditCard },
  { to: "/patient/notifications", label: "Notifications", icon: Bell },
];

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

  const navClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-cyan-600 to-sky-700 text-white shadow-md shadow-cyan-500/20"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-sky-50/30 text-slate-800">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col bg-white border-r border-slate-200 overflow-y-auto z-50 shadow-lg shadow-slate-200/50">
        {/* Logo Area */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-sky-700 text-white shadow-lg shadow-cyan-500/25">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                HealthConnect
              </h1>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide">
                PATIENT PORTAL
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-white shadow-md shadow-cyan-500/25">
                {resolvedImage && !imageError ? (
                  <img
                    src={resolvedImage}
                    alt={profileName}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {getInitials(profileName)}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {profileName}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Patient
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {patientNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-slate-500 group-hover:text-cyan-600"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-white" : "text-slate-700"
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 rounded-full bg-white/40 shadow-sm"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-slate-100 px-3 py-4 mt-2">
          <button
            onClick={handleLogout}
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-rose-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-all">
              <LogOut size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700 group-hover:text-rose-600 transition-colors">
                Logout
              </p>
              <p className="text-[11px] text-slate-400">End session</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-72 min-h-screen">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Patient Portal
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
                Welcome Back, {profileName.split(" ")[0]}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationBell role="patient" />

              {/* Profile Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 transition-all hover:bg-slate-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-white shadow-md shadow-cyan-500/25">
                    {resolvedImage && !imageError ? (
                      <img
                        src={resolvedImage}
                        alt={profileName}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-xs font-semibold">
                        {getInitials(profileName)}
                      </span>
                    )}
                  </div>

                  <div className="text-left leading-tight hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900">
                      {profileName}
                    </p>
                    <p className="text-[10px] text-slate-500">Patient</p>
                  </div>

                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-white shadow-md shadow-cyan-500/25">
                          {resolvedImage && !imageError ? (
                            <img
                              src={resolvedImage}
                              alt={profileName}
                              className="h-full w-full object-cover"
                              onError={() => setImageError(true)}
                            />
                          ) : (
                            <span className="text-base font-semibold">
                              {getInitials(profileName)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {profileName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {profileEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/patient/profile");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          View Profile
                        </p>
                        <p className="text-xs text-slate-400">
                          Manage your account
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-rose-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                        <LogOut size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-rose-600">
                          Logout
                        </p>
                        <p className="text-xs text-slate-400">
                          End current session
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-6">
          <div className="app-main-surface p-4 md:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;