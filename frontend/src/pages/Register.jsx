import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import API_BASE_URL from "../config/api.js";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // 1. Empty fields validation
        if (!name.trim() || !email.trim() || !password.trim()) {
            alert("Please fill in all fields");
            return;
        }

        // 2. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }

        // 3. Password length validation
        if (password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password
                    })
                }
            );

            if (!response.ok) {
                alert("Server error. Please try again later.");
                return;
            }

            const data = await response.text();

            if (data === "Account Created") {
                alert("Account Created Successfully");
                navigate("/login");
            } else {
                alert(data); // Display backend message like "Email Already Exists"
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Network error. Please make sure the backend is running.");
        }
    };
    return (
    <div
        style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #020617, #0f172a)"
        }}
    >

        <form
        onSubmit={handleRegister}
        style={{
            backgroundColor: "#1e293b",
            padding: "40px",
            borderRadius: "16px",
            width: "400px",
            boxShadow: "0 0 30px rgba(0,0,0,0.4)"
        }}
        >

        <h1
            style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "white"
            }}
        >
            Register
        </h1>

        <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
                width: "100%",
                padding: "14px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "none"
            }}
        />

        <input
          placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
                width: "100%",
                padding: "14px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "none"
            }}
        />

        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
                width: "100%",
                padding: "14px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "none"
            }}
        />

        <button
            type="submit"
            style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#38bdf8",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
            }}
        >
            Create Account
        </button>

        <p
            style={{
            marginTop: "20px",
            textAlign: "center",
            color: "white"
            }}
        >
            Already have an account?

            <Link
            to="/login"
            style={{
                color: "#38bdf8",
                marginLeft: "8px",
                textDecoration: "none"
            }}
            >
            Login
            </Link>
        </p>

        </form>

    </div>
    );
}

export default Register;