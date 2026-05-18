import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API_BASE_URL from "../config/api.js";

function JobCard({ job, userId }) {
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "LinkedIn": return { color: "#0a66c2", bg: "rgba(10, 102, 194, 0.15)" };
      case "Internshala": return { color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" };
      case "Naukri": return { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
      default: return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" };
    }
  };

  const handleApply = async () => {
    if (job.applyLink) {
      window.open(job.applyLink, "_blank");
    }
    
    if (!userId) return;
    
    try {
      const appData = {
        jobTitle: job.title || job.jobTitle,
        company: job.company,
        location: job.location,
        salary: job.salary,
        sourcePlatform: job.sourcePlatform,
        applyUrl: job.applyLink,
        status: "Applied",
        notes: "Applied via Job Board"
      };
      const response = await fetch(`${API_BASE_URL}/applications/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData)
      });
      if (response.ok) {
        setApplied(true);
      }
    } catch (error) {
      console.error("Error applying", error);
    }
  };

  const platformStyle = getPlatformColor(job.sourcePlatform);
  const matchColor = job.matchPercentage >= 75 ? "#10b981" : job.matchPercentage >= 50 ? "#eab308" : "#ef4444";

  return (
    <div
      style={{
        border: "1px solid #1e293b",
        padding: "24px",
        marginBottom: "20px",
        borderRadius: "16px",
        backgroundColor: "#111827",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "transform 0.2s ease, border-color 0.2s ease"
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#38bdf8"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1e293b"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>
            {job.jobTitle || job.title}
          </h3>
          <p style={{ margin: 0, fontSize: "15px", color: "#94a3b8", fontWeight: "500" }}>
            {job.company}
          </p>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          {job.sourcePlatform && (
            <span style={{
              padding: "4px 10px",
              borderRadius: "20px",
              backgroundColor: platformStyle.bg,
              color: platformStyle.color,
              fontSize: "12px",
              fontWeight: "700"
            }}>
              {job.sourcePlatform}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: matchColor }} />
            <span style={{ fontSize: "14px", fontWeight: "700", color: matchColor }}>
              {job.matchPercentage ? job.matchPercentage.toFixed(0) : 0}% Match
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", color: "#64748b", fontSize: "13px" }}>
        {job.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📍</span> {job.location}
          </div>
        )}
        {job.salary && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>💰</span> {job.salary}
          </div>
        )}
      </div>

      <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          onClick={handleApply}
          disabled={applied}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: applied ? "#10b981" : "#0a66c2",
            color: "white",
            fontWeight: "700",
            fontSize: "14px",
            cursor: applied ? "default" : "pointer",
            transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => !applied && (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => !applied && (e.currentTarget.style.opacity = "1")}
        >
          {applied ? "Applied ✓" : "Apply Now"}
        </button>
        <button
          onClick={() => navigate(`/job/${job.id || job.jobId}`)}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #38bdf8",
            backgroundColor: "transparent",
            color: "#38bdf8",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(56, 189, 248, 0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          View Job Details
        </button>
      </div>
    </div>
  );
}

export default JobCard;