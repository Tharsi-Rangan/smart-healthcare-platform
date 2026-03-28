import { Outlet, Link } from "react-router-dom";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;