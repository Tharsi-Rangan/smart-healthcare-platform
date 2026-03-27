import AuthCard from "../../components/auth/AuthCard";

function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your new password to complete the reset process."
    >
      <form style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            New Password
          </label>
          <input
            type="password"
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

        <button
          type="submit"
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
          Reset Password
        </button>
      </form>
    </AuthCard>
  );
}

export default ResetPasswordPage;