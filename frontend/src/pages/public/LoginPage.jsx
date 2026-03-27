import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import { loginUser } from "../../services/authApi";
import { saveAuthData } from "../../features/auth/authStorage";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

    try {
      const response = await loginUser(formData);
      const { token, user } = response.data;

      saveAuthData({ token, user });

      if (user.role === "patient") {
        navigate("/patient/dashboard");
      } else if (user.role === "doctor") {
        navigate("/doctor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Login to access your healthcare dashboard."
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Password
          </label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none",
            }}
          />
        </div>

        {errorMessage && (
          <div style={{ color: "#ef4444", fontSize: "14px" }}>
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#0891b2",
            color: "#ffffff",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <Link to="/forgot-password" style={{ color: "#0891b2" }}>
            Forgot Password?
          </Link>

          <Link to="/register" style={{ color: "#0891b2" }}>
            Create account
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
