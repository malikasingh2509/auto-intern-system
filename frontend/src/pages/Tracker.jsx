import { useState, useEffect } from "react";
import API_BASE_URL from "../config/api.js";

const COLUMNS = [
  { id: "Applied", label: "Applied", icon: "📩", color: "#38bdf8" },
  { id: "In Review", label: "In Review", icon: "🔍", color: "#eab308" },
  { id: "Interview Scheduled", label: "Interview", icon: "📅", color: "#a855f7" },
  { id: "Selected", label: "Selected", icon: "✅", color: "#10b981" },
  { id: "Rejected", label: "Rejected", icon: "❌", color: "#ef4444" },
];

function AppCard({ app, onDragStart, onClick }) {
  const col = COLUMNS.find(c => c.id === app.status) || COLUMNS[0];
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app.id)}
      onClick={() => onClick(app)}
      style={{
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderLeft: `3px solid ${col.color}`,
        borderRadius: "10px",
        padding: "14px",
        marginBottom: "10px",
        cursor: "grab",
        transition: "all 0.2s ease",
        userSelect: "none",
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1e293b"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0f172a"}
    >
      <p style={{ margin: "0 0 6px", fontWeight: "700", color: "#f8fafc", fontSize: "14px" }}>
        {app.jobTitle}
      </p>
      <p style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: "13px" }}>{app.company}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#64748b" }}>
          {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "—"}
        </span>
        <span style={{
          fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px",
          backgroundColor: `${col.color}20`, color: col.color
        }}>
          {app.sourcePlatform || "Direct"}
        </span>
      </div>
      {app.notes && (
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#64748b", borderTop: "1px solid #1e293b", paddingTop: "8px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          📝 {app.notes}
        </p>
      )}
    </div>
  );
}

function AppModal({ app, onClose, onStatusChange }) {
  const [history, setHistory] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [newInterview, setNewInterview] = useState({ roundType: "Technical", meetingLink: "", notes: "", interviewDate: "" });
  const [showInterviewForm, setShowInterviewForm] = useState(false);

  useEffect(() => {
    if (!app) return;
    fetch(`${API_BASE_URL}/applications/${app.id}/history`)
      .then(r => r.json()).then(setHistory).catch(console.error);
    fetch(`${API_BASE_URL}/interviews/application/${app.id}`)
      .then(r => r.json()).then(setInterviews).catch(console.error);
  }, [app]);

  const submitInterview = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/application/${app.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newInterview, company: app.company })
      });
      if (res.ok) {
        const data = await res.json();
        setInterviews(prev => [...prev, data]);
        setShowInterviewForm(false);
        setNewInterview({ roundType: "Technical", meetingLink: "", notes: "", interviewDate: "" });
        onStatusChange(app.id, "Interview Scheduled");
      }
    } catch (e) { console.error(e); }
  };

  if (!app) return null;
  const col = COLUMNS.find(c => c.id === app.status) || COLUMNS[0];

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "#1e293b", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", color: "white", fontSize: "20px" }}>{app.jobTitle}</h2>
            <p style={{ margin: 0, color: "#94a3b8" }}>{app.company} · {app.location || "N/A"}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: "22px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Status Changer */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #334155" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" }}>Move Pipeline Stage</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {COLUMNS.map(c => (
              <button key={c.id} onClick={() => onStatusChange(app.id, c.id)}
                style={{ padding: "8px 14px", borderRadius: "8px", border: `1px solid ${c.color}`, backgroundColor: app.status === c.id ? `${c.color}30` : "transparent", color: c.color, cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #334155" }}>
          <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" }}>Application Timeline</p>
          {history.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>No status changes tracked yet.</p>
          ) : (
            <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid #334155" }}>
              {history.map((h, i) => {
                const c = COLUMNS.find(col => col.id === h.statusStage) || COLUMNS[0];
                return (
                  <div key={i} style={{ marginBottom: "16px", position: "relative" }}>
                    <div style={{ position: "absolute", left: "-31px", width: "12px", height: "12px", backgroundColor: c.color, borderRadius: "50%", border: "2px solid #1e293b" }} />
                    <p style={{ margin: "0 0 2px", color: "white", fontWeight: "600", fontSize: "14px" }}>{c.icon} {h.statusStage}</p>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interviews */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" }}>Interview Rounds</p>
            <button onClick={() => setShowInterviewForm(!showInterviewForm)}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #38bdf8", backgroundColor: "transparent", color: "#38bdf8", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>
              + Schedule Round
            </button>
          </div>

          {showInterviewForm && (
            <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid #334155" }}>
              <select value={newInterview.roundType} onChange={e => setNewInterview({ ...newInterview, roundType: e.target.value })}
                style={{ width: "100%", padding: "10px", backgroundColor: "#1e293b", color: "white", border: "1px solid #475569", borderRadius: "8px", marginBottom: "10px", outline: "none" }}>
                <option>Technical</option><option>HR</option><option>Managerial</option><option>Assignment</option>
              </select>
              <input type="datetime-local" value={newInterview.interviewDate}
                onChange={e => setNewInterview({ ...newInterview, interviewDate: e.target.value })}
                style={{ width: "100%", padding: "10px", backgroundColor: "#1e293b", color: "white", border: "1px solid #475569", borderRadius: "8px", marginBottom: "10px", outline: "none", boxSizing: "border-box" }}
              />
              <input type="text" placeholder="Meeting Link (Zoom/Meet)"
                value={newInterview.meetingLink} onChange={e => setNewInterview({ ...newInterview, meetingLink: e.target.value })}
                style={{ width: "100%", padding: "10px", backgroundColor: "#1e293b", color: "white", border: "1px solid #475569", borderRadius: "8px", marginBottom: "10px", outline: "none", boxSizing: "border-box" }}
              />
              <textarea placeholder="Notes..."
                value={newInterview.notes} onChange={e => setNewInterview({ ...newInterview, notes: e.target.value })}
                style={{ width: "100%", padding: "10px", backgroundColor: "#1e293b", color: "white", border: "1px solid #475569", borderRadius: "8px", resize: "vertical", minHeight: "80px", outline: "none", boxSizing: "border-box" }}
              />
              <button onClick={submitInterview}
                style={{ marginTop: "10px", padding: "10px 24px", backgroundColor: "#38bdf8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                Confirm Interview
              </button>
            </div>
          )}

          {interviews.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>No interviews scheduled yet.</p>
          ) : (
            interviews.map((iv, i) => (
              <div key={i} style={{ backgroundColor: "#0f172a", borderRadius: "10px", padding: "14px", marginBottom: "10px", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#a855f7", fontWeight: "700" }}>{iv.roundType} Round</span>
                  {iv.interviewDate && <span style={{ color: "#94a3b8", fontSize: "13px" }}>{new Date(iv.interviewDate).toLocaleString()}</span>}
                </div>
                {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", fontSize: "13px", textDecoration: "none" }}>🔗 Join Meeting</a>}
                {iv.notes && <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "13px" }}>{iv.notes}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Tracker({ userId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/applications/user/${userId}`);
      if (res.ok) setApplications(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, [userId]);

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData("appId", appId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const appId = parseInt(e.dataTransfer.getData("appId"));
    setDragOverCol(null);

    // Optimistic update
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

    try {
      await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) { console.error(e); fetchApplications(); }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    if (selectedApp?.id === appId) setSelectedApp(prev => ({ ...prev, status: newStatus }));
    try {
      await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px", color: "white" }}>Loading Kanban Board...</div>;

  const filtered = applications.filter(a => {
    const t = searchTerm.toLowerCase();
    return (a.jobTitle || "").toLowerCase().includes(t) || (a.company || "").toLowerCase().includes(t);
  });

  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.status === "Interview Scheduled").length,
    accepted: applications.filter(a => a.status === "Selected").length,
    rejected: applications.filter(a => a.status === "Rejected").length,
  };

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "white", margin: "0 0 8px" }}>Application Kanban</h1>
        <p style={{ color: "#94a3b8", margin: "0 0 20px" }}>Drag cards between columns to track your hiring pipeline.</p>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Applied", value: stats.total, color: "#38bdf8" },
            { label: "Interviews", value: stats.interviews, color: "#a855f7" },
            { label: "Accepted", value: stats.accepted, color: "#10b981" },
            { label: "Rejected", value: stats.rejected, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px" }}>
              <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>{s.label}</p>
              <span style={{ fontSize: "32px", fontWeight: "800", color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        <input type="text" placeholder="Search by company or title..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: "100%", maxWidth: "360px", padding: "10px 16px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#1e293b", color: "white", outline: "none", fontSize: "14px" }}
        />
      </div>

      {/* Kanban Board */}
      <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "24px", minHeight: "600px" }}>
        {COLUMNS.map(col => {
          const colApps = filtered.filter(a => a.status === col.id);
          const isDragOver = dragOverCol === col.id;
          return (
            <div key={col.id}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
              style={{
                minWidth: "240px", width: "240px", backgroundColor: isDragOver ? "#1e293b" : "#0b0f19",
                borderRadius: "14px", padding: "16px",
                border: `1px solid ${isDragOver ? col.color : "#1e293b"}`,
                transition: "all 0.2s ease", flexShrink: 0
              }}
            >
              {/* Column Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>{col.icon}</span>
                  <span style={{ fontWeight: "700", color: col.color, fontSize: "14px" }}>{col.label}</span>
                </div>
                <span style={{ backgroundColor: `${col.color}20`, color: col.color, padding: "2px 8px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              {colApps.map(app => (
                <AppCard key={app.id} app={app} onDragStart={handleDragStart} onClick={() => setSelectedApp(app)} />
              ))}

              {colApps.length === 0 && (
                <div style={{ border: "2px dashed #1e293b", borderRadius: "10px", padding: "24px", textAlign: "center", color: "#334155", fontSize: "13px" }}>
                  Drop here
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedApp && (
        <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}

export default Tracker;
