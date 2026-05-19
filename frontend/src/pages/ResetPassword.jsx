import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

function ResetPassword() {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
    
    const location = useLocation();
    const navigate = useNavigate();
    
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get("email");

    useEffect(() => {
        if (!email) {
            toast.error("Invalid password reset link.");
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            toast.error("Please fill all fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otp.trim(), newPassword })
            });

            if (!response.ok) {
                toast.error("Server error. Please try again later.");
                setLoading(false);
                return;
            }

            const data = await response.text();

            if (data === "Password Updated") {
                toast.success("Password updated successfully!");
                navigate("/login");
            } else {
                toast.error(data); // "Invalid OTP", "OTP Expired", etc.
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timeLeft > 540) { // Prevent spamming within first minute
            toast.info("Please wait a moment before resending OTP");
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (!response.ok) {
                toast.error("Server error. Please try again later.");
                return;
            }
            const data = await response.text();
            if (data === "OTP Sent") {
                toast.success("New OTP sent to your email!");
                setTimeLeft(600); // Reset timer
            } else {
                toast.error(data);
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to bottom right, #020617, #0f172a)", padding: "40px 20px" }}>
            <form onSubmit={handleResetPassword} style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "450px", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
                <h1 style={{ textAlign: "center", marginBottom: "16px", color: "white", fontSize: "32px" }}>Reset Password</h1>
                <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "24px", fontSize: "14px", lineHeight: "1.6" }}>
                    We sent a 6-digit OTP to <b>{email}</b>.
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600" }}>Enter OTP Code</label>
                    <span style={{ color: timeLeft > 0 ? "#38bdf8" : "#ef4444", fontSize: "13px", fontWeight: "600" }}>
                        {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "OTP Expired"}
                    </span>
                </div>
                
                <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ width: "100%", padding: "16px", marginBottom: "20px", borderRadius: "10px", border: otp.length === 6 ? "1px solid #334155" : "1px solid #ef4444", boxSizing: "border-box", backgroundColor: "#0f172a", color: "white", letterSpacing: "4px", fontSize: "18px", textAlign: "center" }}
                />

                <div style={{ position: "relative", marginBottom: "20px" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password *"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ width: "100%", padding: "16px", borderRadius: "10px", border: newPassword.length >= 6 ? "1px solid #334155" : "1px solid #ef4444", boxSizing: "border-box", backgroundColor: "#0f172a", color: "white" }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                <div style={{ position: "relative", marginBottom: "32px" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm New Password *"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: "100%", padding: "16px", borderRadius: "10px", border: (confirmPassword && confirmPassword === newPassword) ? "1px solid #334155" : "1px solid #ef4444", boxSizing: "border-box", backgroundColor: "#0f172a", color: "white" }}
                    />
                </div>

                <button type="submit" disabled={loading || timeLeft === 0} style={{ width: "100%", padding: "16px", border: "none", borderRadius: "10px", backgroundColor: (loading || timeLeft === 0) ? "#64748b" : "#10b981", color: "white", fontWeight: "bold", cursor: (loading || timeLeft === 0) ? "not-allowed" : "pointer", fontSize: "16px", marginBottom: "20px" }}>
                    {loading ? "Updating..." : "Reset Password"}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #334155", paddingTop: "20px" }}>
                    <button type="button" onClick={handleResendOtp} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "14px", cursor: "pointer", textDecoration: "underline" }}>
                        Resend OTP
                    </button>
                    <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Back to Login</Link>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;
