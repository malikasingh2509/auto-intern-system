import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../config/api.js";

function Dashboard({
  users,
  matchedJobs,
  suggestions,
  activeUser
}) {
  const navigate = useNavigate();

  // 1. Calculate Profile Strength Score
  const calculateProfileStrength = () => {
    if (!activeUser) return 0;
    let score = 0;
    if (activeUser.name && activeUser.name.trim()) score += 15;
    if (activeUser.email && activeUser.email.trim()) score += 15;
    if (activeUser.skills && activeUser.skills.trim()) score += 15;
    if (activeUser.experience && activeUser.experience.trim()) score += 15;
    if (activeUser.domain && activeUser.domain.trim()) score += 15;
    if (activeUser.linkedinUrl || activeUser.internshalaUrl || activeUser.naukriUrl) score += 15;
    if (activeUser.preferredRoles && activeUser.preferredRoles.trim()) score += 10;
    return score;
  };

  const profileStrength = calculateProfileStrength();

  // 2. Calculate Resume Match Average Score
  const calculateAverageMatch = () => {
    if (!matchedJobs || matchedJobs.length === 0) return 0;
    const total = matchedJobs.reduce((sum, job) => sum + (job.matchPercentage || 0), 0);
    return Math.round(total / matchedJobs.length);
  };

  const averageMatch = calculateAverageMatch();

  const [applications, setApplications] = useState([]);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  
  useEffect(() => {
    if (activeUser?.id) {
      fetch(`${API_BASE_URL}/applications/user/${activeUser.id}`)
        .then(res => res.json())
        .then(data => {
          console.log(`[TRACKER DEBUG]\nfunction: Dashboard useEffect\nold value: ${applications.length}\nnew value: ${data.length}\ntrigger source: network fetch\njob id: N/A`);
          setApplications(data);
        })
        .catch(console.error);

      fetch(`${API_BASE_URL}/analyze-resume/${activeUser.id}`)
        .then(res => res.json())
        .then(data => setAtsAnalysis(data))
        .catch(console.error);
    }
  }, [activeUser]);

  const totalApplications = applications.length;
  const pendingReviews = applications.filter(a => a.status === 'Applied' || a.status === 'In Review' || a.status === 'Pending').length;
  const interviewRate = totalApplications > 0 ? Math.round((applications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Selected').length / totalApplications) * 100) : 0;
  const acceptanceRate = totalApplications > 0 ? Math.round((applications.filter(a => a.status === 'Selected').length / totalApplications) * 100) : 0;
  const rejectionRate = totalApplications > 0 ? Math.round((applications.filter(a => a.status === 'Rejected').length / totalApplications) * 100) : 0;

  const topDomains = [...new Set(matchedJobs.map(j => {
    if (j.title) return j.title.split(" ")[0];
    if (j.jobTitle) return j.jobTitle.split(" ")[0];
    return "Tech";
  }))].slice(0, 3).join(", ");

  const appStatuses = ["Applied", "Pending", "In Review", "Interview Scheduled", "Selected", "Rejected"];
  const applicationChartData = appStatuses.map(status => {
     return { name: status, value: applications.filter(a => a.status === status).length };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied": return "#38bdf8"; 
      case "Pending": return "#94a3b8"; 
      case "In Review": return "#eab308"; 
      case "Interview Scheduled": return "#a855f7"; 
      case "Selected": return "#10b981"; 
      case "Rejected": return "#ef4444"; 
      default: return "#94a3b8"; 
    }
  };

  const chartData = [
    { name: "Global Users", value: users.length, fill: "#38bdf8" },
    { name: "My Matched Jobs", value: matchedJobs.length, fill: "#10b981" },
    { name: "AI Suggestions", value: suggestions.length, fill: "#f97316" }
  ];

  const cardStyle = {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "160px",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  };

  const platforms = [
    {
      name: "LinkedIn",
      url: activeUser?.linkedinUrl,
      color: "#0a66c2",
      bg: "rgba(10, 102, 194, 0.1)",
      border: "rgba(10, 102, 194, 0.25)"
    },
    {
      name: "Internshala",
      url: activeUser?.internshalaUrl,
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.1)",
      border: "rgba(249, 115, 22, 0.25)"
    },
    {
      name: "Naukri",
      url: activeUser?.naukriUrl,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.25)"
    }
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Title Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
            Welcome Back, {activeUser?.name || "User"} 👋
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", marginTop: "4px" }}>
            Here is your dynamic career intelligence overview and centralized profile aggregates.
          </p>
        </div>
        <button
          onClick={() => navigate("/profile")}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#1e293b",
            color: "white",
            fontWeight: "700",
            cursor: "pointer",
            border: "1px solid #334155",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "#38bdf8"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "#334155"}
        >
          Edit Profile Preferences
        </button>
      </div>

      {/* Grid Row 1: Key Metrics & Scores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Profile Strength Score */}
        <div style={cardStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Profile Strength
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Completion of AI data fields</p>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "16px 0" }}>
            <span style={{ fontSize: "48px", fontWeight: "800", color: profileStrength === 100 ? "#10b981" : "#38bdf8" }}>
              {profileStrength}%
            </span>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Complete</span>
          </div>
          {/* Progress Bar */}
          <div style={{ width: "100%", height: "8px", backgroundColor: "#1e293b", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${profileStrength}%`, height: "100%", backgroundColor: profileStrength === 100 ? "#10b981" : "#38bdf8", borderRadius: "4px", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Resume Relevancy Match Score */}
        <div style={cardStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Global ATS Score
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Based on advanced AI extraction</p>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "16px 0" }}>
            <span style={{ fontSize: "48px", fontWeight: "800", color: (atsAnalysis?.overallScore || 0) >= 75 ? "#10b981" : (atsAnalysis?.overallScore || 0) >= 50 ? "#eab308" : "#ef4444" }}>
              {atsAnalysis ? atsAnalysis.overallScore : 0}%
            </span>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Overall Score</span>
          </div>
          {/* Status Label */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: (atsAnalysis?.overallScore || 0) >= 75 ? "#10b981" : (atsAnalysis?.overallScore || 0) >= 50 ? "#eab308" : "#ef4444"
            }} />
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "600" }}>
              {(atsAnalysis?.overallScore || 0) >= 75 ? "Excellent Resume" : (atsAnalysis?.overallScore || 0) >= 50 ? "Moderate Setup" : "Needs Keyword Optimization"}
            </span>
          </div>
          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #1e293b" }}>
            <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "8px" }}>Top Parsed Skills</span>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {atsAnalysis?.detectedSkills && atsAnalysis.detectedSkills.length > 0 ? (
                atsAnalysis.detectedSkills.slice(0, 4).map((skill, i) => (
                  <span key={i} style={{ backgroundColor: "#1e293b", color: "#38bdf8", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                    {skill}
                  </span>
                ))
              ) : <span style={{ fontSize: "12px", color: "#64748b" }}>Upload resume to parse skills</span>}
            </div>
          </div>
        </div>

        {/* Applications Stats */}
        <div style={cardStyle}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                🎯
              </div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#e2e8f0" }}>Applications</h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#94a3b8" }}>Total Applied</span>
              <span style={{ color: "white", fontWeight: "bold" }}>{totalApplications}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#94a3b8" }}>Pending Review</span>
              <span style={{ color: "#eab308", fontWeight: "bold" }}>{pendingReviews}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Interview Rate</span>
              <span style={{ color: "#10b981", fontWeight: "bold" }}>{interviewRate}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ color: "#94a3b8" }}>Acceptance Rate</span>
              <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{acceptanceRate}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ color: "#94a3b8" }}>Rejection Rate</span>
              <span style={{ color: "#ef4444", fontWeight: "bold" }}>{rejectionRate}%</span>
            </div>
          </div>
          <button onClick={() => navigate("/tracker")} style={{ marginTop: "16px", padding: "10px", width: "100%", borderRadius: "8px", border: "1px solid #1e293b", backgroundColor: "transparent", color: "#a855f7", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(168, 85, 247, 0.1)"} onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}>
            Open Tracker →
          </button>
        </div>
      </div>

      {/* Grid Row 2: Analytics & Connected Platforms */}
      <div className="two-col-grid">
        {/* Analytics Chart Panel */}
        <div style={{ ...cardStyle, minHeight: "360px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>
              System Command Analytics
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px", marginBottom: "20px" }}>
              Overview of centralized jobs database and suggestion counts.
            </p>
          </div>
          
          <div style={{ width: "100%", height: "240px" }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "white" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connected Platforms Panel */}
        <div style={{ ...cardStyle, minHeight: "360px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>
              Connected Channels
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px", marginBottom: "20px" }}>
              Centralize external profile sources.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {platforms.map((platform) => {
              const isConnected = platform.url && platform.url.trim() !== "";
              return (
                <div
                  key={platform.name}
                  style={{
                    backgroundColor: platform.bg,
                    border: `1px solid ${platform.border}`,
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: isConnected ? "#10b981" : "#64748b",
                        boxShadow: isConnected ? "0 0 10px #10b981" : "none"
                      }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#ffffff" }}>
                        {platform.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: "12px", color: isConnected ? "#94a3b8" : "#64748b", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isConnected ? platform.url : "Not Connected"}
                      </p>
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✓ Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate("/profile")}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#1e293b",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        border: "1px solid #334155",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = platform.color;
                        e.currentTarget.style.color = platform.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#334155";
                        e.currentTarget.style.color = "white";
                      }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Row 3: Application Pipeline Analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", marginBottom: "32px" }}>
        <div style={{ ...cardStyle, minHeight: "360px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>
              Application Pipeline Overview
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px", marginBottom: "20px" }}>
              Distribution of your job applications across different hiring stages.
            </p>
          </div>
          
          <div style={{ width: "100%", height: "280px", display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationChartData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {applicationChartData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;