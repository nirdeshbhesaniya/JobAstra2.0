<p align="center">
  <h1 align="center">🚀 JobAstra 2.0</h1>
  <p align="center">
    <strong>India's Smart Job Portal — Connecting Talent with Opportunity</strong>
  </p>
  <p align="center">
    A full-stack MERN job portal with AI-powered features, real-time interview scheduling, MCQ assessment system, and an intelligent chatbot.
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#contributing">Contributing</a>
  </p>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Email Setup](#email-setup)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**JobAstra 2.0** is a modern, full-featured job portal designed for the Indian job market. It serves two primary user roles — **Candidates** and **Recruiters** — each with their own dashboards, workflows, and capabilities. The platform goes beyond basic job listings by integrating AI-powered tools, a comprehensive MCQ assessment engine, interview scheduling with calendar invites, and a context-aware chatbot assistant.

---

## Features

### 🔍 For Candidates
- **Job Search & Discovery** — Browse and filter jobs by title, location, category, and experience level
- **Job Applications** — Apply to jobs with resume upload and track application status in real-time
- **Saved Jobs** — Bookmark jobs for later review
- **Profile Management** — Update profile info, bio, phone, location, and profile picture
- **Resume Upload** — Upload and manage resumes via Cloudinary
- **MCQ Test Taking** — Attempt recruiter-created assessments with timed sections, code editors, and anti-cheat measures
- **Test History & Results** — View detailed results, scores, and attempt history
- **Interview Dashboard** — View scheduled interviews, join Zoom meetings, and receive reminders
- **AI Cover Letter Generator** — Generate personalized cover letters for any job using Google Gemini AI
- **Password Reset** — Secure OTP-based password recovery via email

### 🏢 For Recruiters
- **Company Dashboard** — Overview of posted jobs, applications, tests, and interviews
- **Job Posting** — Create, manage, and control visibility of job listings
- **Application Management** — View applicants, change application status, and manage the hiring pipeline
- **MCQ Test Builder** — Create comprehensive tests with multiple sections, question types (MCQ, coding, descriptive), configurable scoring, and time limits
- **Test Management** — Edit, delete, toggle test status, manage access control, and grant reattempt permissions
- **Test Evaluation** — Review candidate responses, evaluate answers, and provide feedback
- **Interview Scheduling** — Schedule interviews with Zoom integration, send calendar invites (iCal), and manage interview lifecycle (reschedule, cancel, complete)
- **Email Notifications** — Automated branded emails for interview scheduling, reminders, status changes, and password resets
- **CSV/Excel Export** — Export candidate and test data

### 🤖 AI & Smart Features
- **JobBot Chatbot** — AI-powered assistant (Google Gemini) for job search guidance, career advice, resume tips, and platform help
- **AI Cover Letter Generation** — Context-aware cover letters tailored to specific job descriptions
- **Automated Interview Reminders** — Cron-based reminder system sending emails 24h and 1h before interviews
- **Safe Exam Browser (SEB) Support** — Optional SEB configuration for secure test-taking

### 🛡️ Security & Auth
- **JWT Authentication** — Separate token-based auth for candidates and recruiters
- **Password Hashing** — bcrypt-based secure password storage
- **Protected Routes** — Role-based route protection on both frontend and backend
- **Rate Limiting** — Express rate limiter for API protection
- **Helmet** — HTTP security headers
- **CORS** — Configured cross-origin resource sharing

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 6** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client |
| **Framer Motion** | Animations |
| **Recharts** | Dashboard charts & analytics |
| **React Big Calendar** | Interview calendar view |
| **Monaco Editor** | In-browser code editor for tests |
| **Socket.IO Client** | Real-time communication |
| **Quill** | Rich text editor |
| **Swiper** | Touch-friendly carousels |
| **jsPDF + AutoTable** | PDF generation & export |
| **PapaParse / XLSX** | CSV & Excel parsing |
| **React Webcam + face-api.js** | Webcam & face detection for proctoring |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt / bcryptjs** | Password hashing |
| **Cloudinary** | Image & file storage |
| **Multer** | File upload handling |
| **Nodemailer** | Email delivery |
| **Google Generative AI (Gemini)** | AI chatbot & cover letter generation |
| **node-cron + node-schedule** | Scheduled tasks & reminders |
| **ical-generator** | Calendar invite generation |
| **Socket.IO** | Real-time events |
| **Helmet** | Security headers |
| **express-rate-limit** | API rate limiting |
| **moment-timezone** | Timezone-aware date handling |
| **Sharp** | Image processing |
| **pdf-lib** | PDF manipulation |
| **csv-parser** | CSV data parsing |
| **uuid** | Unique ID generation |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend & backend deployment |
| **MongoDB Atlas** | Cloud database |
| **Cloudinary** | Media CDN |
| **Mailtrap / Gmail** | Email service |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Pages   │  │Components│  │ Context  │  │Services │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └──────────────┴─────────────┴─────────────┘      │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API / WebSocket
┌───────────────────────────▼─────────────────────────────┐
│                   Backend (Express.js)                    │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐             │
│  │  Routes  │──│ Controllers│──│  Models  │             │
│  └──────────┘  └──────┬─────┘  └────┬─────┘             │
│  ┌──────────┐  ┌──────┴─────┐  ┌────▼─────┐             │
│  │Middleware│  │   Utils    │  │ MongoDB  │             │
│  └──────────┘  └────────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
              │              │              │
     ┌────────▼──┐   ┌──────▼──┐   ┌──────▼──────┐
     │Cloudinary │   │ Gemini  │   │  Nodemailer  │
     │  (Media)  │   │  (AI)   │   │   (Email)    │
     └───────────┘   └─────────┘   └──────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud)
- **Cloudinary** account — [Sign up](https://cloudinary.com/)
- **Google Gemini API Key** (optional, for AI features) — [Get API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nirdeshbhesaniya/JobAstra2.0.git
   cd JobAstra2.0
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_CONNECTION_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobastra

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI (optional — chatbot & cover letter generation)
GEMINI_API_KEY=your_gemini_api_key

# Email — Option 1: Mailtrap (recommended for development)
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password

# Email — Option 2: Gmail (use App Password, not login password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Server
PORT=5000
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### Running the Application

**Start the backend server:**
```bash
cd backend
npm run server
```

**Start the frontend dev server (in a new terminal):**
```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:5000`.

---

## Project Structure

```
JobAstra2.0/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   ├── vercel.json                  # Vercel deployment config
│   ├── EMAIL_SETUP.md               # Email configuration guide
│   └── src/
│       ├── chatbot/
│       │   └── chatbotRoutes.js     # AI chatbot endpoints
│       ├── controllers/
│       │   ├── aiController.js      # Cover letter generation
│       │   ├── companyController.js # Recruiter operations
│       │   ├── interviewController.js # Interview scheduling
│       │   ├── jobController.js     # Job CRUD & test requirements
│       │   ├── testController.js    # MCQ test engine
│       │   └── userController.js    # Candidate operations
│       ├── db/
│       │   └── connectDB.js         # MongoDB connection
│       ├── middlewares/
│       │   ├── companyAuthMiddleware.js  # Recruiter JWT auth
│       │   ├── userAuthMiddleware.js     # Candidate JWT auth
│       │   ├── flexibleAuthMiddleware.js # Dual-role auth
│       │   └── securityMiddleware.js     # Security headers
│       ├── models/
│       │   ├── Company.js           # Recruiter/Company schema
│       │   ├── Interview.js         # Interview schema (Zoom, iCal)
│       │   ├── Job.js               # Job listing schema
│       │   ├── JobApplication.js    # Application schema
│       │   ├── OTP.js               # OTP for password reset
│       │   ├── Test.js              # MCQ test schema
│       │   └── User.js              # Candidate schema
│       ├── routes/
│       │   ├── aiRoutes.js          # /ai
│       │   ├── companyRoutes.js     # /company
│       │   ├── interviewRoutes.js   # /interview
│       │   ├── jobRoutes.js         # /job
│       │   ├── testRoutes.js        # /test
│       │   └── userRoutes.js        # /user
│       └── utils/
│           ├── Cloudinary.js        # Cloudinary config
│           ├── emailNotifications.js # Email templates & sender
│           ├── generateToken.js     # JWT token generation
│           ├── otpUtils.js          # OTP generation
│           ├── reminderSystem.js    # Cron-based interview reminders
│           └── upload.js            # Multer file upload config
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Vite + React + Tailwind
│   ├── tailwind.config.js
│   ├── vercel.json                  # SPA rewrite rules
│   └── src/
│       ├── App.jsx                  # Route definitions
│       ├── main.jsx                 # React entry point
│       ├── index.css                # Global styles
│       ├── assets/                  # Static assets
│       ├── components/
│       │   ├── Chatbot/             # AI chatbot UI
│       │   ├── CodeEditor.jsx       # Monaco-based code editor
│       │   ├── InterviewCalendar.jsx # Calendar view
│       │   ├── MCQTestBuilder.jsx   # Test creation form
│       │   ├── MCQTestManagement.jsx # Test list & management
│       │   ├── MCQTestTaking.jsx    # Test-taking interface
│       │   ├── CandidateTestResults.jsx
│       │   ├── RecruiterTestResults.jsx
│       │   ├── ScheduleInterviewModal.jsx
│       │   ├── ProtectedRoute.jsx   # Candidate route guard
│       │   ├── RecruiterProtectedRoute.jsx # Recruiter route guard
│       │   ├── PublicOnlyRoute.jsx   # Redirect if logged in
│       │   └── ...                  # Navbar, Footer, Hero, etc.
│       ├── context/
│       │   └── AppContext.jsx       # Global state & API calls
│       ├── layout/
│       │   └── AppLayout.jsx        # App-wide layout wrapper
│       ├── pages/
│       │   ├── Home.jsx             # Landing page
│       │   ├── AllJobs.jsx          # Job listings
│       │   ├── ApplyJob.jsx         # Job application page
│       │   ├── CandidateDashboard.jsx
│       │   ├── CandidateOverview.jsx
│       │   ├── CandidateProfile.jsx
│       │   ├── Dashborad.jsx        # Recruiter dashboard layout
│       │   ├── RecruiterOverview.jsx
│       │   ├── AddJobs.jsx          # Post new job
│       │   ├── ManageJobs.jsx       # Manage posted jobs
│       │   ├── ViewApplications.jsx
│       │   ├── RecruiterInterviewPage.jsx
│       │   ├── candidate/
│       │   │   └── InterviewDashboard.jsx
│       │   └── ...                  # Login, Signup, Forgot Password, etc.
│       └── services/
│           └── chatbotService.js    # Chatbot API service
│
└── README.md
```

---

## API Reference

### Authentication

All protected routes require a JWT token in the request header:
```
Headers: { "token": "<jwt_token>" }
```

### User (Candidate) Routes — `/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user/register-user` | Public | Register new candidate (multipart: image) |
| POST | `/user/login-user` | Public | Candidate login |
| GET | `/user/user-data` | Candidate | Get current user profile |
| PUT | `/user/update-profile` | Candidate | Update profile (multipart: image) |
| POST | `/user/apply-job` | Candidate | Apply to a job |
| POST | `/user/get-user-applications` | Candidate | Get user's applications |
| POST | `/user/upload-resume` | Candidate | Upload resume (multipart: resume) |
| POST | `/user/save-job` | Candidate | Save/bookmark a job |
| POST | `/user/unsave-job` | Candidate | Remove saved job |
| GET | `/user/saved-jobs` | Candidate | Get saved jobs list |
| GET | `/user/all-users` | Recruiter | Get all registered users |
| POST | `/user/forgot-password` | Public | Request password reset OTP |
| POST | `/user/verify-reset-otp` | Public | Verify OTP |
| POST | `/user/reset-password` | Public | Reset password |

### Company (Recruiter) Routes — `/company`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/company/register-company` | Public | Register new company (multipart: image) |
| POST | `/company/login-company` | Public | Recruiter login |
| GET | `/company/company-data` | Recruiter | Get company profile |
| POST | `/company/post-job` | Recruiter | Create a new job listing |
| GET | `/company/jobs` | Recruiter | Get all jobs |
| GET | `/company/company/posted-jobs` | Recruiter | Get company's posted jobs |
| POST | `/company/change-visiblity` | Recruiter | Toggle job visibility |
| POST | `/company/view-applications` | Recruiter | View job applicants |
| POST | `/company/change-status` | Recruiter | Change application status |
| POST | `/company/forgot-password` | Public | Request password reset OTP |
| POST | `/company/verify-reset-otp` | Public | Verify OTP |
| POST | `/company/reset-password` | Public | Reset password |

### Job Routes — `/job`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/job/all-jobs` | Public | Get all visible jobs |
| GET | `/job/company-jobs` | Recruiter | Get company's jobs |
| GET | `/job/:jobId/test-requirements` | Public | Get job's test requirements |
| POST | `/job/:jobId/test-requirements` | Recruiter | Add test requirement to job |
| DELETE | `/job/:jobId/test-requirements/:testId` | Recruiter | Remove test requirement |

### Test Routes — `/test`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/test/create` | Recruiter | Create a test |
| POST | `/test/create-test-with-questions` | Recruiter | Create test with questions |
| GET | `/test/company-tests` | Recruiter | Get company's tests |
| GET | `/test/:testId/details` | Recruiter | Get test details |
| PUT | `/test/:testId` | Recruiter | Update a test |
| DELETE | `/test/delete-test/:testId` | Recruiter | Delete a test |
| GET | `/test/available` | Candidate | Get available tests |
| POST | `/test/:testId/start` | Candidate | Start a test attempt |
| POST | `/test/:testId/submit` | Candidate | Submit test |
| GET | `/test/attempts` | Recruiter | Get test attempts |
| GET | `/test/attempts/:attemptId/details` | Both | Get attempt details |
| POST | `/test/execute-code` | Candidate | Execute code in test |

### Interview Routes — `/interview`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/interview/schedule` | Recruiter | Schedule an interview |
| GET | `/interview/candidate` | Candidate | Get candidate's interviews |
| GET | `/interview/recruiter` | Recruiter | Get recruiter's interviews |
| PUT | `/interview/status/:interviewId` | Recruiter | Update interview status |
| PUT | `/interview/reschedule/:interviewId` | Both | Reschedule interview |
| DELETE | `/interview/cancel/:interviewId` | Both | Cancel interview |
| DELETE | `/interview/delete/:interviewId` | Recruiter | Delete interview |
| GET | `/interview/upcoming` | Both | Get upcoming interviews |

### AI Routes — `/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ai/generate-cover-letter` | Candidate | Generate AI cover letter |

### Chatbot Routes — `/api/chatbot`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chatbot/message` | Public | Send message to AI chatbot |

---

## Database Models

### User (Candidate)
| Field | Type | Description |
|-------|------|-------------|
| name | String | Full name |
| email | String | Unique email |
| password | String | Hashed password |
| image | String | Profile picture URL |
| resume | String | Resume URL |
| phone | String | Contact number |
| location | String | Location |
| bio | String | Short bio |
| savedJobs | [ObjectId] | Bookmarked job references |

### Company (Recruiter)
| Field | Type | Description |
|-------|------|-------------|
| name | String | Company name |
| email | String | Unique email |
| password | String | Hashed password |
| image | String | Company logo URL |

### Job
| Field | Type | Description |
|-------|------|-------------|
| title | String | Job title |
| location | String | Job location |
| level | String | Experience level |
| description | String | Full description |
| salary | Number | Salary amount |
| category | String | Job category |
| companyId | ObjectId | Posting company ref |
| visible | Boolean | Listing visibility |
| requiresTest | Boolean | Test requirement flag |
| requiredTests | Array | Linked tests with min scores |

### Interview
| Field | Type | Description |
|-------|------|-------------|
| jobId, recruiterId, candidateId | ObjectId | References |
| title, description | String | Interview details |
| scheduledDate | Date | Interview date & time |
| duration | Number | Duration in minutes |
| timeZone | String | Timezone |
| zoomMeetingId, zoomPassword, zoomJoinUrl | String | Zoom details |
| status | Enum | scheduled / in-progress / completed / cancelled / rescheduled / no-show |
| interviewType | Enum | technical / hr / behavioral / final / screening |
| feedback | Object | Rating, comments, strengths, improvements |
| rescheduleHistory | Array | History of reschedules |

### Test
| Field | Type | Description |
|-------|------|-------------|
| title, description | String | Test details |
| companyId, jobId | ObjectId | References |
| duration | Number | Time limit (minutes) |
| totalMarks, passingMarks | Number | Scoring |
| sections | [ObjectId] | Test sections with questions |
| allowRetake, maxAttempts | Boolean/Number | Retake policy |
| accessControl | Object | Restrict to specific candidates |
| sebConfig | Object | Safe Exam Browser settings |
| startDate, endDate | Date | Availability window |

---

## Deployment

The project is configured for deployment on **Vercel**.

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend Deployment
```bash
cd backend
# Deploy to Vercel (uses vercel.json config)
```

Both `backend/vercel.json` and `frontend/vercel.json` are pre-configured:
- **Backend** — Routes all requests to `server.js` via `@vercel/node`
- **Frontend** — SPA rewrites for client-side routing

### Environment Variables on Vercel
Set all the environment variables from the `.env` section in your Vercel project settings.

---

## Email Setup

The platform supports **three email modes** with automatic fallback:

1. **Mailtrap** (recommended for development) — Set `MAILTRAP_USER` and `MAILTRAP_PASS`
2. **Gmail** (production-ready) — Set `EMAIL_USER` and `EMAIL_PASSWORD` (use App Password with 2FA)
3. **Console Transport** (fallback) — If no credentials are set, emails are logged to the console with OTP codes visible

See [backend/EMAIL_SETUP.md](backend/EMAIL_SETUP.md) for detailed configuration instructions.

---

## Screenshots

> Add screenshots of your application here to showcase the UI.

<!-- 
![Home Page](screenshots/home.png)
![Candidate Dashboard](screenshots/candidate-dashboard.png)
![Recruiter Dashboard](screenshots/recruiter-dashboard.png)
![MCQ Test Builder](screenshots/test-builder.png)
![AI Chatbot](screenshots/chatbot.png)
-->

---

## Contributing

Contributions are welcome! To get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch

### Guidelines
- Follow existing code style and project structure
- Write descriptive commit messages
- Test your changes before submitting
- Update documentation if adding new features

---

## License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/nirdeshbhesaniya">Nirdesh Bhesaniya</a>
</p>
