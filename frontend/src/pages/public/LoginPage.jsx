import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../../services/authApi";
import { useAuth } from "../../features/auth/AuthContext";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await loginUser(formData);
      const { token, user } = response.data;

      login({ token, user });
      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        if (user.role === "patient") {
          navigate("/patient/dashboard");
        } else if (user.role === "doctor") {
          navigate("/doctor/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin/dashboard");
        }
      }, 1000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Illustration */}
        <div className="login-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">⚕️</div>
            <h2>Welcome to MediConnect</h2>
            <p>Your trusted healthcare companion</p>
            <div className="illustration-features">
              <div className="feature">✓ Expert Doctors</div>
              <div className="feature">✓ Secure Records</div>
              <div className="feature">✓ 24/7 Support</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-container">
            <div className="form-header">
              <h1 className="text-h2">Welcome back</h1>
              <p className="text-body-md">Login to access your healthcare dashboard</p>
            </div>

            {errorMessage && (
              <div className="alert alert-danger">
                <span className="alert-icon">⚠️</span>
                <div className="alert-content">
                  <p className="alert-title">Login Error</p>
                  <p className="alert-message">{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                <div className="alert-content">
                  <p className="alert-title">Success</p>
                  <p className="alert-message">{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="input-label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-with-link">
                  <label className="input-label">Password</label>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary btn-lg w-full ${loading ? "is-loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="form-divider">
              <span>Don't have an account?</span>
            </div>

            <Link to="/register" className="btn btn-outline btn-lg w-full">
              Create Account
            </Link>

            <div className="login-footer">
              <p className="text-caption">
                By logging in, you agree to our{" "}
                <a href="#terms" className="footer-link">Terms of Service</a> and{" "}
                <a href="#privacy" className="footer-link">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;