# LearnHub API Contract

This is the single source of truth for every backend endpoint. Frontend builds against this even before an endpoint is merged. If an endpoint changes, update this file in the same PR.

**Base URL (local):** `http://localhost:5001/api`

## Standard response format

### Success
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": { }
}
```

### Error
```json
{
  "success": false,
  "message": "Course not found",
  "data": null
}
```

### List responses (with pagination)
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Auth conventions

- Protected routes require header: `Authorization: Bearer <token>`
- `401 Unauthorized` → not logged in / invalid or missing token
- `403 Forbidden` → logged in but not allowed (wrong role, not enrolled, etc.)
- `404 Not Found` → resource doesn't exist
- `400 Bad Request` → validation failed

---

## Auth

### `POST /api/auth/register`
- Auth: none
- Body: `{ "name": "string", "email": "string", "password": "string" }`
- Success 201: `{ success: true, message: "User registered successfully", data: { user: {id, name, email, role}, token } }`
- Errors: 400 (validation, duplicate email)

### `POST /api/auth/login`
- Auth: none
- Body: `{ "email": "string", "password": "string" }`
- Success 200: `{ success: true, message: "Login successful", data: { user: {id, name, email, role}, token } }`
- Errors: 400 (invalid credentials)

### `GET /api/auth/me`
- Auth: required
- Success 200: `{ success: true, message: "User retrieved", data: { id, name, email, role } }`
- Errors: 401

---

## Courses

### `GET /api/courses`
- Auth: none (public catalogue — published only)
- Query: `?search=&category=&page=1&limit=10`
- Success 200: list + `pagination`
- Data item shape: `{ id, title, description, instructor, category, level, thumbnail, status }`

### `GET /api/courses/:id`
- Auth: none (public info) — lesson **content** hidden unless enrolled
- Success 200: `{ id, title, description, instructor, category, level, thumbnail, status, lessons: [{id, title, order}], isEnrolled }` (`isEnrolled` only meaningful if logged in)
- Errors: 404

### `GET /api/courses/categories`
- Auth: none
- Success 200: `data: ["Programming", "Design", ...]`

### `POST /api/courses/:id/enroll`
- Auth: required (student)
- Success 201: `{ success: true, message: "Enrolled successfully", data: { enrollmentId, courseId } }`
- Errors: 400 (already enrolled), 404 (course not found/not published)

### `GET /api/enrollments/me`
- Auth: required
- Success 200: `data: [{ courseId, title, thumbnail, progressPercent, enrolledAt }]`

---

## Admin — Courses

### `POST /api/admin/courses`
- Auth: required (admin)
- Body: `{ title, description, instructor, category, level, thumbnail }`
- Success 201: created course object

### `PUT /api/admin/courses/:id`
- Auth: required (admin)
- Body: any updatable course fields
- Success 200: updated course object

### `DELETE /api/admin/courses/:id`
- Auth: required (admin)
- Success 200: `{ success: true, message: "Course deleted", data: null }`

### `PATCH /api/admin/courses/:id/status`
- Auth: required (admin)
- Body: `{ "status": "draft" | "published" | "archived" }`
- Success 200: updated course object

---

## Lessons

### `GET /api/courses/:id/lessons`
- Auth: none (titles/order only for non-enrolled; full content if enrolled)
- Success 200: `data: [{ id, title, order, duration, hasAccess }]`

### `GET /api/lessons/:id`
- Auth: required, must be enrolled in the parent course
- Success 200: `{ id, title, content, videoUrl, order, duration, completed }`
- Errors: 403 (not enrolled)

### `POST /api/lessons/:id/complete`
- Auth: required, must be enrolled
- Success 200: `{ success: true, message: "Lesson marked complete", data: { lessonId, courseProgressPercent } }`
- Errors: 403 (not enrolled), 400 (already completed — treat as idempotent, still return 200 is acceptable)

---

## Admin — Lessons

### `POST /api/admin/lessons`
- Auth: required (admin)
- Body: `{ course, title, description, content, videoUrl, order, duration, published }`
- Success 201: created lesson

### `PUT /api/admin/lessons/:id`
- Auth: required (admin)
- Success 200: updated lesson

### `DELETE /api/admin/lessons/:id`
- Auth: required (admin)
- Success 200: `{ success: true, message: "Lesson deleted", data: null }`

---

## Quizzes

### `GET /api/quizzes/:id`
- Auth: required, must be enrolled
- Success 200: `{ id, title, description, passingScore, timeLimit, questions: [{ id, text, options }] }`
- ⚠️ **`correctAnswer` must NEVER be included in this response**
- Errors: 403 (not enrolled)

### `POST /api/quizzes/:id/submit`
- Auth: required, must be enrolled
- Body: `{ "answers": [{ "questionId": "string", "selectedOption": "string" }] }`
- Success 200: `{ score, totalPoints, passed, attemptId }`
- Errors: 400 (invalid/incomplete answers), 403 (not enrolled)

### `GET /api/quizzes/:id/result`
- Auth: required
- Success 200: latest attempt — `{ score, totalPoints, passed, submittedAt, answers: [{questionId, selectedOption, correct}] }`
- Errors: 404 (no attempt yet)

---

## Admin — Quizzes

### `POST /api/admin/quizzes`
- Auth: required (admin)
- Body: `{ course, title, description, passingScore, timeLimit, status }`
- Success 201: created quiz

### `PUT /api/admin/quizzes/:id`
- Auth: required (admin)

### `DELETE /api/admin/quizzes/:id`
- Auth: required (admin)

### `POST /api/admin/quizzes/:id/questions`
- Auth: required (admin)
- Body: `{ text, options: ["string"], correctAnswer, points }`
- Success 201: created question

### `PUT /api/admin/questions/:id`
- Auth: required (admin)

### `DELETE /api/admin/questions/:id`
- Auth: required (admin)

---

## Progress

### `GET /api/progress`
- Auth: required
- Success 200: `data: [{ courseId, title, completedLessons, totalLessons, progressPercent }]` (across all enrolled courses)

### `GET /api/progress/:courseId`
- Auth: required, must be enrolled
- Success 200: `{ courseId, completedLessons, totalLessons, progressPercent, quizResults: [{quizId, score, passed}] }`

---

## Admin — Students & Enrollments

### `GET /api/admin/students`
- Auth: required (admin)
- Query: `?page=1&limit=10`
- Success 200: list + pagination — `{ id, name, email, enrolledCoursesCount }`

### `GET /api/admin/students/:id/progress`
- Auth: required (admin)
- Success 200: `{ studentId, courses: [{ courseId, title, progressPercent, quizResults }] }`

### `GET /api/admin/enrollments`
- Auth: required (admin)
- Query: `?courseId=&page=1&limit=10`
- Success 200: list + pagination — `{ studentName, courseTitle, enrolledAt, progressPercent }`

---

## Users

### `GET /api/users/profile`
- Auth: required
- Success 200: `{ id, name, email, role, createdAt }`

### `PUT /api/users/profile`
- Auth: required
- Body: `{ name, email }` (password change handled separately if implemented)
- Success 200: updated profile

---

## Status codes cheat sheet

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | successful GET/PUT/PATCH |
| 201 | Created | successful POST creating a resource |
| 400 | Bad Request | validation failed, duplicate enrollment |
| 401 | Unauthorized | missing/invalid token |
| 403 | Forbidden | wrong role, not enrolled |
| 404 | Not Found | resource doesn't exist |
| 500 | Server Error | unexpected failure |

---