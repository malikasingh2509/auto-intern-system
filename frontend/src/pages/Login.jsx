import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // 1. Empty field validation
        if (!email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        // 2. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                }
            );

            if (!response.ok) {
                toast.error("Server error. Please try again later.");
                setLoading(false);
                return;
            }

            const data = await response.text();

            if (data === "Login Success") {
                toast.success("Login Successful");
                // Store session
                localStorage.setItem("userEmail", email.trim());
                navigate("/dashboard");
            } else {
                toast.error("Invalid email or password"); // Professional generic error
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Network error. Please make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };
    return (
    <div
        style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "40px",
        padding: "40px 20px",
        boxSizing: "border-box",
        width: "100%",
        background: "linear-gradient(to bottom right, #020617, #0f172a)"
        }}
    >

        {/* LEFT SIDE */}
        <div
            style={{
                flex: "1 1 400px",
                maxWidth: "600px",
                color: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                textAlign: "left",
                padding: "20px",
                boxSizing: "border-box"
            }}
        >
        <h1
            style={{
            fontSize: "clamp(3.5rem, 8vw, 5.5rem)",
            fontWeight: "bold",
            lineHeight: "1.1",
            margin: "0 0 20px 0",
            color: "#ffffff"
            }}
        >
            AI Career
        </h1>

        <p
            style={{
                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                color: "#94a3b8",
                lineHeight: "1.6",
                maxWidth: "500px",
                margin: "20px 0 0 0"
            }}
        >
            Smart AI-powered dashboard to analyze resumes,
            match jobs and improve your career growth.
        </p>

        </div>

        {/* RIGHT SIDE */}
        <div
        style={{
            flex: "1 1 400px",
            maxWidth: "500px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            boxSizing: "border-box"
        }}
        >

        <form
            onSubmit={handleLogin}
            style={{
            width: "100%",
            backgroundColor: "#1e293b",
            padding: "40px",
            borderRadius: "20px",
            boxSizing: "border-box",
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
            }}
        >

            <h1
            style={{
                textAlign: "center",
                marginBottom: "40px",
                color: "white",
                fontSize: "48px"
            }}
            >
            Login
            </h1>

            <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
                width: "100%",
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "10px",
                border: email ? "1px solid #334155" : "1px solid #ef4444",
                boxSizing: "border-box",
                backgroundColor: "#0f172a",
                color: "white"
            }}
            />

            <div style={{ position: "relative", marginBottom: "20px" }}>
                <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "10px",
                    border: password ? "1px solid #334155" : "1px solid #ef4444",
                    boxSizing: "border-box",
                    backgroundColor: "#0f172a",
                    color: "white"
                }}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer"
                    }}
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>

            <button
            type="submit"
            disabled={loading}
            style={{
                width: "100%",
                padding: "16px",
                border: "none",
                borderRadius: "10px",
                backgroundColor: loading ? "#64748b" : "#38bdf8",
                color: "white",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px"
            }}
            >
            {loading ? "Authenticating..." : "Login"}
            </button>

            <p
                style={{
                marginTop: "20px",
                textAlign: "center",
                color: "white"
                }}
            >
                Don't have an account?

                <Link
                to="/register"
                style={{
                    color: "#38bdf8",
                    marginLeft: "8px",
                    textDecoration: "none"
                }}
                >
                Register
                </Link>
            </p>

        </form>

        </div>

    </div>
    );
  
}

export default Login;