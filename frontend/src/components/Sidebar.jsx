import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_BASE_URL from "../config/api.js";

// ─── Nav links config ──────────────────────────────────────────────────────
const NAV = [
  { to: "/dashboard",  icon: "📊", label: "Dashboard" },
  { to: "/resume",     icon: "📄", label: "Resume Analysis" },
  { to: "/jobs",       icon: "💼", label: "Matched Jobs" },
  { to: "/tracker",    icon: "🗂️", label: "Application Tracker", group: "Career Tracker" },
  { to: "/applied",    icon: "📋", label: "Applied Jobs" },
  { to: "/suggestions",icon: "🤖", label: "AI Suggestions", group: "Insights" },
  { to: "/profile",    icon: "⚙️", label: "Profile Settings", group: "Account" },
];

// ─── Shared sidebar nav content ────────────────────────────────────────────
function SidebarContent({ onClose }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    if (onClose) onClose();
    navigate("/login");
  };

  let lastGroup = null;

  return (
    <>
      {/* Logo + close button (mobile only) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <span style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px", paddingLeft: "4px" }}>
          AI Career
        </span>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "22px", lineHeight: 1, padding: "4px" }}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {NAV.map(item => {
          const showGroup = item.group && item.group !== lastGroup;
          if (item.group) lastGroup = item.group;
          const isActive = location.pathname === item.to;

          return (
            <React.Fragment key={item.to}>
              {showGroup && (
                <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", marginTop: "20px", marginBottom: "8px", paddingLeft: "14px" }}>
                  {item.group}
                </p>
              )}
              <Link
                to={item.to}
                onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "8px", marginBottom: "4px",
                  textDecoration: "none",
                  color: isActive ? "#38bdf8" : "#94a3b8",
                  backgroundColor: isActive ? "rgba(56,189,248,0.1)" : "transparent",
                  fontWeight: isActive ? "600" : "500",
                  fontSize: "14px",
                  borderLeft: isActive ? "3px solid #38bdf8" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                {item.label}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px", width: "100%", display: "flex", alignItems: "center",
          justifyContent: "center", gap: "8px", padding: "11px 14px", borderRadius: "8px",
          border: "1px solid rgba(248,113,113,0.2)", backgroundColor: "rgba(248,113,113,0.05)",
          color: "#f87171", fontWeight: "600", fontSize: "14px", cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.05)"; }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </>
  );
}

// ─── Notification bell (shared between mobile + desktop header) ────────────
function NotificationBell({ activeUser }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!activeUser?.id) return;
    fetch(`${API_BASE_URL}/notifications/user/${activeUser.id}`)
      .then(r => r.json()).then(setNotifications).catch(console.error);

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/notifications/${activeUser.id}`, msg => {
        if (msg.body) setNotifications(prev => [JSON.parse(msg.body), ...prev]);
      });
    };
    client.activate();
    return () => client.deactivate();
  }, [activeUser]);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowDropdown(d => !d)}
        style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", position: "relative", fontSize: "22px", padding: "4px 8px", borderRadius: "8px" }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "0px", right: "2px",
            backgroundColor: "#ef4444", color: "white",
            fontSize: "10px", fontWeight: "bold",
            width: "16px", height: "16px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop for closing */}
          <div onClick={() => setShowDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          <div style={{
            position: "absolute", right: 0, top: "40px",
            width: "min(320px, calc(100vw - 32px))",
            backgroundColor: "#1e293b", border: "1px solid #334155",
            borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 200, overflow: "hidden"
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155" }}>
              <h4 style={{ margin: 0, color: "white", fontSize: "15px" }}>Notifications</h4>
            </div>
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>No notifications yet.</div>
              ) : notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{
                  padding: "14px 16px", borderBottom: "1px solid #1e293b",
                  backgroundColor: n.read ? "transparent" : "rgba(56,189,248,0.05)",
                  cursor: "pointer", transition: "background 0.2s"
                }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <span style={{ fontSize: "18px" }}>{n.type === "INTERVIEW" ? "📅" : "⚡"}</span>
                    <div>
                      <p style={{ margin: "0 0 3px", fontSize: "13px", color: n.read ? "#94a3b8" : "#f8fafc", fontWeight: n.read ? "400" : "600" }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: "11px", color: "#475569" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Desktop sidebar ───────────────────────────────────────────────────────
export function DesktopSidebar() {
  return (
    <div className="sidebar-container">
      <SidebarContent onClose={null} />
    </div>
  );
}

// ─── Mobile header (hamburger + logo + bell) ───────────────────────────────
export function MobileHeader({ activeUser }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="mobile-header">
        {/* Hamburger */}
        <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand */}
        <span style={{ fontSize: "17px", fontWeight: "800", color: "white", letterSpacing: "-0.5px" }}>
          AI Career
        </span>

        {/* Bell */}
        <NotificationBell activeUser={activeUser} />
      </div>

      {/* Overlay + Drawer */}
      {open && (
        <div className="sidebar-overlay" style={{ display: "block" }} onClick={() => setOpen(false)}>
          <div className={`sidebar-drawer ${open ? "open" : ""}`} onClick={e => e.stopPropagation()}>
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Desktop notification header ───────────────────────────────────────────
export function DesktopHeader({ activeUser }) {
  return (
    <div className="desktop-header" style={{ justifyContent: "flex-end", padding: "14px 32px", borderBottom: "1px solid #1e293b", backgroundColor: "#0f172a" }}>
      <NotificationBell activeUser={activeUser} />
    </div>
  );
}

// Default export keeps backward-compat with any direct <Sidebar /> usage
export default DesktopSidebar;