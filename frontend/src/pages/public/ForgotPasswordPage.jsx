import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import { forgotPassword } from "../../services/authApi";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await forgotPassword({ email });
      setSuccessMessage(response.message || "Password reset email sent successfully");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email to receive a password reset link."
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

        {errorMessage && (
          <div style={{ color: "#ef4444", fontSize: "14px" }}>{errorMessage}</div>
        )}

        {successMessage && (
          <div style={{ color: "#10b981", fontSize: "14px" }}>{successMessage}</div>
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
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
    </AuthCard>
  );
}

export default ForgotPasswordPage;