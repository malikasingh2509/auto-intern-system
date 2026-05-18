import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? "#38bdf8" : "#94a3b8",
      backgroundColor: isActive ? "rgba(56, 189, 248, 0.1)" : "transparent",
      textDecoration: "none",
      display: "block",
      padding: "10px 14px",
      borderRadius: "8px",
      marginBottom: "8px",
      fontWeight: isActive ? "600" : "500",
      fontSize: "15px",
      transition: "all 0.2s ease-in-out",
      borderLeft: isActive ? "3px solid #38bdf8" : "3px solid transparent",
    };
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748b",
    marginTop: "24px",
    marginBottom: "12px",
    paddingLeft: "14px",
  };

  return (
    <div
      style={{
        width: "260px",
        backgroundColor: "#0b0f19",
        minHeight: "100vh",
        padding: "24px 16px",
        boxSizing: "border-box",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}
    >
      <h2 
        style={{ 
          fontSize: "20px",
          fontWeight: "800",
          color: "#ffffff",
          letterSpacing: "-0.5px",
          margin: "0 0 32px 14px"
        }}
      >
        AI Career
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flexGrow: 1 }}>
        <Link to="/dashboard" style={getLinkStyle("/dashboard")}>
          📊 Dashboard
        </Link>

        <Link to="/resume" style={getLinkStyle("/resume")}>
          📄 Resume Analysis
        </Link>

        <Link to="/jobs" style={getLinkStyle("/jobs")}>
          💼 Matched Jobs
        </Link>

        <div style={labelStyle}>Career Tracker</div>

        <Link to="/tracker" style={getLinkStyle("/tracker")}>
          🗂️ Kanban Board
        </Link>

        <Link to="/applied" style={getLinkStyle("/applied")}>
          📋 Applied Jobs
        </Link>

        <div style={labelStyle}>Insights</div>

        <Link to="/suggestions" style={getLinkStyle("/suggestions")}>
          🤖 AI Suggestions
        </Link>

        <div style={labelStyle}>Account</div>

        <Link to="/profile" style={getLinkStyle("/profile")}>
          ⚙️ Profile Settings
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "#f87171",
          backgroundColor: "rgba(248, 113, 113, 0.05)",
          border: "1px solid rgba(248, 113, 113, 0.2)",
          padding: "12px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "15px",
          transition: "all 0.2s ease-in-out",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(248, 113, 113, 0.15)";
          e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(248, 113, 113, 0.05)";
          e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.2)";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;