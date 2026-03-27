import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import { resetPassword } from "../../services/authApi";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

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
        error?.response?.data?.message || "Password reset failed",
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
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter your new password"
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
          {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage;
