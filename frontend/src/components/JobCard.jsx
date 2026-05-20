import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API_BASE_URL from "../config/api.js";

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE CONTRACT:
//   handleApply   → window.open(url)   ONLY.  ZERO tracker mutations.
//   handleMarkApplied → POST /applications/:userId  ONLY this path writes tracker.
// ─────────────────────────────────────────────────────────────────────────────

function JobCard({ job, userId }) {
  const navigate = useNavigate();

  // LOCAL UI STATES — completely isolated, NOT derived from tracker state
  const [marking, setMarking] = useState(false);
  const [markedApplied, setMarkedApplied] = useState(false);
  const [markError, setMarkError] = useState(null);

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "LinkedIn":    return { color: "#0a66c2", bg: "rgba(10, 102, 194, 0.15)" };
      case "Internshala": return { color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" };
      case "Naukri":     return { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
      default:           return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" };
    }
  };

  // ── APPLY NOW: opens external URL. NOTHING ELSE. ──────────────────────────
  const handleApplyNow = () => {
    console.log("[APPLY NOW] Opening external URL only. No tracker mutation.");
    if (job.applyLink) {
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
    }
    // END OF FUNCTION. No fetch. No state update. No tracker.
  };

  // ── MARK AS APPLIED: the ONLY function that writes to tracker ─────────────
  const handleMarkApplied = async () => {
    if (!userId) {
      setMarkError("Please log in to track applications.");
      return;
    }
    if (markedApplied || marking) return;

    setMarking(true);
    setMarkError(null);

    const payload = {
      jobTitle:       job.jobTitle || job.title || "Unknown Role",
      company:        job.company  || "Unknown Company",
      location:       job.location || "",
      salary:         job.salary   || "",
      sourcePlatform: job.sourcePlatform || "Direct",
      applyUrl:       job.applyLink || "",
      status:         "Applied",
      notes:          "Manually marked as applied"
    };

    console.log("[MARK AS APPLIED] Writing to tracker. Payload:", payload);

    try {
      const res = await fetch(`${API_BASE_URL}/applications/${userId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      });

      if (res.ok) {
        console.log("[MARK AS APPLIED] Successfully added to tracker.");
        setMarkedApplied(true);
      } else {
        const errText = await res.text();
        console.error("[MARK AS APPLIED] Server error:", errText);
        setMarkError("Failed to save. Please try again.");
      }
    } catch (err) {
      console.error("[MARK AS APPLIED] Network error:", err);
      setMarkError("Network error. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  const platformStyle = getPlatformColor(job.sourcePlatform);
  const matchColor = job.matchPercentage >= 75
    ? "#10b981" : job.matchPercentage >= 50 ? "#eab308" : "#ef4444";

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
        transition: "border-color 0.2s ease"
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#38bdf8"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}
    >
      {/* Job title + platform badge */}
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
              padding: "4px 10px", borderRadius: "20px",
              backgroundColor: platformStyle.bg, color: platformStyle.color,
              fontSize: "12px", fontWeight: "700"
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

      {/* Location + salary */}
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

      {/* Error message */}
      {markError && (
        <p style={{ margin: 0, color: "#ef4444", fontSize: "13px" }}>{markError}</p>
      )}

      {/* Action buttons */}
      <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
        {/* ── APPLY NOW: ONLY opens external URL ── */}
        <button
          onClick={handleApplyNow}
          style={{
            padding: "10px 20px", borderRadius: "8px", border: "none",
            backgroundColor: "#0a66c2", color: "white",
            fontWeight: "700", fontSize: "14px", cursor: "pointer",
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Apply Now ↗
        </button>

        {/* ── MARK AS APPLIED: the ONLY path to tracker ── */}
        <button
          onClick={handleMarkApplied}
          disabled={markedApplied || marking}
          style={{
            padding: "10px 20px", borderRadius: "8px",
            border: `1px solid ${markedApplied ? "#10b981" : "#38bdf8"}`,
            backgroundColor: markedApplied ? "rgba(16,185,129,0.12)" : "transparent",
            color: markedApplied ? "#10b981" : "#38bdf8",
            fontWeight: "700", fontSize: "14px",
            cursor: markedApplied || marking ? "default" : "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { if (!markedApplied && !marking) e.currentTarget.style.backgroundColor = "rgba(56,189,248,0.1)"; }}
          onMouseLeave={e => { if (!markedApplied && !marking) e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          {markedApplied ? "✓ Marked Applied" : marking ? "Saving..." : "Mark as Applied"}
        </button>

        {/* ── VIEW DETAILS: navigation only ── */}
        <button
          onClick={() => navigate(`/job/${job.id || job.jobId}`)}
          style={{
            padding: "10px 20px", borderRadius: "8px",
            border: "1px solid #334155",
            backgroundColor: "transparent", color: "#94a3b8",
            fontWeight: "700", fontSize: "14px", cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          Details
        </button>
      </div>
    </div>
  );
}

export default JobCard;