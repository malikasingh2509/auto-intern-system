import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

function ResetPassword() {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [touched, setTouched] = useState({ otp: false, newPassword: false, confirmPassword: false });

    // Timer — 10 minutes
    const [timeLeft, setTimeLeft] = useState(600);
    const lastResend = useRef(Date.now());

    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get("email");

    useEffect(() => {
        if (!email) {
            toast.error("Invalid reset link. Please request a new OTP.");
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const id = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(id);
    }, [timeLeft]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    // Border helpers — only show red AFTER the field has been touched
    const otpBorder      = !touched.otp      ? "#334155" : (otp.length === 6            ? "#334155" : "#ef4444");
    const pwBorder       = !touched.newPassword ? "#334155" : (newPassword.length >= 6  ? "#334155" : "#ef4444");
    const confirmBorder  = !touched.confirmPassword ? "#334155"
                         : (confirmPassword && confirmPassword === newPassword ? "#334155" : "#ef4444");

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Mark all as touched so validation borders appear
        setTouched({ otp: true, newPassword: true, confirmPassword: true });

        if (!otp.trim() || otp.length !== 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }

        if (!newPassword.trim() || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (timeLeft <= 0) {
            toast.error("OTP has expired. Please request a new one.");
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
                return;
            }

            const data = await response.text();

            if (data === "Password Updated") {
                toast.success("Password reset successful! Please login with your new password.");
                setTimeout(() => navigate("/login"), 1500);
            } else if (data === "OTP Expired") {
                toast.error("OTP has expired. Please request a new one.");
                setTimeLeft(0);
            } else if (data === "Invalid OTP") {
                toast.error("Invalid OTP. Please check and try again.");
            } else {
                toast.error(data);
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const secondsSinceLastResend = (Date.now() - lastResend.current) / 1000;
        if (secondsSinceLastResend < 60) {
            toast.info(`Please wait ${Math.ceil(60 - secondsSinceLastResend)}s before resending.`);
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
                toast.success("New OTP sent! Check your email.");
                setTimeLeft(600);
                lastResend.current = Date.now();
                // Reset form fields for the new OTP
                setOtp("");
                setTouched({ otp: false, newPassword: false, confirmPassword: false });
            } else {
                toast.error(data);
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
            background: "linear-gradient(to bottom right, #020617, #0f172a)", padding: "40px 20px"
        }}>
            <form onSubmit={handleResetPassword} style={{
                backgroundColor: "#1e293b", padding: "40px", borderRadius: "20px",
                width: "100%", maxWidth: "450px", boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
            }}>
                <h1 style={{ textAlign: "center", marginBottom: "8px", color: "white", fontSize: "28px", fontWeight: "700" }}>
                    Reset Password
                </h1>
                <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "28px", fontSize: "14px", lineHeight: "1.6" }}>
                    Enter the OTP sent to <b style={{ color: "#e2e8f0" }}>{email}</b>
                </p>

                {/* Timer badge */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <span style={{
                        display: "inline-block", padding: "6px 16px", borderRadius: "20px",
                        backgroundColor: timeLeft > 60 ? "rgba(56,189,248,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${timeLeft > 60 ? "#38bdf8" : "#ef4444"}`,
                        color: timeLeft > 60 ? "#38bdf8" : "#ef4444",
                        fontSize: "13px", fontWeight: "600"
                    }}>
                        {timeLeft > 0 ? `⏱ OTP expires in ${formatTime(timeLeft)}` : "⚠️ OTP Expired"}
                    </span>
                </div>

                {/* OTP input */}
                <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", fontWeight: "600", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>
                    OTP Code
                </label>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onBlur={() => setTouched(prev => ({ ...prev, otp: true }))}
                    style={{
                        width: "100%", padding: "16px", marginBottom: "20px", borderRadius: "10px",
                        border: `1px solid ${otpBorder}`, boxSizing: "border-box",
                        backgroundColor: "#0f172a", color: "white",
                        letterSpacing: "8px", fontSize: "20px", textAlign: "center", fontWeight: "bold"
                    }}
                />

                {/* New Password */}
                <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", fontWeight: "600", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>
                    New Password
                </label>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onBlur={() => setTouched(prev => ({ ...prev, newPassword: true }))}
                        style={{
                            width: "100%", padding: "16px", paddingRight: "60px",
                            borderRadius: "10px", border: `1px solid ${pwBorder}`,
                            boxSizing: "border-box", backgroundColor: "#0f172a", color: "white"
                        }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px"
                    }}>
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                {/* Confirm Password */}
                <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", fontWeight: "600", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Confirm Password
                </label>
                <div style={{ position: "relative", marginBottom: "8px" }}>
                    <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                        style={{
                            width: "100%", padding: "16px", paddingRight: "60px",
                            borderRadius: "10px", border: `1px solid ${confirmBorder}`,
                            boxSizing: "border-box", backgroundColor: "#0f172a", color: "white"
                        }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px"
                    }}>
                        {showConfirm ? "Hide" : "Show"}
                    </button>
                </div>

                {/* Inline mismatch hint — only shown after confirm is touched and non-empty */}
                {touched.confirmPassword && confirmPassword && confirmPassword !== newPassword && (
                    <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "16px", marginTop: "4px" }}>
                        Passwords do not match
                    </p>
                )}

                <div style={{ marginBottom: "20px" }} />

                {/* Submit */}
                <button type="submit" disabled={loading || timeLeft === 0} style={{
                    width: "100%", padding: "16px", border: "none", borderRadius: "10px",
                    backgroundColor: (loading || timeLeft === 0) ? "#334155" : "#10b981",
                    color: "white", fontWeight: "bold",
                    cursor: (loading || timeLeft === 0) ? "not-allowed" : "pointer",
                    fontSize: "16px", marginBottom: "20px",
                    transition: "background-color 0.2s"
                }}>
                    {loading ? "Updating Password..." : "Reset Password"}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e3a5f", paddingTop: "20px" }}>
                    <button type="button" onClick={handleResendOtp} style={{
                        background: "none", border: "none", color: "#64748b",
                        fontSize: "13px", cursor: "pointer", textDecoration: "underline"
                    }}>
                        Resend OTP
                    </button>
                    <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                        Back to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;
