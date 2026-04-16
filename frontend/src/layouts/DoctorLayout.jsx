import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { useEffect, useRef, useState } from "react";

function DoctorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/doctor/dashboard",
      label: "Dashboard",
      icon: "◫",
      description: "Overview",
    },
    {
      to: "/doctor/profile",
      label: "My Profile",
      icon: "○",
      description: "Professional details",
    },
    {
      to: "/doctor/appointments",
      label: "Appointments",
      icon: "⌑",
      description: "Requests and status",
    },
    {
      to: "/doctor/availability",
      label: "Availability",
      icon: "◔",
      description: "Schedule management",
    },
    {
      to: "/doctor/prescriptions",
      label: "Prescriptions",
      icon: "⚕",
      description: "Digital prescriptions",
    },
    {
      to: "/doctor/consultation",
      label: "Consultation",
      icon: "✦",
      description: "Session workflow",
    },
    {
      to: "/doctor/reports",
      label: "Patient Reports",
      icon: "▤",
      description: "Medical records",
    },
  ];

  const pageTitleMap = {
    "/doctor/dashboard": "Doctor Dashboard",
    "/doctor/profile": "My Profile",
    "/doctor/appointments": "Appointments",
    "/doctor/availability": "Availability",
    "/doctor/prescriptions": "Prescriptions",
    "/doctor/consultation": "Consultation",
    "/doctor/reports": "Patient Reports",
  };

  const currentTitle = pageTitleMap[location.pathname] || "Doctor Panel";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#1e293b]">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-77.5 flex flex-col border-r border-[#e2e8f0] bg-white overflow-y-auto z-50">
          <div className="border-b border-[#e2e8f0] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#0891b2] to-[#06b6d4] text-xl text-white shadow-sm">
                ⛑
              </div>

              <div>
                <h1 className="text-sm font-bold tracking-tight text-[#1e293b]">
                  HealthConnect
                </h1>
                <p className="text-xs text-slate-500">Doctor Workspace</p>
              </div>
            </div>
          </div>

          <div className="border-b border-[#e2e8f0] px-5 py-3">
            <div className="rounded-2xl bg-[#f8fafb] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0891b2] text-xs font-semibold text-white shadow-sm">
                  {user?.name?.[0]?.toUpperCase() || "D"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#1e293b]">
                    {user?.name || "Doctor User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "Doctor"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {({ isActive }) => (
                  <div
                    className="group flex items-center gap-3 rounded-lg px-3 py-3 transition"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #0891b2, #06b6d4)"
                        : "transparent",
                      color: isActive ? "#ffffff" : "#475569",
                      boxShadow: isActive ? "0 4px 12px rgba(8,145,178,0.15)" : "none",
                    }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs"
                      style={{
                        backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "#f8fafb",
                        color: isActive ? "#ffffff" : "#1e293b",
                      }}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color: isActive ? "#ffffff" : "#1e293b",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: isActive ? "rgba(255,255,255,0.82)" : "#64748b",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-[#e2e8f0] px-3 py-4">
            <button
              onClick={handleLogout}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-rose-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-xs text-rose-600">
                ↪
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Logout</p>
                <p className="text-xs text-slate-500">End session</p>
              </div>
            </button>
          </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-77.5 min-h-screen">
        <header className="border-b border-[#e2e8f0] bg-white px-6 py-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Doctor Panel
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-[#1e293b]">
                  {currentTitle}
                </h2>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setOpenProfileMenu((prev) => !prev)}
                  className="flex items-center gap-4 rounded-[22px] border border-[#e2e8f0] bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0891b2] text-sm font-semibold text-white">
                    {user?.name?.[0]?.toUpperCase() || "D"}
                  </div>

                  <div className="text-left leading-tight">
                    <p className="text-sm font-semibold text-[#1e293b]">
                      {user?.name || "Doctor User"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.role
                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        : "Doctor"}
                    </p>
                  </div>

                  <span
                    className={`text-xs text-slate-500 transition ${
                      openProfileMenu ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {openProfileMenu && (
                  <div className="absolute right-0 top-18 z-50 w-72.5 rounded-3xl border border-[#e2e8f0] bg-white p-4 shadow-2xl">
                    <div className="rounded-[20px] bg-[#f8fafb] p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0891b2] text-lg font-semibold text-white">
                          {user?.name?.[0]?.toUpperCase() || "D"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-[#1e293b]">
                            {user?.name || "Doctor User"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {user?.role
                              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                              : "Doctor"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="my-4 border-t border-[#e2e8f0]" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left transition hover:bg-rose-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        ↪
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1e293b]">
                          Logout
                        </p>
                        <p className="text-xs text-slate-500">
                          End current session
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 px-8 py-8">
            <Outlet />
          </main>
      </div>
    </div>
  );
}

export default DoctorLayout;