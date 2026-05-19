import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(email);
    const emailBorder = !touched ? "#334155" : (emailValid ? "#334155" : "#ef4444");

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setTouched(true);

        if (!email.trim()) {
            toast.error("Please enter your email");
            return;
        }

        if (!emailValid) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() })
            });

            if (!response.ok) {
                toast.error("Server error. Please try again later.");
                return;
            }

            const data = await response.text();

            if (data === "OTP Sent") {
                toast.success("OTP sent! Check your email inbox.");
                navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
            } else if (data === "User Not Found") {
                toast.error("No account found with this email address.");
            } else {
                toast.error(data);
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
            background: "linear-gradient(to bottom right, #020617, #0f172a)", padding: "40px 20px"
        }}>
            <form onSubmit={handleRequestOtp} style={{
                backgroundColor: "#1e293b", padding: "40px", borderRadius: "20px",
                width: "100%", maxWidth: "450px", boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
            }}>
                {/* Icon */}
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <div style={{
                        display: "inline-flex", width: "56px", height: "56px", borderRadius: "50%",
                        backgroundColor: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)",
                        alignItems: "center", justifyContent: "center", fontSize: "24px"
                    }}>
                        🔐
                    </div>
                </div>

                <h1 style={{ textAlign: "center", marginBottom: "8px", color: "white", fontSize: "26px", fontWeight: "700" }}>
                    Forgot Password?
                </h1>
                <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "32px", fontSize: "14px", lineHeight: "1.7" }}>
                    Enter your registered email and we'll send a 6-digit OTP to reset your password.
                </p>

                <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", fontWeight: "600", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Email Address
                </label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    style={{
                        width: "100%", padding: "16px", marginBottom: "24px",
                        borderRadius: "10px", border: `1px solid ${emailBorder}`,
                        boxSizing: "border-box", backgroundColor: "#0f172a", color: "white",
                        outline: "none", fontSize: "15px"
                    }}
                />

                <button type="submit" disabled={loading} style={{
                    width: "100%", padding: "16px", border: "none", borderRadius: "10px",
                    backgroundColor: loading ? "#334155" : "#38bdf8",
                    color: "white", fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "16px", transition: "background-color 0.2s"
                }}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                </button>

                <p style={{ marginTop: "24px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                    Remember your password?{" "}
                    <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "600" }}>
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default ForgotPassword;
