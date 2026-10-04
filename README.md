# LearnHub

A full-stack Learning Management System (LMS) — students browse courses, enroll, work through lessons, and take quizzes; admins manage all course content and track student progress. Built as a TSAcademy capstone project.

**Live demo:** https://frontend-tau-gold-mvcfkz0a1a.vercel.app
**API:** https://learnhub-lms-ix25.onrender.com/api

> The backend runs on Render's free tier, which spins down after periods of inactivity — the first request after a quiet spell may take 30–60 seconds to respond while it wakes up. Subsequent requests are fast.

## Features

**Public / student-facing**
- Landing page with featured courses, and a full searchable/filterable/paginated course catalogue
- Course enrollment, structured lessons with completion tracking, and scored quizzes with instant, detailed feedback
- Personal dashboard showing every enrolled course and progress at a glance
- Achievement badges and points for completing lessons, courses, and quizzes
- About and Contact pages
- A built-in assistant widget — answers common questions and can search live course data, entirely client-side (no external AI service, no API cost)

**Admin panel**
- Full CRUD for courses, lessons, quizzes, and quiz questions
- Publish/draft/archive workflow for courses
- Student directory with per-student enrollment and progress detail

**Under the hood**
- JWT-based authentication with role-based access (student/admin)
- Centralized error handling with consistent API response shapes
- Rate limiting on auth routes, security headers via Helmet
- Seed script for reproducible demo data
- A custom design system (typography, color palette, motion) applied consistently across the whole app

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Atlas), Mongoose, JWT, bcryptjs
**Frontend:** React (Vite), Tailwind CSS v4, React Router, Axios, Framer Motion

**Deployed on:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database) — all free tier.

## Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repo

```bash
git clone https://github.com/TSA-Dev41/learnhub-lms.git
cd learnhub-lms
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `backend/.env` file (see `backend/.env.example`). **Create it with a text editor or a bash heredoc — typing the content into a raw shell command can cause the shell to misinterpret parts of it and silently fail to create the file correctly.**

```
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/learnhub?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
```

> The backend runs on port **5001**, not 5000 — port 5000 conflicts with the macOS AirPlay Receiver and causes a misleading `403 Access denied` error.

Seed the database with demo data (test accounts, 9 sample courses with images, lessons, and a quiz):

```bash
npm run seed
```

For an existing database that already has user data, update only the achievement
catalog without deleting anything:

```bash
npm run seed:achievements
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5001`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `frontend/.env` file:

```
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Test accounts

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | chris@example.com | password123 |
| Student (enrolled) | student@example.com | password123 |
| Student (not enrolled) | outsider@example.com | password123 |

## Project Structure

```
learnhub-lms/
├── docs/
│   ├── API-CONTRACT.md    # API request/response reference
│   └── DEVELOPMENT.md     # development notes
├── backend/
│   └── src/
│       ├── config/         # Database connection
│       ├── models/         # Mongoose schemas
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth, enrollment checks, rate limiting, error handling
│       ├── routes/         # Express routers
│       ├── seed/           # Demo data seed script
│       └── utils/          # Token generation, async handler
└── frontend/
    └── src/
        ├── components/     # Navbar, Footer, Logo, Chatbot, route guards, CourseCard
        ├── context/         # AuthContext
        ├── data/            # Chatbot response/matching logic
        ├── pages/           # Home, Catalogue, CourseDetails, Lesson, Quiz, Dashboard, About, Contact, etc.
        │   └── admin/       # Admin panel pages
        └── services/        # Axios API client
```

## API Overview

All routes are prefixed with `/api`. Admin routes require a valid JWT for a user with `role: "admin"`. See `docs/API-CONTRACT.md` for the full request/response reference.

| Area | Public routes | Protected / Admin routes |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | `GET /auth/me` |
| Achievements | `GET /achievements` | `GET /achievements/me` |
| Courses | `GET /courses`, `GET /courses/:id`, `GET /courses/categories` | `POST/PUT/DELETE /admin/courses`, `PATCH /admin/courses/:id/status` |
| Lessons | `GET /courses/:id/lessons` | `GET /lessons/:id`, `POST /lessons/:id/complete`, full CRUD under `/admin/lessons` |
| Quizzes | `GET /courses/:id/quizzes` | `GET /quizzes/:id`, `POST /quizzes/:id/submit`, `GET /quizzes/:id/result`, full CRUD under `/admin/quizzes` |
| Enrollments | — | `POST /courses/:id/enroll`, `GET /enrollments/me` |
| Progress | — | `GET /progress`, `GET /progress/:courseId` |
| Students (admin) | — | `GET /admin/students`, `GET /admin/students/:id`, `.../enrollments`, `.../progress` |

All responses follow a consistent shape:

```json
{ "success": true, "message": "...", "data": { ... } }
```

Students earn milestone achievements automatically. Run `npm test` from the
`backend/` directory for the backend unit tests.

## Deployment

- **Frontend:** Vercel, deployed from `frontend/` via the Vercel CLI (`vercel --prod`)
- **Backend:** Render, deployed from `backend/`, connected to the `main` branch for auto-deploys on push
- **Database:** MongoDB Atlas (shared between local development and the deployed app)

Environment variables are set directly in each platform's dashboard rather than committed to the repo.

## License

This project was built as a personal capstone project and does not currently carry an open-source license.
## Work added by Orshengnudor Ahzoji

Added profile read and update, a real contact form with an admin inbox, the admin enrollment list, lesson progress on the student dashboard, and a live admin overview.
