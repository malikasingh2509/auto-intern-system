import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GeneratedCVViewer from "../components/GeneratedCVViewer";
import API_BASE_URL from "../config/api.js";

// ─────────────────────────────────────────────────────────────────────────────
// JobDetails — full details page with AI analysis + CV generation
//
// ARCHITECTURE CONTRACT:
//   handleApplyNow    → window.open(url) ONLY. Zero tracker mutations.
//   handleMarkApplied → POST /applications/:userId — only tracker write.
// ─────────────────────────────────────────────────────────────────────────────

function JobDetails({ userId, matchedJobs }) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // ── Matched job state — reads from matchedJobs prop only ──────────────────
  const [job, setJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [cvData, setCvData] = useState(null);
  const [generatingCV, setGeneratingCV] = useState(false);

  // ── Isolated Mark-as-Applied UI state ─────────────────────────────────────
  const [marking, setMarking] = useState(false);
  const [markedApplied, setMarkedApplied] = useState(false);
  const [markError, setMarkError] = useState(null);

  useEffect(() => {
    if (!matchedJobs || matchedJobs.length === 0) {
      setLoadingAnalysis(false);
      return;
    }
    // Find by id OR jobId, compare as strings to handle numeric vs string mismatch
    const found = matchedJobs.find(
      j => String(j.id) === jobId || String(j.jobId) === jobId
    );
    if (found) {
      setJob(found);
      fetchAnalysis(found);
    } else {
      setLoadingAnalysis(false);
    }
  }, [jobId, matchedJobs]);

  // ── AI Job Analysis ────────────────────────────────────────────────────────
  const fetchAnalysis = async (jobData) => {
    if (!userId) { setLoadingAnalysis(false); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/ai/analyze-job/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData)
      });
      if (res.ok) setAnalysis(await res.json());
    } catch (err) {
      console.error("[JOB DETAILS] AI analysis failed:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // ── Apply Now: opens external URL ONLY ───────────────────────────────────
  const handleApplyNow = () => {
    console.log("[APPLY NOW] Opening external URL only. No tracker mutation.");
    if (job?.applyLink) {
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
    }
  };

  // ── Mark as Applied: ONLY path that writes to tracker ────────────────────
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

    try {
      const res = await fetch(`${API_BASE_URL}/applications/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        console.log("[MARK AS APPLIED] Successfully added to tracker.");
        setMarkedApplied(true);
      } else {
        setMarkError("Failed to save. Please try again.");
      }
    } catch (err) {
      console.error("[MARK AS APPLIED] Network error:", err);
      setMarkError("Network error. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  // ── Generate tailored CV ──────────────────────────────────────────────────
  const handleGenerateCV = async () => {
    if (!job || !userId || generatingCV) return;
    setGeneratingCV(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/generate-cv/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
      });
      if (res.ok) setCvData(await res.json());
    } catch (err) {
      console.error("[CV GEN] Error generating CV:", err);
    } finally {
      setGeneratingCV(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingAnalysis) return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>🧠</div>
      <p style={{ color: "#94a3b8", fontSize: "16px" }}>Loading AI Analysis...</p>
    </div>
  );

  // ── Job not found ─────────────────────────────────────────────────────────
  if (!job) return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
      <h3 style={{ color: "white", marginBottom: "8px" }}>Job not found</h3>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        This job may have expired or the listing is no longer available.
      </p>
      <button
        onClick={() => navigate("/jobs")}
        style={{ padding: "12px 24px", borderRadius: "8px", border: "none", backgroundColor: "#38bdf8", color: "white", fontWeight: "700", cursor: "pointer" }}
      >
        ← Back to Jobs
      </button>
    </div>
  );

  const matchColor = analysis?.matchScore >= 75 ? "#10b981"
    : analysis?.matchScore >= 50 ? "#eab308" : "#ef4444";

  const skillsList = job.skillsRequired
    ? job.skillsRequired.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "80px" }}>

      {/* Back button */}
      <button
        onClick={() => navigate("/jobs")}
        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginBottom: "24px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", padding: "0" }}
        onMouseEnter={e => e.currentTarget.style.color = "white"}
        onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
      >
        ← Back to Jobs
      </button>

      {/* ── Header Card ── */}
      <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "20px", padding: "36px", marginBottom: "24px" }}>
        
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "800", color: "#ffffff", lineHeight: "1.3" }}>
              {job.title || job.jobTitle}
            </h1>
            <p style={{ margin: 0, fontSize: "18px", color: "#94a3b8", fontWeight: "500" }}>{job.company}</p>
          </div>
          {/* Match badge */}
          {job.matchPercentage != null && (
            <div style={{ textAlign: "center", backgroundColor: "#0f172a", border: `2px solid ${matchColor}`, borderRadius: "12px", padding: "12px 20px", flexShrink: 0 }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: matchColor }}>{Math.round(job.matchPercentage)}%</div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Match Score</div>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: "20px", color: "#cbd5e1", fontSize: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
          {job.location && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span>📍</span>{job.location}</div>}
          {job.salary   && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span>💰</span>{job.salary}</div>}
          {job.sourcePlatform && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🏢</span>
              <span style={{ padding: "2px 10px", borderRadius: "20px", backgroundColor: "rgba(56,189,248,0.1)", color: "#38bdf8", fontWeight: "700", fontSize: "12px" }}>
                {job.sourcePlatform}
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {markError && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#ef4444", fontSize: "14px" }}>
            {markError}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Apply Now — external link ONLY */}
          <button
            onClick={handleApplyNow}
            style={{ padding: "12px 28px", borderRadius: "10px", border: "none", backgroundColor: "#0a66c2", color: "white", fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Apply Now ↗
          </button>

          {/* Mark as Applied — only tracker write */}
          <button
            onClick={handleMarkApplied}
            disabled={markedApplied || marking}
            style={{
              padding: "12px 24px", borderRadius: "10px",
              border: `1px solid ${markedApplied ? "#10b981" : "#38bdf8"}`,
              backgroundColor: markedApplied ? "rgba(16,185,129,0.12)" : "transparent",
              color: markedApplied ? "#10b981" : "#38bdf8",
              fontWeight: "700", fontSize: "15px",
              cursor: markedApplied || marking ? "default" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {markedApplied ? "✓ In Tracker" : marking ? "Saving..." : "Mark as Applied"}
          </button>

          {/* Generate tailored CV */}
          <button
            onClick={handleGenerateCV}
            disabled={!analysis || generatingCV}
            style={{
              padding: "12px 24px", borderRadius: "10px",
              border: "1px solid #a855f7",
              backgroundColor: "transparent",
              color: (!analysis || generatingCV) ? "#64748b" : "#a855f7",
              fontWeight: "700", fontSize: "15px",
              cursor: (!analysis || generatingCV) ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              borderColor: (!analysis || generatingCV) ? "#334155" : "#a855f7"
            }}
            onMouseEnter={e => { if (analysis && !generatingCV) e.currentTarget.style.backgroundColor = "rgba(168,85,247,0.1)"; }}
            onMouseLeave={e => { if (analysis && !generatingCV) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {generatingCV ? "Generating..." : cvData ? "✨ View CV Package" : "✨ Generate CV for this Role"}
          </button>
        </div>
      </div>

      {/* ── Two-column grid: description + AI analysis ── */}
      <div className="job-details-grid">

        {/* Left: Description + Skills */}
        <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "white", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            📄 Job Description
          </h2>
          <p style={{ color: "#94a3b8", lineHeight: "1.7", whiteSpace: "pre-line" }}>
            {job.description || "No description provided for this listing."}
          </p>

          {skillsList.length > 0 && (
            <>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white", marginTop: "28px", marginBottom: "12px" }}>
                🛠 Skills Required
              </h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {skillsList.map(skill => (
                  <span key={skill} style={{
                    padding: "6px 14px", backgroundColor: "#1e293b", borderRadius: "20px",
                    fontSize: "13px", color: "#cbd5e1", border: "1px solid #334155"
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: AI Analysis */}
        <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "white", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            🧠 AI Match Analysis
          </h2>

          {loadingAnalysis ? (
            <p style={{ color: "#64748b" }}>Analyzing your resume against this role...</p>
          ) : analysis ? (
            <>
              {/* Score */}
              <div style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "52px", fontWeight: "800", color: matchColor, lineHeight: 1 }}>
                  {analysis.matchScore}%
                </div>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>ATS Resume Compatibility</p>
                <div style={{ marginTop: "12px", height: "6px", backgroundColor: "#1e293b", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${analysis.matchScore}%`, height: "100%", backgroundColor: matchColor, borderRadius: "4px", transition: "width 0.6s ease" }} />
                </div>
              </div>

              {/* Missing skills */}
              {analysis.missingSkills?.length > 0 && (
                <div>
                  <h4 style={{ color: "#ef4444", margin: "0 0 10px 0", fontSize: "14px", fontWeight: "700" }}>
                    ⚠ Missing Key Skills
                  </h4>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {analysis.missingSkills.map(skill => (
                      <span key={skill} style={{ padding: "4px 10px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "20px", fontSize: "12px", color: "#ef4444" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysis.improvementSuggestions?.length > 0 && (
                <div>
                  <h4 style={{ color: "#38bdf8", margin: "0 0 10px 0", fontSize: "14px", fontWeight: "700" }}>
                    💡 Improvement Suggestions
                  </h4>
                  <ul style={{ paddingLeft: "18px", margin: 0, color: "#94a3b8", fontSize: "13px", lineHeight: "1.8" }}>
                    {analysis.improvementSuggestions.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Upload your resume in <strong style={{ color: "#38bdf8" }}>Resume Analysis</strong> to get AI-powered match insights.
              </p>
              <button
                onClick={() => navigate("/resume")}
                style={{ marginTop: "16px", padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#1e293b", color: "#38bdf8", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
              >
                Upload Resume →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CV Viewer modal */}
      <GeneratedCVViewer cvData={cvData} onClose={() => setCvData(null)} />
    </div>
  );
}

export default JobDetails;
