import AuthCard from "../../components/auth/AuthCard";

function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="Register as a patient or doctor to continue."
    >
      <form style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
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
            placeholder="Create a password"
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
          <label style={{ display: "block", marginBottom: "8px" }}>Role</label>
          <select
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none",
            }}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
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
          Register
        </button>
      </form>
    </AuthCard>
  );
}

export default RegisterPage;