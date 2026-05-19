import { useEffect } from "react";
import API_BASE_URL from "../config/api.js";

function Profile({
  form,
  setForm,
  handleChange,
  handleSubmit,
  setResumeFile
}) {
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

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
    color: "white",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const sectionCardStyle = {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "60px" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
          Profile Settings
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>
          Manage your personal details, connected job channels, and career expectations.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: Personal Details */}
        <div style={sectionCardStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            👤 Personal Details
          </h2>
          
          <div className="half-grid">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                name="name"
                placeholder="John Doe"
                value={form.name || ""}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                onBlur={(e) => e.target.style.borderColor = "#1e293b"}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                name="email"
                placeholder="john@example.com"
                value={form.email || ""}
                onChange={handleChange}
                style={inputStyle}
                disabled
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Technical Skills (Comma separated)</label>
            <input
              name="skills"
              placeholder="React, Spring Boot, MySQL, Java"
              value={form.skills || ""}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
              onBlur={(e) => e.target.style.borderColor = "#1e293b"}
            />
          </div>

          <div className="half-grid">
            <div>
              <label style={labelStyle}>Years of Experience</label>
              <input
                name="experience"
                placeholder="2 years"
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
                placeholder="Fullstack Engineering"
                value={form.domain || ""}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                onBlur={(e) => e.target.style.borderColor = "#1e293b"}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Upload Resume (PDF format)</label>
            <input
              type="file"
              onChange={(e) => setResumeFile(e.target.files[0])}
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                padding: "10px 0"
              }}
            />
          </div>
        </div>

        {/* SECTION 2: Career Platforms Connected */}
        <div style={sectionCardStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", marginBottom: "20px" }}>
            🔗 Connected Professional Platforms
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* LinkedIn */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div
                style={{
                  width: "120px",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(10, 102, 194, 0.15)",
                  color: "#0a66c2",
                  fontWeight: "700",
                  textAlign: "center",
                  fontSize: "13px",
                  border: "1px solid rgba(10, 102, 194, 0.3)"
                }}
              >
                LinkedIn
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
            </div>

            {/* Internshala */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div
                style={{
                  width: "120px",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(249, 115, 22, 0.15)",
                  color: "#f97316",
                  fontWeight: "700",
                  textAlign: "center",
                  fontSize: "13px",
                  border: "1px solid rgba(249, 115, 22, 0.3)"
                }}
              >
                Internshala
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
            </div>

            {/* Naukri */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div
                style={{
                  width: "120px",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  fontWeight: "700",
                  textAlign: "center",
                  fontSize: "13px",
                  border: "1px solid rgba(16, 185, 129, 0.3)"
                }}
              >
                Naukri
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
            </div>
          </div>
        </div>

        {/* SECTION 3: Job Preferences */}
        <div style={sectionCardStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", marginBottom: "20px" }}>
            🎯 Target Job Preferences
          </h2>
          
          <div className="half-grid">
            <div>
              <label style={labelStyle}>Preferred Roles</label>
              <input
                name="preferredRoles"
                placeholder="React Developer, Backend Engineer"
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
                placeholder="Remote, Bangalore, New Delhi"
                value={form.preferredLocations || ""}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                onBlur={(e) => e.target.style.borderColor = "#1e293b"}
              />
            </div>
          </div>

          <div className="half-grid" style={{ marginBottom: 0 }}>
            <div>
              <label style={labelStyle}>Employment Preference</label>
              <select
                name="jobTypePreference"
                value={form.jobTypePreference || "Full-time"}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  backgroundColor: "#0f172a",
                  cursor: "pointer"
                }}
              >
                <option value="Full-time">Full-Time Job</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Freelance/Contract</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Annual Salary Expectations</label>
              <input
                name="salaryExpectations"
                placeholder="₹6,00,000 - ₹8,00,000"
                value={form.salaryExpectations || ""}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                onBlur={(e) => e.target.style.borderColor = "#1e293b"}
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: "12px",
            backgroundColor: "#38bdf8",
            color: "white",
            fontWeight: "800",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 10px 20px -5px rgba(56, 189, 248, 0.4)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0284c7";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#38bdf8";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Save Complete Profile Settings
        </button>
      </form>
    </div>
  );
}

export default Profile;