import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [skills, setSkills] = useState("");
    const [experience, setExperience] = useState("");
    const [domain, setDomain] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim() || !skills.trim() || !experience.trim() || !domain.trim()) {
            toast.error("Please fill all fields");
            return;
        }

        if (!resumeFile) {
            toast.error("Please upload your resume");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            // 1. Create User
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    skills: skills.trim(),
                    experience: experience.trim(),
                    domain: domain.trim()
                })
            });

            if (!response.ok) {
                toast.error("Server error. Please try again later.");
                setLoading(false);
                return;
            }

            const data = await response.text();
            if (data !== "Account Created") {
                toast.error(data);
                setLoading(false);
                return;
            }

            // 2. Fetch User ID to upload resume
            if (resumeFile) {
                const userRes = await fetch(`${API_BASE_URL}/user/email/${email.trim()}`);
                if (userRes.ok) {
                    const userObj = await userRes.json();
                    if (userObj && userObj.id) {
                        const formData = new FormData();
                        formData.append("file", resumeFile);
                        await fetch(`${API_BASE_URL}/upload-resume/${userObj.id}`, {
                            method: "POST",
                            body: formData
                        });
                    }
                }
            }

            toast.success("Registration successful");
            navigate("/login");
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Network error. Please make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (value) => ({
        width: "100%", padding: "14px", marginBottom: "16px", borderRadius: "8px",
        border: value ? "1px solid #334155" : "1px solid #ef4444", 
        backgroundColor: "#0f172a", color: "white", boxSizing: "border-box"
    });

    return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to bottom right, #020617, #0f172a)", padding: "40px 20px" }}>
        <form onSubmit={handleRegister} style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "500px", boxShadow: "0 0 30px rgba(0,0,0,0.4)" }}>
            <h1 style={{ textAlign: "center", marginBottom: "30px", color: "white" }}>Create Account</h1>

            <div className="half-grid">
                <input placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle(name)} />
                <input placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(email)} />
            </div>

            <div style={{ position: "relative", marginBottom: "16px" }}>
                <input type={showPassword ? "text" : "password"} placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle(password), marginBottom: 0 }} />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>
            
            <div className="half-grid">
                <input placeholder="Target Domain *" value={domain} onChange={(e) => setDomain(e.target.value)} style={inputStyle(domain)} />
                <input placeholder="Experience *" value={experience} onChange={(e) => setExperience(e.target.value)} style={inputStyle(experience)} />
            </div>

            <input placeholder="Skills (comma separated) *" value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle(skills)} />
            
            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Upload Resume (PDF) *</label>
                <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} style={{ color: "white", fontSize: "14px", border: resumeFile ? "none" : "1px dashed #ef4444", padding: "10px", borderRadius: "8px", width: "100%", boxSizing: "border-box" }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", border: "none", borderRadius: "8px", backgroundColor: loading ? "#64748b" : "#38bdf8", color: "white", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Registering..." : "Create Account"}
            </button>

            <p style={{ marginTop: "20px", textAlign: "center", color: "white" }}>
                Already have an account? <Link to="/login" style={{ color: "#38bdf8", marginLeft: "8px", textDecoration: "none" }}>Login</Link>
            </p>
        </form>
    </div>
    );
}
export default Register;