import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import API_BASE_URL from "../config/api.js";

function Jobs({ matchedJobs, userId }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localJobs, setLocalJobs] = useState(matchedJobs || []);
  const [hasLoaded, setHasLoaded] = useState(matchedJobs && matchedJobs.length > 0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Sync prop changes into local state
  useEffect(() => {
    if (matchedJobs && matchedJobs.length > 0) {
      setLocalJobs(matchedJobs);
      setHasLoaded(true);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  }, [matchedJobs]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (!userId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/match-jobs/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalJobs(data);
          setHasLoaded(true);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch (error) {
      console.error("Error refreshing jobs:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-load jobs if none available yet and userId exists
  useEffect(() => {
    if (!hasLoaded && userId && !isRefreshing) {
      handleManualRefresh();
    }
  }, [userId, hasLoaded]);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", marginBottom: "8px", marginTop: 0 }}>
            Aggregated Job Matches
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
            AI-filtered opportunities ranked by ATS compatibility score.
            {lastUpdated && (
              <span style={{ color: "#64748b", fontSize: "13px", marginLeft: "8px" }}>
                • Updated {lastUpdated}
              </span>
            )}
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "1px solid #1e293b",
            backgroundColor: isRefreshing ? "#1e293b" : "transparent",
            color: isRefreshing ? "#64748b" : "#38bdf8",
            fontWeight: "700",
            fontSize: "13px",
            cursor: isRefreshing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            if (!isRefreshing) e.currentTarget.style.borderColor = "#38bdf8";
          }}
          onMouseOut={(e) => {
            if (!isRefreshing) e.currentTarget.style.borderColor = "#1e293b";
          }}
        >
          <span style={{
            display: "inline-block",
            animation: isRefreshing ? "spin 1s linear infinite" : "none",
            fontSize: "14px"
          }}>
            🔄
          </span>
          {isRefreshing ? "Fetching Jobs..." : `Refresh Jobs (${localJobs.length} found)`}
        </button>
      </div>

      {/* Stats Bar */}
      {localJobs.length > 0 && (
        <div style={{
          display: "flex",
          gap: "24px",
          marginBottom: "28px",
          padding: "16px 20px",
          backgroundColor: "#111827",
          borderRadius: "12px",
          border: "1px solid #1e293b",
          flexWrap: "wrap"
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#38bdf8" }}>
              {localJobs.length}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Total Matches
            </p>
          </div>
          <div style={{ width: "1px", backgroundColor: "#1e293b" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#10b981" }}>
              {localJobs.filter(j => (j.matchPercentage || 0) >= 70).length}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              High Matches (70%+)
            </p>
          </div>
          <div style={{ width: "1px", backgroundColor: "#1e293b" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#eab308" }}>
              {localJobs.length > 0
                ? Math.round(localJobs.reduce((s, j) => s + (j.matchPercentage || 0), 0) / localJobs.length)
                : 0}%
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Avg Match Score
            </p>
          </div>
        </div>
      )}

      {/* Loading State — skeleton cards, no empty state flash */}
      {isRefreshing && localJobs.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              backgroundColor: "#111827",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              padding: "24px",
              animation: "pulse 1.5s ease-in-out infinite",
              opacity: 0.6
            }}>
              <div style={{ height: "20px", backgroundColor: "#1e293b", borderRadius: "6px", width: "60%", marginBottom: "12px" }} />
              <div style={{ height: "14px", backgroundColor: "#0f172a", borderRadius: "4px", width: "40%", marginBottom: "8px" }} />
              <div style={{ height: "14px", backgroundColor: "#0f172a", borderRadius: "4px", width: "80%" }} />
            </div>
          ))}
        </div>
      ) : localJobs.length === 0 ? (
        /* True empty state - only shown when NOT loading and genuinely no jobs */
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          backgroundColor: "#111827",
          borderRadius: "20px",
          border: "2px dashed #1e293b"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", margin: "0 0 8px 0" }}>
            No Job Matches Yet
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
            Set your preferred roles, locations, and skills in Profile Settings so our AI scraper can find perfect opportunities for you.
          </p>
          <button
            onClick={handleManualRefresh}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#38bdf8",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 14px -3px rgba(56, 189, 248, 0.4)"
            }}
          >
            🔄 Scan for Jobs Now
          </button>
        </div>
      ) : (
        /* Jobs List */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {localJobs.map((job, index) => (
            <JobCard key={job.id || index} job={job} userId={userId} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default Jobs;