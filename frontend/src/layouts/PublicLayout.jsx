import { Outlet, Link } from "react-router-dom";

function PublicLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafb",
        color: "#1e293b",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#0891b2",
            }}
          >
            Smart Healthcare Platform
          </Link>

          <nav
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/login">Login</Link>
            <Link
              to="/register"
              style={{
                backgroundColor: "#0891b2",
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: "8px",
              }}
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;