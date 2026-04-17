import { Outlet, Link, useLocation } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

function PublicLayout() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"].includes(
    location.pathname
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold text-cyan-700">
            Smart Healthcare Platform
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <Link to="/" className="transition hover:text-cyan-700">
              Home
            </Link>
            <Link to="/about" className="transition hover:text-cyan-700">
              About
            </Link>
            <Link to="/doctors" className="transition hover:text-cyan-700">
              Find Doctors
            </Link>
            <Link to="/login" className="transition hover:text-cyan-700">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-cyan-700 px-4 py-2 text-white transition hover:bg-cyan-600"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="w-full flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className={isAuthPage ? "" : "app-main-surface p-5 md:p-7"}>
            <Outlet />
          </div>
        </div>
      </main>

      {!isAuthPage && (
        <footer className="border-t border-slate-200 bg-linear-to-b from-white to-slate-50/80">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
            <div className="max-w-md space-y-3">
              <p className="text-xl font-semibold text-cyan-700">Smart Healthcare Platform</p>
              <p className="text-sm leading-7 text-slate-600">
                Trusted digital healthcare for appointments, consultations, and connected patient care.
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Reliable. Secure. Patient-Centered.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Links</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                <Link to="/" className="transition hover:text-cyan-700">Home</Link>
                <Link to="/about" className="transition hover:text-cyan-700">About</Link>
                <Link to="/doctors" className="transition hover:text-cyan-700">Find Doctors</Link>
                <Link to="/book-appointment" className="transition hover:text-cyan-700">Book Appointment</Link>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-700" />
                +94 11 234 5678
              </p>
              <p className="flex items-center gap-2 break-all sm:break-normal">
                <Mail size={14} className="text-cyan-700" />
                support@smarthealthcare.lk
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-cyan-700" />
                Colombo, Sri Lanka
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
            Copyright {new Date().getFullYear()} Smart Healthcare Platform. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
}

export default PublicLayout;