# LearnHub

A full-stack Learning Management System (LMS) built solo as a capstone-style project. Students can browse courses, enroll, complete lessons, and take quizzes; admins can manage courses, lessons, quizzes, and view student progress.

## Features

**Student-facing**
- Browse a public course catalogue with search, category filtering, and pagination
- Enroll in courses
- View lesson content (video + text), mark lessons complete
- Take quizzes and view scored results with answer review
- Personal dashboard showing enrolled courses and progress

**Admin panel**
- Full CRUD for courses, lessons, quizzes, and quiz questions
- Publish/archive workflow for courses (draft → published → archived)
- Student directory with per-student enrollment and progress detail

**Under the hood**
- JWT-based authentication with role-based access (student/admin)
- Centralized error handling with consistent API response shapes
- Rate limiting on auth routes, security headers via Helmet
- Seed script for reproducible demo data

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Atlas), Mongoose, JWT, bcryptjs
**Frontend:** React (Vite), Tailwind CSS v4, React Router, Axios

## Getting Started

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

Create a `backend/.env` file (see `backend/.env.example`):

```
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/learnhub?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
```

> **Note:** the backend runs on port **5001**, not 5000 — port 5000 conflicts with the macOS AirPlay Receiver and causes a misleading `403 Access denied` error.

Seed the database with demo data (test accounts, a sample course, lesson, and quiz):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5001`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `frontend/.env` file (see `frontend/.env.example`):

```
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

### Test accounts

After running `npm run seed`, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| Admin | chris@example.com | password123 |
| Student (enrolled) | student@example.com | password123 |
| Student (not enrolled) | outsider@example.com | password123 |

## Project Structure

```
learnhub-lms/
├── backend/
│   └── src/
│       ├── config/        # Database connection
│       ├── models/        # Mongoose schemas (User, Course, Lesson, Quiz, etc.)
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth, enrollment checks, rate limiting, error handling
│       ├── routes/         # Express routers
│       ├── seed/           # Demo data seed script
│       └── utils/          # Token generation, async handler
└── frontend/
    └── src/
        ├── components/     # Shared UI (Navbar, route guards, course cards)
        ├── context/         # AuthContext
        ├── pages/           # Route-level pages (Catalogue, Dashboard, Lesson, Quiz, etc.)
        │   └── admin/       # Admin panel pages
        └── services/        # Axios API client
```

## API Overview

All routes are prefixed with `/api`. Admin routes require a valid JWT for a user with `role: "admin"`.

| Area | Public routes | Protected / Admin routes |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | `GET /auth/me` |
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

## Contributing

This project is built solo, but the frontend is open to redesign contributions.

- Branch off `feature/fullstack-integration` (the main working branch — **not** `main`)
- Only the `frontend/` folder needs to be touched
- Keep API calls functionally equivalent to what's documented above — the backend doesn't care what the UI looks like, only that requests/responses match
- Open PRs against `feature/fullstack-integration`

## Roadmap

This project is in its final phase. Remaining/optional work:
- Deployment (backend → Render/Railway, frontend → Vercel/Netlify)
- Swagger/OpenAPI documentation
- A dedicated visual design pass (typography, color, spacing, light animation) across the whole frontend

## License

This project was built as a personal capstone project and does not currently carry an open-source license.