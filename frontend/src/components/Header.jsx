import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API_BASE_URL from "../config/api.js";

function Header({ activeUser }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!activeUser?.id) return;

    // Fetch initial notifications
    fetch(`${API_BASE_URL}/notifications/user/${activeUser.id}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);

    // Setup STOMP WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function () {
      client.subscribe(`/topic/notifications/${activeUser.id}`, (message) => {
        if (message.body) {
          const notif = JSON.parse(message.body);
          setNotifications(prev => [notif, ...prev]);
        }
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [activeUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 32px', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }}>
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', position: 'relative', fontSize: '24px' }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white',
              fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute', right: 0, top: '40px', width: '320px', backgroundColor: '#1e293b',
            border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            zIndex: 1000, overflow: 'hidden'
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: 'white' }}>Notifications</h4>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No notifications yet.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    style={{ 
                      padding: '16px', borderBottom: '1px solid #334155', 
                      backgroundColor: n.read ? 'transparent' : 'rgba(56, 189, 248, 0.05)',
                      cursor: 'pointer', transition: 'background-color 0.2s' 
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>
                        {n.type === 'INTERVIEW' ? '📅' : '⚡'}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: n.read ? '#cbd5e1' : '#f8fafc', fontWeight: n.read ? 'normal' : '600' }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
