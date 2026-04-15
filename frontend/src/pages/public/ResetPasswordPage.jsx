import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import { resetPassword } from "../../services/authApi";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await resetPassword({
        token,
        newPassword,
      });

      setSuccessMessage(response.message || "Password reset successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your new password to complete the reset process."
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter your new password"
            className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        {errorMessage && (
          <div className="text-sm text-red-500">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="text-sm text-emerald-500">{successMessage}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="text-center text-sm">
          <Link to="/login" className="text-cyan-700 hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export default ResetPasswordPage;