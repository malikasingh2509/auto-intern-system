import { useState, useEffect, useRef } from "react";
import JobCard from "../components/JobCard";
import API_BASE_URL from "../config/api.js";

function Jobs({ matchedJobs, userId }) {
  const [localJobs, setLocalJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasFetched = useRef(false);

  // Get userId from localStorage as fallback (for page refresh when App state not ready yet)
  const getEffectiveUserId = () => {
    if (userId) return userId;
    const cached = localStorage.getItem("userId");
    return cached ? parseInt(cached) : null;
  };

  // Direct fetch — does NOT depend on App.jsx state
  const fetchJobs = async (uid) => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/match-jobs/${uid}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalJobs(data);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
        // If empty, keep previous jobs so we don't flash empty state
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // When prop jobs arrive from App.jsx, use them directly
  useEffect(() => {
    if (matchedJobs && matchedJobs.length > 0) {
      setLocalJobs(matchedJobs);
      setIsLoading(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  }, [matchedJobs]);

  // On mount — fetch directly if we have a userId, regardless of prop state
  useEffect(() => {
    const uid = getEffectiveUserId();
    if (uid && !hasFetched.current) {
      hasFetched.current = true;
      fetchJobs(uid);
    } else if (!uid) {
      // No user ID yet — wait a bit then try again (App.jsx is loading profile)
      const timer = setTimeout(() => {
        const delayed = getEffectiveUserId();
        if (delayed && !hasFetched.current) {
          hasFetched.current = true;
          fetchJobs(delayed);
        } else {
          setIsLoading(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // When userId becomes available (from App.jsx prop), fetch if not done yet
  useEffect(() => {
    if (userId && !hasFetched.current) {
      hasFetched.current = true;
      localStorage.setItem("cachedUserId", String(userId));
      fetchJobs(userId);
    }
    if (userId) {
      localStorage.setItem("userId", String(userId));
    }
  }, [userId]);

  const handleManualRefresh = () => {
    hasFetched.current = false;
    const uid = getEffectiveUserId();
    if (uid) {
      fetchJobs(uid);
    }
  };

  const avgScore = localJobs.length > 0
    ? Math.round(localJobs.reduce((s, j) => s + (j.matchPercentage || 0), 0) / localJobs.length)
    : 0;

  const highMatches = localJobs.filter(j => (j.matchPercentage || 0) >= 70).length;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header */}
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
                · Updated {lastUpdated}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "1px solid #1e293b",
            backgroundColor: "transparent",
            color: isLoading ? "#64748b" : "#38bdf8",
            fontWeight: "700",
            fontSize: "13px",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.borderColor = "#38bdf8"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "#1e293b"; }}
        >
          <span style={{ display: "inline-block", animation: isLoading ? "spin 1s linear infinite" : "none" }}>🔄</span>
          {isLoading ? "Fetching Jobs..." : `Refresh (${localJobs.length} found)`}
        </button>
      </div>

      {/* Stats Bar — only show when we have jobs */}
      {localJobs.length > 0 && (
        <div style={{
          display: "flex",
          gap: "28px",
          marginBottom: "28px",
          padding: "16px 24px",
          backgroundColor: "#111827",
          borderRadius: "14px",
          border: "1px solid #1e293b",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#38bdf8" }}>{localJobs.length}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Matches</p>
          </div>
          <div style={{ width: "1px", height: "40px", backgroundColor: "#1e293b" }} />
          <div>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#10b981" }}>{highMatches}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>High Match (70%+)</p>
          </div>
          <div style={{ width: "1px", height: "40px", backgroundColor: "#1e293b" }} />
          <div>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#eab308" }}>{avgScore}%</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Match Score</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && localJobs.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              backgroundColor: "#111827",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              padding: "28px",
              opacity: 0.7
            }}>
              <div style={{ height: "20px", backgroundColor: "#1e293b", borderRadius: "6px", width: "55%", marginBottom: "14px" }} />
              <div style={{ height: "14px", backgroundColor: "#0f172a", borderRadius: "4px", width: "35%", marginBottom: "10px" }} />
              <div style={{ height: "14px", backgroundColor: "#0f172a", borderRadius: "4px", width: "75%" }} />
              <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
                <div style={{ height: "28px", backgroundColor: "#1e293b", borderRadius: "20px", width: "80px" }} />
                <div style={{ height: "28px", backgroundColor: "#1e293b", borderRadius: "20px", width: "60px" }} />
              </div>
            </div>
          ))}
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "13px", marginTop: "8px" }}>
            Scanning job boards for your profile... this takes about 30 seconds on first load.
          </p>
        </div>
      ) : localJobs.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          backgroundColor: "#111827",
          borderRadius: "20px",
          border: "2px dashed #1e293b"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", margin: "0 0 8px 0" }}>No Job Matches Yet</h3>
          <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
            Set your preferred roles, locations, and skills in Profile Settings so our AI scraper can find opportunities for you.
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {localJobs.map((job, index) => (
            <JobCard key={job.id || index} job={job} userId={userId || getEffectiveUserId()} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Jobs;