import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import { resendEmailOtp, verifyEmailOtp } from "../../services/authApi";

function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await verifyEmailOtp({ email, otp });
      setSuccessMessage(response.message || "Email verified successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await resendEmailOtp({ email });
      setSuccessMessage(response.message || "OTP resent successfully");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the OTP sent to your email address."
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter 6-digit OTP"
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
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending}
          className="rounded-xl border border-cyan-700 bg-cyan-50 px-4 py-3 font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {resending ? "Resending..." : "Resend OTP"}
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

export default VerifyOtpPage;