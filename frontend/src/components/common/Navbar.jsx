import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../features/auth/AuthContext";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">⚕️</div>
          <span className="brand-text">MediConnect</span>
        </Link>

        <div className="navbar-menu">
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/doctors"
            className={`nav-link ${isActive("/doctors") ? "active" : ""}`}
          >
            Doctors
          </Link>
          <Link
            to="/symptoms"
            className={`nav-link ${isActive("/symptoms") ? "active" : ""}`}
          >
            Symptom Checker
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            About
          </Link>
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role badge badge-primary">{user?.role}</span>
              </div>
              <Link
                to={`/${user?.role}/dashboard`}
                className="btn btn-sm btn-primary"
              >
                Dashboard
              </Link>
              <button onClick={logout} className="btn btn-sm btn-ghost">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-sm btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
