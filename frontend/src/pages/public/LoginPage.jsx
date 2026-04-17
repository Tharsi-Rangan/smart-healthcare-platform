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
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(formData);
      const { token, user } = response.data;

      login({ token, user });

      setTimeout(() => {
        if (user.role === "patient") {
          navigate("/patient/dashboard");
        } else if (user.role === "doctor") {
          navigate("/doctor/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin/dashboard");
        }
      }, 500);
    } catch (error) {
      setError(error?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <p className="subtitle">Enter your credentials to access your account.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="footer-links">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;