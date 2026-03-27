import AuthCard from "../../components/auth/AuthCard";

function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Login to access your healthcare dashboard."
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
          <label style={{ display: "block", marginBottom: "8px" }}>Password</label>
          <input
            type="password"
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
          Login
        </button>
      </form>
    </AuthCard>
  );
}

export default LoginPage;