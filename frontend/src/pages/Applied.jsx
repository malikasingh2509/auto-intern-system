import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api.js";

function Applied({ userId }) {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/auto-apply/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setAppliedJobs(data);
        }
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, [userId]);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
          Applied Jobs
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>
          Track and manage your automated AI job submissions.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ color: "#38bdf8", fontWeight: "600", fontSize: "18px" }}>Loading submissions...</div>
        </div>
      ) : appliedJobs.length === 0 ? (
        <div
          style={{
            backgroundColor: "#0f172a",
            border: "1px dashed #1e293b",
            borderRadius: "16px",
            padding: "60px 40px",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉️</div>
          <h3 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
            No submissions yet
          </h3>
          <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto 24px auto" }}>
            Complete your profile details and upload your resume to trigger automatic job applications.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {appliedJobs.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                transition: "all 0.2s ease-in-out",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1e293b";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div>
                <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>
                  {item.jobTitle}
                </h3>
                <p style={{ color: "#38bdf8", fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
                  {item.company}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      backgroundColor: "rgba(56, 189, 248, 0.1)",
                      color: "#38bdf8",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontWeight: "600",
                    }}
                  >
                    Match: {Math.round(item.matchPercentage)}%
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  ✓ {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Applied;
