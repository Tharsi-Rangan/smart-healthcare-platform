import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import { loginUser } from "../../services/authApi";
import { useAuth } from "../../features/auth/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

      login({ token, user });

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
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        {errorMessage && (
          <div className="text-sm text-red-500">{errorMessage}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-cyan-700 hover:underline">
            Forgot Password?
          </Link>

          <Link to="/register" className="text-cyan-700 hover:underline">
            Create account
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export default LoginPage;