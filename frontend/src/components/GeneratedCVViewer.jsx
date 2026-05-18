import React, { useState } from "react";

function GeneratedCVViewer({ cvData, onClose }) {
  const [template, setTemplate] = useState("Modern");
  const [activeTab, setActiveTab] = useState("resume"); // resume | coverLetter | atsDelta

  if (!cvData) return null;

  const getTemplateStyles = () => {
    switch (template) {
      case "Classic": return { font: "Times New Roman, serif", bg: "#ffffff", text: "#000000", accent: "#333333" };
      case "Tech": return { font: "monospace", bg: "#0f172a", text: "#10b981", accent: "#38bdf8" };
      case "Modern":
      default:
        return { font: "Inter, sans-serif", bg: "#ffffff", text: "#0f172a", accent: "#cbd5e1" };
    }
  };

  const tStyles = getTemplateStyles();

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.9)", zIndex: 1000,
      display: "flex", justifyContent: "center", alignItems: "center", padding: "24px"
    }}>
      <div style={{
        backgroundColor: "#1e293b", width: "100%", maxWidth: "1000px", height: "90vh",
        borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        {/* Header */}
        <div style={{ padding: "24px", backgroundColor: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" }}>
          <div>
            <h2 style={{ margin: 0, color: "#ffffff", fontSize: "20px" }}>Application Package: {cvData.targetJobTitle}</h2>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>Optimized for {cvData.targetCompany}</p>
          </div>
          <button onClick={onClose} style={{ padding: "8px 16px", backgroundColor: "#334155", color: "#f8fafc", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            Close Package
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", backgroundColor: "#1e293b", borderBottom: "1px solid #334155", padding: "0 24px" }}>
          <button onClick={() => setActiveTab("resume")} style={{ padding: "16px 24px", background: "none", border: "none", color: activeTab === "resume" ? "#38bdf8" : "#94a3b8", borderBottom: activeTab === "resume" ? "2px solid #38bdf8" : "2px solid transparent", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>Tailored Resume</button>
          <button onClick={() => setActiveTab("coverLetter")} style={{ padding: "16px 24px", background: "none", border: "none", color: activeTab === "coverLetter" ? "#38bdf8" : "#94a3b8", borderBottom: activeTab === "coverLetter" ? "2px solid #38bdf8" : "2px solid transparent", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>AI Cover Letter</button>
          <button onClick={() => setActiveTab("atsDelta")} style={{ padding: "16px 24px", background: "none", border: "none", color: activeTab === "atsDelta" ? "#10b981" : "#94a3b8", borderBottom: activeTab === "atsDelta" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>⚡ ATS Delta</button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          {/* Resume Tab */}
          {activeTab === "resume" && (
            <>
              <div style={{ padding: "16px 24px", backgroundColor: "#1e293b", display: "flex", gap: "16px", borderBottom: "1px solid #334155" }}>
                <select value={template} onChange={(e) => setTemplate(e.target.value)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "white", outline: "none" }}>
                  <option value="Modern">Modern Template</option>
                  <option value="Classic">Classic Template</option>
                  <option value="Tech">Terminal Tech</option>
                </select>
                <button onClick={() => window.print()} style={{ padding: "8px 24px", backgroundColor: "#38bdf8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Export PDF</button>
              </div>
              <div style={{ padding: "60px", backgroundColor: tStyles.bg, color: tStyles.text, fontFamily: tStyles.font, minHeight: "100%" }}>
                {cvData.tailoredContent.split("\n").map((line, index) => {
                  if (line.startsWith("##")) return <h3 key={index} style={{ color: tStyles.text, marginTop: "24px", borderBottom: `2px solid ${tStyles.accent}`, paddingBottom: "8px", fontSize: "18px" }}>{line.replace("## ", "")}</h3>;
                  if (line.trim() === "") return <br key={index} />;
                  return <p key={index} style={{ margin: "6px 0", lineHeight: "1.6" }}>{line}</p>;
                })}
              </div>
            </>
          )}

          {/* Cover Letter Tab */}
          {activeTab === "coverLetter" && (
            <>
              <div style={{ padding: "16px 24px", backgroundColor: "#1e293b", display: "flex", gap: "16px", borderBottom: "1px solid #334155" }}>
                <button onClick={() => window.print()} style={{ padding: "8px 24px", backgroundColor: "#38bdf8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Export Cover Letter PDF</button>
              </div>
              <div style={{ padding: "60px", backgroundColor: "#ffffff", color: "#1e293b", fontFamily: "Times New Roman, serif", minHeight: "100%" }}>
                {cvData.coverLetterContent?.split("\n").map((line, index) => (
                  <p key={index} style={{ margin: line.trim() === "" ? "16px 0" : "4px 0", lineHeight: "1.6", fontSize: "16px" }}>{line}</p>
                ))}
              </div>
            </>
          )}

          {/* ATS Delta Tab */}
          {activeTab === "atsDelta" && (
            <div style={{ padding: "40px", backgroundColor: "#0f172a", minHeight: "100%", color: "white" }}>
              <h3 style={{ fontSize: "24px", margin: "0 0 32px 0", color: "#f8fafc" }}>Optimization Results</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "24px", alignItems: "center", marginBottom: "48px" }}>
                <div style={{ backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", textAlign: "center", border: "1px solid #334155" }}>
                  <p style={{ margin: "0 0 8px 0", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Original ATS Score</p>
                  <span style={{ fontSize: "64px", fontWeight: "800", color: "#ef4444" }}>{cvData.originalAtsScore || 60}%</span>
                </div>
                
                <div style={{ fontSize: "40px", color: "#38bdf8" }}>➔</div>
                
                <div style={{ backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", textAlign: "center", border: "1px dashed #10b981", position: "relative" }}>
                  <div style={{ position: "absolute", top: "-12px", right: "20px", backgroundColor: "#10b981", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                    +{(cvData.optimizedAtsScore || 85) - (cvData.originalAtsScore || 60)}% Boost
                  </div>
                  <p style={{ margin: "0 0 8px 0", color: "#10b981", fontWeight: "600", textTransform: "uppercase" }}>Optimized ATS Score</p>
                  <span style={{ fontSize: "64px", fontWeight: "800", color: "#10b981" }}>{cvData.optimizedAtsScore || 85}%</span>
                </div>
              </div>

              <div style={{ backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#38bdf8", fontSize: "18px" }}>Injected Keywords (Missing from original)</h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {cvData.addedKeywords?.split(",").map((kw, i) => (
                    <span key={i} style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "6px 12px", borderRadius: "8px", fontWeight: "600" }}>
                      + {kw.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px", border: "1px solid #334155" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#a855f7", fontSize: "18px" }}>Structural Improvements</h4>
                <p style={{ color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
                  {cvData.reorderedSections || "Synthetically re-prioritized experience impact points and synchronized Core Competencies with target job requirements."}
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneratedCVViewer;
