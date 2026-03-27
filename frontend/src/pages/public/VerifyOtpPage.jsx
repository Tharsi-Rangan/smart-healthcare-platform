import AuthCard from "../../components/auth/AuthCard";

function VerifyOtpPage() {
  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the OTP sent to your email address."
    >
      <form style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
          <input
            type="email"
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
          Verify OTP
        </button>
      </form>
    </AuthCard>
  );
}

export default VerifyOtpPage;