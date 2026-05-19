import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.text();

            if (data === "OTP Sent") {
                toast.success("OTP sent to your email!");
                navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
            } else {
                toast.error(data); // "User Not Found"
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to bottom right, #020617, #0f172a)", padding: "40px 20px" }}>
            <form onSubmit={handleRequestOtp} style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "450px", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
                <h1 style={{ textAlign: "center", marginBottom: "16px", color: "white", fontSize: "32px" }}>Forgot Password</h1>
                <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "32px", fontSize: "14px", lineHeight: "1.6" }}>Enter your registered email address and we will send you an OTP to reset your password.</p>

                <input
                    type="email"
                    placeholder="Registered Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "16px", marginBottom: "24px", borderRadius: "10px", border: email ? "1px solid #334155" : "1px solid #ef4444", boxSizing: "border-box", backgroundColor: "#0f172a", color: "white" }}
                />

                <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px", border: "none", borderRadius: "10px", backgroundColor: loading ? "#64748b" : "#38bdf8", color: "white", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", fontSize: "16px" }}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                </button>

                <p style={{ marginTop: "24px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                    Remember your password? <Link to="/login" style={{ color: "#38bdf8", marginLeft: "8px", textDecoration: "none", fontWeight: "600" }}>Login</Link>
                </p>
            </form>
        </div>
    );
}

export default ForgotPassword;
