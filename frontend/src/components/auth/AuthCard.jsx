function AuthCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "40px auto",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <h1
        style={{
          margin: 0,
          marginBottom: "8px",
          fontSize: "28px",
          color: "#1e293b",
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "#64748b",
          }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}

export default AuthCard;