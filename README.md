<div align="center">

# 🚀 AI Career Dashboard

### An AI-powered career management SaaS platform that helps you find jobs, optimize your resume, track applications, and land offers faster.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://mysql.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Features

### 🤖 AI Resume Engine
- **PDF Resume Parsing** — upload and extract full resume text
- **ATS Score Analysis** — scores your resume on keyword match, experience, projects
- **Keyword Gap Detection** — identifies missing skills vs job requirements
- **Tailored Resume Generation** — AI creates a job-specific resume with injected keywords
- **Cover Letter Generation** — personalized, company-specific cover letters

### 💼 Job Intelligence
- **AI Job Matching** — matches your skills to curated jobs from LinkedIn, Internshala, Naukri
- **Match Score** per job — see % compatibility before applying
- **One-Click Apply** — direct links to application pages with platform badges
- **Job Details Page** — full description + AI improvement suggestions

### 📋 Application Tracking (Kanban Board)
- **Drag-and-drop Kanban** — move applications across Applied → In Review → Interview → Selected → Rejected
- **Application Timeline** — timestamped history of every status change
- **Interview Scheduler** — log rounds, meeting links, notes, round type
- **Live Stats** — total applied, interviews, accepted, rejected

### 🔔 Real-Time Notifications
- **WebSocket-powered** notification center (STOMP over SockJS)
- **Live bell badge** with unread count
- **Auto-notifications** on status changes and interview scheduling

### 📊 Dashboard Analytics
- Career pipeline stats at a glance
- Application history tracking
- Resume optimization metrics

### 👤 Profile System
- Platform integrations (LinkedIn, Internshala, Naukri URLs)
- Job preferences (role, location, type, salary)
- Skills and domain tracking

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, React Router v7, Recharts |
| **Styling** | Pure CSS, glassmorphism, dark SaaS theme |
| **Backend** | Spring Boot 4.0, Spring Data JPA, Spring WebSocket |
| **Security** | BCrypt password hashing (spring-security-crypto) |
| **Database** | MySQL 8 / TiDB Cloud (production) |
| **PDF Parsing** | Apache PDFBox 3.0 |
| **Real-Time** | STOMP + SockJS WebSocket broker |
| **Build** | Maven (backend), Vite (frontend) |
| **Deployment** | Vercel (frontend) + Render Docker (backend) |

---

## 🗂 Project Structure

```
auto-intern-system/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # Header, Sidebar, JobCard, GeneratedCVViewer...
│   │   ├── pages/          # Dashboard, Tracker, Jobs, Resume, Profile...
│   │   └── config/
│   │       └── api.js      # Centralized API base URL config
│   ├── vercel.json         # SPA routing fix for Vercel
│   └── .env.example        # Environment variable template
│
├── backend/                # Spring Boot REST API
│   ├── src/main/java/com/example/backend/
│   │   ├── controller/     # REST endpoints
│   │   ├── service/        # Business logic (AI analysis, CV generation...)
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # Spring Data repositories
│   │   └── config/         # CORS, WebSocket config
│   ├── Dockerfile          # Production Docker image
│   └── .env.example        # Environment variable template
│
├── database_schema.sql     # MySQL schema for cloud migration
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8.0

### 1. Clone the repository
```bash
git clone https://github.com/malikasingh2509/auto-intern-system.git
cd auto-intern-system
```

### 2. Start the Backend
```bash
cd backend
# Configure your local MySQL in src/main/resources/application.properties
./mvnw spring-boot:run
# API available at http://localhost:8080
```

### 3. Start the Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local — set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
# App available at http://localhost:5173
```

---

## 🌐 Production Deployment

| Service | Purpose | URL |
|---------|---------|-----|
| **Vercel** | Frontend hosting | Set `VITE_API_BASE_URL` env var |
| **Render** | Backend Docker container | Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_URL` |
| **TiDB Cloud** | Cloud MySQL (free, no credit card) | MySQL-compatible |

See [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example) for all required variables.

---

## 🔐 Environment Variables

### Frontend (`frontend/.env.local`)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080
```

### Backend (Render Dashboard / `.env`)
```env
DB_URL=jdbc:mysql://your-host:3306/your_db?useSSL=true
DB_USERNAME=your_user
DB_PASSWORD=your_password
FRONTEND_URL=https://your-app.vercel.app
PORT=8080
```

---

## 📸 Screenshots

> *Coming soon — add screenshots of Dashboard, Kanban Board, Resume Analysis*

---

## 🚀 Future Improvements

- [ ] OpenAI / Gemini API integration for real AI generation
- [ ] OAuth2 login (Google, LinkedIn)
- [ ] Email reminders via SendGrid/Mailgun
- [ ] Cloud file storage (S3/Cloudinary) for resumes
- [ ] Mobile app (React Native)
- [ ] Interview preparation AI coach
- [ ] Browser extension for one-click job saving
- [ ] Resume versioning and comparison

---

## 👩‍💻 Author

**Malika Singh** — B.Tech CS @ Galgotias University  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/malikasingh)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?logo=github)](https://github.com/malikasingh2509)

---

## 📄 License

This project is licensed under the MIT License.
