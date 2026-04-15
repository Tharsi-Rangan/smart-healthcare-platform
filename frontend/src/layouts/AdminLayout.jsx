import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

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
      icon: "◫",
      description: "Overview",
    },
    {
      to: "/admin/verify-doctors",
      label: "Verify Doctors",
      icon: "🛡",
      description: "Approvals",
    },
    {
      to: "/admin/manage-doctors",
      label: "Manage Doctors",
      icon: "🩺",
      description: "Doctor records",
    },
    {
      to: "/admin/manage-users",
      label: "Manage Users",
      icon: "👥",
      description: "User accounts",
    },
    {
      to: "/admin/transactions",
      label: "Transactions",
      icon: "💳",
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
    `group flex items-center gap-4 rounded-[20px] px-4 py-4 transition ${
      isActive
        ? "bg-cyan-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="flex w-77.5 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-600 to-sky-700 text-2xl text-white shadow-sm">
                ⛑
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  HealthConnect
                </h1>
                <p className="text-sm text-slate-500">Admin Console</p>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-lg font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-sm text-slate-500">Administrator</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-3 px-4 py-6">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700 group-hover:bg-white"
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-xs ${
                          isActive ? "text-cyan-100" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 px-4 py-6">
            <button
              onClick={handleLogout}
              type="button"
              className="flex w-full items-center gap-4 rounded-[20px] px-4 py-4 text-left transition hover:bg-rose-50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-lg text-rose-600">
                ↪
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Logout</p>
                <p className="text-xs text-slate-500">End current session</p>
              </div>
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-8 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Administration
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {currentTitle}
                </h2>
              </div>

              <div className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-600 text-sm font-semibold text-white">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>

                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-8 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;