import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api.js";

function Profile({
  form,
  setForm,
  handleChange,
  handleSubmit,
  setResumeFile
}) {
  const [activeTab, setActiveTab] = useState("personal");
  const [dragOver, setDragOver] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, success: true, message: "" });
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        try {
          const response = await fetch(`${API_BASE_URL}/user/email/${email}`);
          if (response.ok) {
            const data = await response.text();
            if (data && data.trim().length > 0) {
              const userObj = JSON.parse(data);
              setForm({
                id: userObj.id || null,
                name: userObj.name || "",
                email: userObj.email || email,
                skills: userObj.skills || "",
                experience: userObj.experience || "",
                domain: userObj.domain || "",
                linkedinUrl: userObj.linkedinUrl || "",
                internshalaUrl: userObj.internshalaUrl || "",
                naukriUrl: userObj.naukriUrl || "",
                preferredRoles: userObj.preferredRoles || "",
                preferredLocations: userObj.preferredLocations || "",
                jobTypePreference: userObj.jobTypePreference || "Full-time",
                salaryExpectations: userObj.salaryExpectations || ""
              });
            } else {
              setForm({
                id: null,
                name: "",
                email: email,
                skills: "",
                experience: "",
                domain: "",
                linkedinUrl: "",
                internshalaUrl: "",
                naukriUrl: "",
                preferredRoles: "",
                preferredLocations: "",
                jobTypePreference: "Full-time",
                salaryExpectations: ""
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setForm(prev => ({
            ...prev,
            email: email
          }));
        }
      }
    };
    fetchProfile();
  }, [setForm]);

  // Dynamic profile completion rate calculator
  const calculateStrength = () => {
    let completed = 0;
    const totalFields = 11;
    if (form.name?.trim()) completed++;
    if (form.skills?.trim()) completed++;
    if (form.experience?.trim()) completed++;
    if (form.domain?.trim()) completed++;
    if (form.preferredRoles?.trim()) completed++;
    if (form.preferredLocations?.trim()) completed++;
    if (form.salaryExpectations?.trim()) completed++;
    if (form.linkedinUrl?.trim()) completed++;
    if (form.internshalaUrl?.trim()) completed++;
    if (form.naukriUrl?.trim()) completed++;
    if (form.jobTypePreference) completed++; // Always has default

    return Math.round((completed / totalFields) * 100);
  };

  const strength = calculateStrength();

  // Parsing technical skills into visual tags
  const getSkillTags = () => {
    if (!form.skills) return [];
    return form.skills
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const skillTags = getSkillTags();

  // Handle Drag & Drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setResumeFile(file);
        setSelectedFileName(file.name);
        triggerNotification("Resume loaded successfully!", true);
      } else {
        triggerNotification("Please upload a PDF file only", false);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setSelectedFileName(file.name);
      triggerNotification("Resume loaded successfully!", true);
    }
  };

  const triggerNotification = (message, success) => {
    setSaveStatus({ show: true, success, message });
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      triggerNotification("Settings successfully updated!", true);
    } catch (err) {
      triggerNotification("Failed to update profile settings", false);
    }
  };

  // Styled design tokens
  const containerStyle = {
    maxWidth: "1050px",
    margin: "0 auto",
    paddingBottom: "80px",
  };

  const headerCardStyle = {
    background: "linear-gradient(135deg, #111827 0%, #0b0f19 100%)",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "32px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
  };

  const contentLayoutGrid = {
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    gap: "32px",
    alignItems: "start",
  };

  const sidebarTabStyle = (tabId) => ({
    width: "100%",
    padding: "14px 18px",
    borderRadius: "12px",
    border: "none",
    background: activeTab === tabId ? "linear-gradient(135deg, #1e293b 0%, #111827 100%)" : "transparent",
    color: activeTab === tabId ? "#38bdf8" : "#94a3b8",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s ease",
    borderLeft: activeTab === tabId ? "3px solid #38bdf8" : "3px solid transparent",
  });

  const cardContainerStyle = {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.4)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    backgroundColor: "#070a13",
    color: "white",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  };

  const sectionHeaderStyle = {
    fontSize: "22px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  };

  const sectionDescStyle = {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0 0 28px 0"
  };

  return (
    <div style={containerStyle}>
      {/* Toast Notification */}
      {saveStatus.show && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          backgroundColor: saveStatus.success ? "#059669" : "#dc2626",
          color: "white",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
          fontWeight: "700",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "slideIn 0.3s ease",
        }}>
          <span>{saveStatus.success ? "✓" : "⚠"}</span>
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Top Professional Header Banner */}
      <div style={headerCardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {/* Circular Initial Avatar */}
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "900",
            color: "white",
            boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)",
          }}>
            {form.name ? form.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#ffffff" }}>
                {form.name || "Set Your Profile Name"}
              </h2>
              <span style={{
                backgroundColor: strength === 100 ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)",
                color: strength === 100 ? "#10b981" : "#38bdf8",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "800",
                border: strength === 100 ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(56, 189, 248, 0.3)",
              }}>
                {strength}% Profile strength
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
              {form.email} • <span style={{ color: "#38bdf8", fontWeight: "600" }}>{form.domain || "Select job domain"}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div style={{ width: "240px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: "700" }}>
            <span>Profile Quality</span>
            <span>{strength === 100 ? "Excellent" : "Standard"}</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#1e293b", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${strength}%`, height: "100%", backgroundColor: strength === 100 ? "#10b981" : "#38bdf8", borderRadius: "4px", transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>

      {/* Main Split Grid Layout */}
      <div className="profile-layout" style={contentLayoutGrid}>
        {/* Navigation Sidebar Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button type="button" onClick={() => setActiveTab("personal")} style={sidebarTabStyle("personal")}>
            <span style={{ fontSize: "16px" }}>👤</span> Personal Details
          </button>
          <button type="button" onClick={() => setActiveTab("skills")} style={sidebarTabStyle("skills")}>
            <span style={{ fontSize: "16px" }}>📄</span> Resume & Skills
          </button>
          <button type="button" onClick={() => setActiveTab("platforms")} style={sidebarTabStyle("platforms")}>
            <span style={{ fontSize: "16px" }}>💼</span> Connected Platforms
          </button>
          <button type="button" onClick={() => setActiveTab("preferences")} style={sidebarTabStyle("preferences")}>
            <span style={{ fontSize: "16px" }}>🎯</span> Career Preferences
          </button>

          <div style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "12px",
            border: "1px dashed #1e293b",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            textAlign: "center"
          }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>
              Linked profile variables dynamically optimize real-time job scraping and ATS evaluation accuracy.
            </p>
          </div>
        </div>

        {/* Tab Form Panel Content */}
        <form onSubmit={handleFormSubmit}>
          {activeTab === "personal" && (
            <div style={cardContainerStyle}>
              <h3 style={sectionHeaderStyle}>👤 Personal Details</h3>
              <p style={sectionDescStyle}>Manage your identity, experience scale, and general focus domain.</p>
              
              <div className="half-grid">
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    name="name"
                    placeholder="Enter your name"
                    value={form.name || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address (Read-only)</label>
                  <input
                    name="email"
                    value={form.email || ""}
                    style={{ ...inputStyle, backgroundColor: "#0b0f19", color: "#64748b", cursor: "not-allowed" }}
                    disabled
                  />
                </div>
              </div>

              <div className="half-grid" style={{ marginTop: "20px", marginBottom: "32px" }}>
                <div>
                  <label style={labelStyle}>Years of Experience</label>
                  <input
                    name="experience"
                    placeholder="e.g. 2 years"
                    value={form.experience || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Target Job Domain</label>
                  <input
                    name="domain"
                    placeholder="e.g. Fullstack Engineer"
                    value={form.domain || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" style={saveButtonStyle}>Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div style={cardContainerStyle}>
              <h3 style={sectionHeaderStyle}>📄 Resume & Skills</h3>
              <p style={sectionDescStyle}>Load your current CV for parsing and define primary technical filters.</p>

              {/* Drag and Drop Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: dragOver ? "2px dashed #38bdf8" : "2px dashed #1e293b",
                  backgroundColor: dragOver ? "rgba(56, 189, 248, 0.05)" : "#070a13",
                  borderRadius: "14px",
                  padding: "40px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  marginBottom: "28px",
                  position: "relative"
                }}
              >
                <input
                  type="file"
                  id="resume-upload-input"
                  accept="application/pdf"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
                <label htmlFor="resume-upload-input" style={{ cursor: "pointer", display: "block" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>📤</div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "white", fontWeight: "700" }}>
                    Drag & Drop your Resume here
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    Supports PDF format only (Max 5MB)
                  </p>
                  
                  {selectedFileName ? (
                    <div style={{
                      marginTop: "16px",
                      padding: "8px 16px",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "8px",
                      color: "#10b981",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>📄 Selected:</span>
                      <span>{selectedFileName}</span>
                    </div>
                  ) : form.id ? (
                    <div style={{
                      marginTop: "16px",
                      padding: "8px 16px",
                      backgroundColor: "rgba(56, 189, 248, 0.1)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      borderRadius: "8px",
                      color: "#38bdf8",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>✓ Loaded Resume Sync Available</span>
                    </div>
                  ) : null}
                </label>
              </div>

              {/* Skills Tag Area */}
              <div style={{ marginBottom: "32px" }}>
                <label style={labelStyle}>Technical Skills (Comma separated)</label>
                <input
                  name="skills"
                  placeholder="e.g. React, Spring Boot, Java, AWS"
                  value={form.skills || ""}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                  onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                />

                {skillTags.length > 0 && (
                  <div style={{ marginTop: "14px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>
                      Active Parsed Skill Badges
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {skillTags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: "rgba(56, 189, 248, 0.1)",
                            border: "1px solid rgba(56, 189, 248, 0.2)",
                            color: "#38bdf8",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" style={saveButtonStyle}>Save & Upload</button>
              </div>
            </div>
          )}

          {activeTab === "platforms" && (
            <div style={cardContainerStyle}>
              <h3 style={sectionHeaderStyle}>💼 Connected Channels</h3>
              <p style={sectionDescStyle}>Synchronize external professional profiles to scrape real-time job board data.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
                {/* LinkedIn Connection Card */}
                <div style={channelCardStyle("rgba(10, 102, 194, 0.1)", "rgba(10, 102, 194, 0.2)")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>🔗</span>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "#0a66c2", fontWeight: "800" }}>LinkedIn Profile</h4>
                    </div>
                    {form.linkedinUrl?.trim() ? (
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "800", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "4px 10px", borderRadius: "20px" }}>
                        ✓ Sync Ready
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Disconnected</span>
                    )}
                  </div>
                  <input
                    name="linkedinUrl"
                    placeholder="https://www.linkedin.com/in/username"
                    value={form.linkedinUrl || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#0a66c2"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                  <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                    Required for direct matchmaking evaluation with scraped roles.
                  </p>
                </div>

                {/* Internshala Connection Card */}
                <div style={channelCardStyle("rgba(249, 115, 22, 0.1)", "rgba(249, 115, 22, 0.2)")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>🎓</span>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "#f97316", fontWeight: "800" }}>Internshala Profile</h4>
                    </div>
                    {form.internshalaUrl?.trim() ? (
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "800", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "4px 10px", borderRadius: "20px" }}>
                        ✓ Sync Ready
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Disconnected</span>
                    )}
                  </div>
                  <input
                    name="internshalaUrl"
                    placeholder="https://internshala.com/student/profile/username"
                    value={form.internshalaUrl || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#f97316"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                  <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                    Used for dynamic matching against internships and entry-level developer positions.
                  </p>
                </div>

                {/* Naukri Connection Card */}
                <div style={channelCardStyle("rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.2)")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>💼</span>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "#10b981", fontWeight: "800" }}>Naukri Profile</h4>
                    </div>
                    {form.naukriUrl?.trim() ? (
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "800", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "4px 10px", borderRadius: "20px" }}>
                        ✓ Sync Ready
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Disconnected</span>
                    )}
                  </div>
                  <input
                    name="naukriUrl"
                    placeholder="https://www.naukri.com/code/username"
                    value={form.naukriUrl || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#10b981"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                  <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                    Enables parsing and tracking sync against large enterprise job postings.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" style={saveButtonStyle}>Save Connections</button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div style={cardContainerStyle}>
              <h3 style={sectionHeaderStyle}>🎯 Target Job Preferences</h3>
              <p style={sectionDescStyle}>Set target parameters so the automated agent extracts ideal recommendations.</p>

              <div className="half-grid">
                <div>
                  <label style={labelStyle}>Preferred Job Roles</label>
                  <input
                    name="preferredRoles"
                    placeholder="e.g. React Developer, Backend Engineer"
                    value={form.preferredRoles || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Preferred Locations</label>
                  <input
                    name="preferredLocations"
                    placeholder="e.g. Remote, Bangalore, Delhi"
                    value={form.preferredLocations || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                </div>
              </div>

              <div className="half-grid" style={{ marginTop: "20px", marginBottom: "32px" }}>
                <div>
                  <label style={labelStyle}>Employment Preference</label>
                  <select
                    name="jobTypePreference"
                    value={form.jobTypePreference || "Full-time"}
                    onChange={handleChange}
                    style={{
                      ...inputStyle,
                      backgroundColor: "#070a13",
                      cursor: "pointer"
                    }}
                  >
                    <option value="Full-time">Full-Time Job</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract / Freelance</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Annual Salary Expectations</label>
                  <input
                    name="salaryExpectations"
                    placeholder="e.g. ₹6,00,000 - ₹8,00,000"
                    value={form.salaryExpectations || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                    onBlur={(e) => e.target.style.borderColor = "#1e293b"}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" style={saveButtonStyle}>Save Target Criteria</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Inline styling helpers for UI uniformity
const channelCardStyle = (bgColor, borderColor) => ({
  backgroundColor: bgColor,
  border: `1px solid ${borderColor}`,
  borderRadius: "14px",
  padding: "20px",
});

const saveButtonStyle = {
  padding: "12px 32px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#38bdf8",
  color: "white",
  fontWeight: "800",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 6px 16px -3px rgba(56, 189, 248, 0.4)",
  transition: "all 0.2s ease",
};

export default Profile;