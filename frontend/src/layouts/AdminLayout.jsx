import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import NotificationBell from "../components/common/NotificationBell";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: "Overview",
    },
    {
      to: "/admin/manage-doctors",
      label: "Manage Doctors",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: "Doctor records",
    },
    {
      to: "/admin/manage-users",
      label: "Manage Patients",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      description: "User accounts",
    },
    {
      to: "/admin/transactions",
      label: "Transactions",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: "Payments",
    },
  ];

  const pageTitleMap = {
    "/admin": "Admin Dashboard",
    "/admin/dashboard": "Admin Dashboard",
    "/admin/verify-doctors": "Verify Doctors",
    "/admin/manage-doctors": "Manage Doctors",
    "/admin/manage-users": "Manage Users",
    "/admin/transactions": "Transactions",
  };

  const currentTitle = pageTitleMap[location.pathname] || "Admin Panel";

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
                ADMIN CONSOLE
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-sm font-semibold text-white shadow-md shadow-cyan-500/25">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
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
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-[11px] ${
                        isActive ? "text-cyan-100" : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-8 rounded-full bg-white/40 shadow-sm"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-slate-100 px-3 py-4 mt-2">
          <button
            onClick={handleLogout}
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-rose-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Administration
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
                {currentTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell role="admin" />
              
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5 border border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-xs font-semibold text-white shadow-md shadow-cyan-500/25">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="leading-tight hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-[10px] text-slate-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          <div className="app-main-surface p-4 md:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;