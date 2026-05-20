import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GeneratedCVViewer from "../components/GeneratedCVViewer";
import API_BASE_URL from "../config/api.js";

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE CONTRACT:
//   handleApplyNow      → window.open(url)   ONLY.  ZERO tracker mutations.
//   handleMarkApplied   → POST /applications/:userId  ONLY this writes tracker.
// ─────────────────────────────────────────────────────────────────────────────

function JobDetails({ userId, matchedJobs }) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // ── MATCHED JOB STATE — reads only from matchedJobs prop, never touches tracker ──
  const [job, setJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvData, setCvData] = useState(null);

  // ── ISOLATED MARK-AS-APPLIED UI STATE — completely separate from tracker ──
  const [marking, setMarking] = useState(false);
  const [markedApplied, setMarkedApplied] = useState(false);
  const [markError, setMarkError] = useState(null);

  useEffect(() => {
    const foundJob = matchedJobs.find(j => (j.id || j.jobId).toString() === jobId);
    if (foundJob) {
      setJob(foundJob);
      fetchAnalysis(foundJob);
    } else {
      setLoading(false);
    }
  }, [jobId, matchedJobs]);

  const fetchAnalysis = async (jobData) => {
    if (!userId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/ai/analyze-job/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData)
      });
      if (res.ok) setAnalysis(await res.json());
    } catch (err) {
      console.error("Failed to fetch AI analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── APPLY NOW: opens external URL. NOTHING ELSE. ──────────────────────────
  const handleApplyNow = () => {
    console.log("[APPLY NOW] Opening external URL only. No tracker mutation.");
    if (job?.applyLink) {
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
    }
    // END OF FUNCTION. No fetch. No state update. No tracker.
  };

  // ── MARK AS APPLIED: the ONLY function that writes to tracker ─────────────
  const handleMarkApplied = async () => {
    if (!userId) { setMarkError("Please log in to track applications."); return; }
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
      notes:          "Manually marked as applied from Job Details"
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

  const handleGenerateCV = async () => {
    if (!job || !userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ai/generate-cv/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
      });
      if (res.ok) setCvData(await res.json());
    } catch (err) {
      console.error("Error generating CV:", err);
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "100px", color: "white" }}>Loading AI Analysis...</div>
  );

  if (!job) return (
    <div style={{ textAlign: "center", padding: "100px", color: "white" }}>Job not found.</div>
  );

  const matchColor = analysis?.matchScore >= 75 ? "#10b981"
    : analysis?.matchScore >= 50 ? "#eab308" : "#ef4444";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "60px" }}>
      <button
        onClick={() => navigate("/jobs")}
        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginBottom: "24px" }}
      >
        ← Back to Jobs
      </button>

      {/* Header */}
      <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "32px", color: "white" }}>{job.title || job.jobTitle}</h1>
        <p style={{ margin: "0 0 24px 0", fontSize: "18px", color: "#94a3b8" }}>{job.company}</p>

        <div style={{ display: "flex", gap: "24px", color: "#cbd5e1", fontSize: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
          {job.location && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>📍</span> {job.location}</div>}
          {job.salary   && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>💰</span> {job.salary}</div>}
          {job.sourcePlatform && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span>🏢</span> {job.sourcePlatform}</div>}
        </div>

        {/* Error */}
        {markError && <p style={{ color: "#ef4444", marginBottom: "16px", fontSize: "14px" }}>{markError}</p>}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* ── APPLY NOW: ONLY opens external URL ── */}
          <button
            onClick={handleApplyNow}
            style={{ padding: "12px 24px", borderRadius: "8px", border: "none", backgroundColor: "#0a66c2", color: "white", fontWeight: "700", cursor: "pointer" }}
          >
            Apply Now ↗
          </button>

          {/* ── MARK AS APPLIED: the ONLY path to tracker ── */}
          <button
            onClick={handleMarkApplied}
            disabled={markedApplied || marking}
            style={{
              padding: "12px 24px", borderRadius: "8px",
              border: `1px solid ${markedApplied ? "#10b981" : "#38bdf8"}`,
              backgroundColor: markedApplied ? "rgba(16,185,129,0.12)" : "transparent",
              color: markedApplied ? "#10b981" : "#38bdf8",
              fontWeight: "700", cursor: markedApplied || marking ? "default" : "pointer"
            }}
          >
            {markedApplied ? "✓ In Tracker" : marking ? "Saving..." : "Mark as Applied"}
          </button>

          {/* ── GENERATE CV ── */}
          <button
            onClick={handleGenerateCV}
            disabled={!analysis}
            style={{
              padding: "12px 24px", borderRadius: "8px",
              border: "1px solid #334155",
              backgroundColor: "transparent",
              color: !analysis ? "#64748b" : "#94a3b8",
              fontWeight: "700", cursor: !analysis ? "not-allowed" : "pointer"
            }}
          >
            {cvData ? "View App Package" : "✨ Generate CV Package"}
          </button>
        </div>
      </div>

      <div className="job-details-grid">
        {/* Job Description */}
        <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "32px" }}>
          <h2 style={{ fontSize: "20px", color: "white", marginBottom: "16px" }}>Job Description</h2>
          <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>{job.description || "No description provided."}</p>

          <h3 style={{ fontSize: "16px", color: "white", marginTop: "24px", marginBottom: "12px" }}>Skills Required</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {job.skillsRequired?.split(",").map(skill => (
              <span key={skill} style={{ padding: "6px 12px", backgroundColor: "#1e293b", borderRadius: "20px", fontSize: "13px", color: "#cbd5e1" }}>
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2 style={{ fontSize: "20px", color: "white", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🧠</span> AI Match Analysis
          </h2>

          {analysis ? (
            <>
              <div>
                <div style={{ fontSize: "48px", fontWeight: "800", color: matchColor }}>{analysis.matchScore}%</div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>ATS Resume Compatibility</p>
              </div>

              {analysis.missingSkills?.length > 0 && (
                <div>
                  <h4 style={{ color: "#ef4444", margin: "0 0 8px 0" }}>Missing Key Skills</h4>
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "#cbd5e1", fontSize: "14px" }}>
                    {analysis.missingSkills.map(skill => <li key={skill}>{skill}</li>)}
                  </ul>
                </div>
              )}

              <div>
                <h4 style={{ color: "#38bdf8", margin: "0 0 8px 0" }}>Improvement Suggestions</h4>
                <ul style={{ paddingLeft: "20px", margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5" }}>
                  {analysis.improvementSuggestions?.map((sug, i) => <li key={i}>{sug}</li>)}
                </ul>
              </div>
            </>
          ) : (
            <p style={{ color: "#94a3b8" }}>Analysis not available. Upload your resume first.</p>
          )}
        </div>
      </div>

      <GeneratedCVViewer cvData={cvData} onClose={() => setCvData(null)} />
    </div>
  );
}

export default JobDetails;
