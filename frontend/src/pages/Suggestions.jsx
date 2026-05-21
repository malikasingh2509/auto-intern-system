import { useEffect, useState, useRef } from "react";
import SuggestionCard from "../components/SuggestionCard";
import API_BASE_URL from "../config/api.js";

function Suggestions({ suggestions, userId }) {
  const [activeView, setActiveView] = useState("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Resolve actual userId from prop or localStorage fallback
  const getEffectiveUserId = () => {
    if (userId) return userId;
    const cached = localStorage.getItem("userId");
    return cached ? parseInt(cached) : null;
  };

  // Initialize messages from localStorage if available
  const [messages, setMessages] = useState(() => {
    const uid = userId || localStorage.getItem("userId");
    if (uid) {
      const saved = localStorage.getItem(`chat_history_${uid}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 1,
        sender: "ai",
        text: "👋 **Hello! I am your AI Career Coach.**\n\nI have fully analyzed your resume context, experience tier, and target preferences. I am here to help you get hired! What would you like to do today?\n\n- ✉️ Draft a highly tailored **Cover Letter** for a role\n- 📄 **Review my Resume** against my target skills and get ATS suggestions\n- 💡 Prepare for a **Technical Interview** with questions and mock evaluations\n- 📊 Get advice on **Job Search Strategy** and expanding platform reach\n\n*Feel free to ask me anything!*",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (userId && messages.length > 0) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Smooth scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickActions = [
    {
      label: "✉️ Write a Cover Letter",
      prompt: "Draft a highly professional cover letter tailored to my resume details and target job preferences. Make it ready to send to recruiters."
    },
    {
      label: "📄 Improve my Resume",
      prompt: "Review my resume details, experience, and skills. Identify any gaps, missing keywords, and suggest improvements to maximize my ATS score."
    },
    {
      label: "📊 Check Job Fit",
      prompt: "Based on my skills and domain, analyze my job readiness. What specific technical projects should I build next to stand out on LinkedIn and Internshala?"
    },
    {
      label: "💡 Mock Interview Prep",
      prompt: "Generate a list of 5 advanced technical interview questions based on my listed skills, complete with ideal answers and core concepts."
    }
  ];

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    if (!textToSend) {
      setInput("");
    }

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: prompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Compile standard role/content history format for the backend
      const chatHistory = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const effectiveUserId = getEffectiveUserId();
      if (!effectiveUserId) {
        throw new Error("User not identified. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/chat/${effectiveUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: prompt.trim(),
          history: chatHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg = {
          id: Date.now() + 1,
          sender: "ai",
          text: data.reply || "I encountered an empty response. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("Server responded with error status");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: "⚠️ **Service is temporarily unavailable.**\n\nI was unable to establish a secure connection to the Gemini AI models. Please ensure that your database is running, the backend is compiled, and your standard `GEMINI_API_KEY` environment variable is fully valid and active.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChatHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      const initial = [
        {
          id: 1,
          sender: "ai",
          text: "👋 **Chat history cleared.**\n\nHow can I help you optimize your profile, review your resume, or draft cover letters today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ];
      setMessages(initial);
      if (userId) {
        localStorage.removeItem(`chat_history_${userId}`);
      }
    }
  };

  // Safe and high-fidelity regex-based markdown parser
  const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text;

    // Escape basic HTML to prevent injection
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre style="background-color:#070a13; border:1px solid #1e293b; padding:14px; border-radius:10px; overflow-x:auto; font-family:monospace; color:#38bdf8; margin:12px 0; font-size:13px; line-height:1.5; white-space:pre-wrap; word-break:break-all;">$1</pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background-color:#070a13; padding:2px 6px; border-radius:6px; font-family:monospace; color:#38bdf8; font-size:13px;">$1</code>');

    // Headers
    html = html.replace(/^### (.*?)(?:\n|$)/gm, '<h3 style="color:#ffffff; margin:18px 0 8px 0; font-size:16px; font-weight:800; display:block;">$1</h3>');
    html = html.replace(/^## (.*?)(?:\n|$)/gm, '<h2 style="color:#ffffff; margin:24px 0 10px 0; font-size:18px; font-weight:800; display:block; border-bottom:1px solid #1e293b; padding-bottom:6px;">$1</h2>');
    html = html.replace(/^# (.*?)(?:\n|$)/gm, '<h1 style="color:#ffffff; margin:32px 0 12px 0; font-size:22px; font-weight:900; display:block;">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff; font-weight:700;">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em style="color:#94a3b8; font-style:italic;">$1</em>');

    // Bullet points
    html = html.replace(/^\- (.*?)(?:\n|$)/gm, '<li style="margin-left:20px; margin-bottom:6px; color:#cbd5e1; list-style-type:disc;">$1</li>');
    html = html.replace(/^\* (.*?)(?:\n|$)/gm, '<li style="margin-left:20px; margin-bottom:6px; color:#cbd5e1; list-style-type:disc;">$1</li>');

    // Numbered lists
    html = html.replace(/^\d+\.\s(.*?)(?:\n|$)/gm, '<li style="margin-left:20px; margin-bottom:6px; color:#cbd5e1; list-style-type:decimal;">$1</li>');

    // Line breaks
    html = html.replace(/\n/g, "<br />");

    return html;
  };

  // Styled design tokens
  const containerStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    paddingBottom: "40px",
  };

  const headerPanelStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  };

  const tabContainerStyle = {
    display: "flex",
    gap: "12px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "12px",
    marginBottom: "28px",
  };

  const tabButtonStyle = (isActive) => ({
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: isActive ? "linear-gradient(135deg, #1e293b 0%, #111827 100%)" : "transparent",
    color: isActive ? "#38bdf8" : "#94a3b8",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    borderBottom: isActive ? "2px solid #38bdf8" : "2px solid transparent",
  });

  const chatContainerStyle = {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    height: "640px",
    boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.4)",
    overflow: "hidden",
  };

  const chatHeaderStyle = {
    padding: "16px 24px",
    borderBottom: "1px solid #1e293b",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const messagesBoxStyle = {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const bubbleWrapperStyle = (sender) => ({
    display: "flex",
    justifyContent: sender === "user" ? "flex-end" : "flex-start",
    width: "100%",
  });

  const avatarStyle = (sender) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: sender === "user" ? "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)" : "linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "800",
    color: "white",
    marginRight: sender === "user" ? "0" : "12px",
    marginLeft: sender === "user" ? "12px" : "0",
    boxShadow: "0 0 10px rgba(56, 189, 248, 0.2)",
  });

  const bubbleStyle = (sender) => ({
    maxWidth: "75%",
    padding: "16px 20px",
    borderRadius: "16px",
    borderTopLeftRadius: sender === "ai" ? "4px" : "16px",
    borderTopRightRadius: sender === "user" ? "4px" : "16px",
    backgroundColor: sender === "user" ? "#0369a1" : "#1e293b",
    border: sender === "user" ? "1px solid #0284c7" : "1px solid #334155",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.6",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  });

  const inputAreaStyle = {
    padding: "18px 24px",
    borderTop: "1px solid #1e293b",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  const actionChipStyle = {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    backgroundColor: "#070a13",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  return (
    <div style={containerStyle}>
      {/* Header Info Banner */}
      <div style={headerPanelStyle}>
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "32px", fontWeight: "800", color: "#ffffff" }}>
            AI Suggestions & Career Coaching
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "15px" }}>
            Use the interactive coach to tailor resume details, generate custom cover letters, or check checklist suggestions.
          </p>
        </div>

        {/* Live status badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          padding: "6px 14px",
          borderRadius: "20px",
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
            display: "inline-block",
            boxShadow: "0 0 8px #10b981"
          }} />
          <span style={{ fontSize: "12px", fontWeight: "800", color: "#10b981" }}>COACH ONLINE</span>
        </div>
      </div>

      {/* Tabs Switcher Row */}
      <div style={tabContainerStyle}>
        <button
          type="button"
          onClick={() => setActiveView("chat")}
          style={tabButtonStyle(activeView === "chat")}
        >
          💬 AI Career Chatbot
        </button>
        <button
          type="button"
          onClick={() => setActiveView("checklist")}
          style={tabButtonStyle(activeView === "checklist")}
        >
          📋 ATS Optimization Tips ({suggestions ? suggestions.length : 0})
        </button>
      </div>

      {/* View Content Renderer */}
      {activeView === "chat" ? (
        <div style={chatContainerStyle}>
          {/* Chat Panel Top Header */}
          <div style={chatHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "20px" }}>🤖</div>
              <div>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "white" }}>
                  Interactive AI Assistant
                </h3>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Powered by Gemini 2.5 Flash</span>
              </div>
            </div>

            <button
              type="button"
              onClick={clearChatHistory}
              style={{
                background: "transparent",
                border: "none",
                color: "#f43f5e",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "8px",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "rgba(244, 63, 94, 0.1)"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
            >
              🗑️ Clear Session
            </button>
          </div>

          {/* Messages Display Box */}
          <div style={messagesBoxStyle}>
            {messages.map((msg) => (
              <div key={msg.id} style={bubbleWrapperStyle(msg.sender)}>
                {msg.sender === "ai" && <div style={avatarStyle("ai")}>AI</div>}
                
                <div style={bubbleStyle(msg.sender)}>
                  <div
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                    className="chatbot-message-content"
                  />
                  <div style={{
                    textAlign: "right",
                    fontSize: "10px",
                    color: "#64748b",
                    marginTop: "8px",
                    fontWeight: "600"
                  }}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && <div style={avatarStyle("user")}>ME</div>}
              </div>
            ))}

            {/* Pulsing loading indicator */}
            {loading && (
              <div style={bubbleWrapperStyle("ai")}>
                <div style={avatarStyle("ai")}>AI</div>
                <div style={{
                  ...bubbleStyle("ai"),
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px"
                }}>
                  <div style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: "#38bdf8",
                    borderRadius: "50%",
                    animation: "bounce 1.4s infinite ease-in-out both"
                  }} />
                  <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "600" }}>
                    AI Career Coach is analyzing profile...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Inputs & Suggestion Chips Panel */}
          <div style={inputAreaStyle}>
            {/* Horizontal scrollable quick prompts */}
            <div style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "none"
            }}>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(action.prompt)}
                  style={actionChipStyle}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = "#38bdf8";
                    e.target.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = "#1e293b";
                    e.target.style.color = "#94a3b8";
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Primary message input bar */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to review resume, write a cover letter, or suggest technical concepts..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: "1px solid #1e293b",
                  backgroundColor: "#070a13",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  cursor: loading ? "not-allowed" : "text"
                }}
                onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                onBlur={(e) => e.target.style.borderColor = "#1e293b"}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  padding: "14px 28px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: loading || !input.trim() ? "#1e293b" : "#38bdf8",
                  color: loading || !input.trim() ? "#64748b" : "white",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: loading || !input.trim() ? "none" : "0 4px 14px -3px rgba(56, 189, 248, 0.4)"
                }}
              >
                Send 🚀
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ATS Checklist View Panel */
        <div>
          {suggestions && suggestions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#111827",
                border: "2px dashed #1e293b",
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#ffffff", margin: "0 0 8px 0" }}>
                ATS Scoring checklist is clean!
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 auto", maxWidth: "480px" }}>
                Fantastic job! Your profile details are complete, technical keywords are fully optimized, and you have connected all external professional career channels.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Suggestions;