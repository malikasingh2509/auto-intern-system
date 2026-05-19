import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Resume from "./pages/Resume";
import Suggestions from "./pages/Suggestions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Applied from "./pages/Applied";
import Tracker from "./pages/Tracker";
import JobDetails from "./pages/JobDetails";
import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import API_BASE_URL from "./config/api.js";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
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
  const[ users, setUsers] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const[ resumeFile, setResumeFile] = useState(null);
  
  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const fetchSuggestions = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const loadUserProfile = async (email) => {
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
          if (userObj.id) {
            await fetchMatchedJobs(userObj.id);
            await fetchSuggestions(userObj.id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile on mount:", error);
    }
  };
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const fetchUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/user`);
    const data = await response.json();
    setUsers(data);
  };
  const fetchMatchedJobs = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/match-jobs/${userId}`
  );

  const data = await response.json();

  setMatchedJobs(data);
  };
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      loadUserProfile(email);
    }
  }, [location.pathname]); // Automatically re-sync and load profile when page changes, preventing blank screens on click back!

  useEffect(() => {
    fetchUsers();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1. Save user profile text details
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      showToast("Error saving profile details", "error");
      return;
    }

    const savedUser = await response.json();
    await fetchMatchedJobs(savedUser.id);

    // 2. Only upload resume if a new file is chosen
    if (resumeFile) {
      const data = new FormData();
      data.append("file", resumeFile);

      const uploadResponse = await fetch(
        `${API_BASE_URL}/upload-resume/${savedUser.id}`,
        {
          method: "POST",
          body: data
        }
      );
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        showToast(`Profile saved, but resume failed: ${errorText}`, "error");
        return;
      }
      console.log(await uploadResponse.text());
    }

    showToast("Profile saved successfully!", "success");
    await fetchUsers();
    await fetchSuggestions(savedUser.id);

    setForm({
      id: savedUser.id,
      name: savedUser.name || form.name,
      email: savedUser.email || form.email,
      skills: savedUser.skills || form.skills,
      experience: savedUser.experience || form.experience,
      domain: savedUser.domain || form.domain,
      linkedinUrl: savedUser.linkedinUrl || form.linkedinUrl,
      internshalaUrl: savedUser.internshalaUrl || form.internshalaUrl,
      naukriUrl: savedUser.naukriUrl || form.naukriUrl,
      preferredRoles: savedUser.preferredRoles || form.preferredRoles,
      preferredLocations: savedUser.preferredLocations || form.preferredLocations,
      jobTypePreference: savedUser.jobTypePreference || form.jobTypePreference,
      salaryExpectations: savedUser.salaryExpectations || form.salaryExpectations
    });

    setResumeFile(null);
  } catch (error) {
    console.error("Error saving profile:", error);
    showToast("Network error saving profile.", "error");
  }
};
  const hideSidebar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
  <div className="app-container">
    {!hideSidebar && <Sidebar />}

    <div className="main-content">
      {!hideSidebar && <Header activeUser={form} />}
      <div className={hideSidebar ? "" : "main-content-padding"} style={{ flex: 1, padding: hideSidebar ? "0" : undefined, boxSizing: "border-box" }}>
    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs matchedJobs={matchedJobs} userId={form.id} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <Resume userId={form.id} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applied"
        element={
          <ProtectedRoute>
            <Applied userId={form.id} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/suggestions"
        element={
          <ProtectedRoute>
            <Suggestions suggestions={suggestions} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tracker"
        element={
          <ProtectedRoute>
            <Tracker userId={form.id} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Tracker userId={form.id} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/job/:jobId"
        element={
          <ProtectedRoute>
            <JobDetails userId={form.id} matchedJobs={matchedJobs} />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard
              users={users}
              matchedJobs={matchedJobs}
              suggestions={suggestions}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              setResumeFile={setResumeFile}
              activeUser={form}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile
              form={form}
              setForm={setForm}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              setResumeFile={setResumeFile}
            />
          </ProtectedRoute>
        }
      />

    </Routes>
    </div>
    </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
export default App;