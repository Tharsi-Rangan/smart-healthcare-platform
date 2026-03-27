import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import { resendEmailOtp, verifyEmailOtp } from "../../services/authApi";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
        error?.response?.data?.message || "OTP verification failed",
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
      setErrorMessage(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the OTP sent to your email address."
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          <label style={{ display: "block", marginBottom: "8px" }}>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter 6-digit OTP"
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

        {successMessage && (
          <div style={{ color: "#10b981", fontSize: "14px" }}>
            {successMessage}
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
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending}
          style={{
            backgroundColor: "#e0f2fe",
            color: "#0891b2",
            border: "1px solid #0891b2",
            padding: "12px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>

        <div style={{ textAlign: "center", fontSize: "14px" }}>
          <Link to="/login" style={{ color: "#0891b2" }}>
            Back to Login
          </Link>
        </div>

      </form>
    </AuthCard>
  );
}

export default VerifyOtpPage;
