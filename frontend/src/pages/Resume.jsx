import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

function Resume({ userId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/analyze-resume/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          // Check if analysis contains valid parsed data
          if (data && data.name) {
            setAnalysis(data);
          }
        }
      } catch (error) {
        console.error("Error fetching resume analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [userId]);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
          Resume Analysis
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>
          Upload your resume in Profile settings to get instant ATS scores and keyword extraction.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ color: "#38bdf8", fontWeight: "600", fontSize: "18px" }}>Analyzing resume...</div>
        </div>
      ) : !analysis ? (
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h3 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
            No Resume Analyzed Yet
          </h3>
          <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto 24px auto" }}>
            Please upload your resume in the Profile Settings tab to get instant skill analysis and scoring.
          </p>
          <Link
            to="/profile"
            style={{
              display: "inline-block",
              backgroundColor: "#38bdf8",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "700",
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0284c7"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#38bdf8"}
          >
            Go to Profile Settings
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          {/* Main Score Panel */}
          <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", padding: "32px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff", marginBottom: "24px" }}>
              {analysis.name}'s ATS Profile
            </h2>
            
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#94a3b8", marginBottom: "8px" }}>Overall ATS Score</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "64px", fontWeight: "800", color: analysis.overallScore >= 75 ? "#10b981" : analysis.overallScore >= 50 ? "#eab308" : "#ef4444", lineHeight: "1" }}>
                {analysis.overallScore}%
              </span>
              <span style={{ color: "#64748b", fontWeight: "600", fontSize: "16px" }}>
                / 100 ({analysis.overallScore >= 75 ? "Strong Match" : analysis.overallScore >= 50 ? "Moderate Match" : "Needs Work"})
              </span>
            </div>
            
            <div style={{ height: "8px", backgroundColor: "#1e293b", borderRadius: "9999px", width: "100%", overflow: "hidden", marginBottom: "32px" }}>
              <div style={{ height: "100%", backgroundColor: analysis.overallScore >= 75 ? "#10b981" : analysis.overallScore >= 50 ? "#eab308" : "#ef4444", width: `${analysis.overallScore}%`, borderRadius: "9999px" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>Keyword Density</span>
                <span style={{ fontSize: "18px", color: "#ffffff", fontWeight: "700" }}>{analysis.keywordScore}%</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>Project Relevance</span>
                <span style={{ fontSize: "18px", color: "#ffffff", fontWeight: "700" }}>{analysis.projectRelevanceScore}%</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>Experience Factor</span>
                <span style={{ fontSize: "18px", color: "#ffffff", fontWeight: "700" }}>{analysis.experienceScore}%</span>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#10b981" }}>✓</span> Detected Core Skills
              </h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {analysis.detectedSkills && analysis.detectedSkills.length > 0 ? (
                  analysis.detectedSkills.map((skill, i) => (
                    <span key={i} style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                      {skill}
                    </span>
                  ))
                ) : <span style={{ color: "#64748b", fontSize: "13px" }}>No core skills parsed.</span>}
              </div>
            </div>

            <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#ef4444" }}>⚠</span> Critical Missing Keywords
              </h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                  analysis.missingKeywords.map((skill, i) => (
                    <span key={i} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                      {skill}
                    </span>
                  ))
                ) : <span style={{ color: "#10b981", fontSize: "13px" }}>Resume covers all baseline keywords!</span>}
              </div>
            </div>

            <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#38bdf8" }}>📋</span> AI Improvement Checklist
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                {analysis.improvementChecklist && analysis.improvementChecklist.map((item, i) => (
                  <li key={i} style={{ marginBottom: "8px" }}>{item}</li>
                ))}
                {analysis.weakSections && analysis.weakSections.map((item, i) => (
                  <li key={i} style={{ color: "#f59e0b", marginBottom: "8px" }}>Weak Section Detected: <strong>{item}</strong></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resume;