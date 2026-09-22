# LearnHub Development Guide

Everyone on the team follows this. If you're new, read this fully before your first PR.

---

## 1. Branching rules

- **`main` is protected.** Nobody pushes directly to it — not even leads. All changes go through a Pull Request with at least 1 approval.
- One branch per task, owned by whoever's doing the work — **not** one branch per team.
- Branch naming:
  - `feature/<short-name>` — new functionality (e.g. `feature/login-page`)
  - `fix/<short-name>` — bug fix (e.g. `fix/quiz-scoring`)
  - `docs/<short-name>` — documentation only (e.g. `docs/api-contract`)
- Name branches after the **work**, not the person, so anyone can pick it up if needed.

## 2. Standard workflow

```bash
# 1. Always start from an up-to-date main
git checkout main
git pull origin main

# 2. Create your branch
git checkout -b feature/your-task-name

# 3. Work, then commit
git add .
git commit -m "feat: short description of what you did"

# 4. Push (first time on this branch, use -u)
git push -u origin feature/your-task-name
```

Pull `main` into your branch each morning if your task spans multiple days, to avoid large conflicts later:

```bash
git checkout main
git pull origin main
git checkout feature/your-task-name
git merge main
```

## 3. Commit message style

Use a short prefix so history is easy to scan:

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — setup, config, dependencies
- `docs:` — documentation
- `test:` — tests
- `style:` — formatting/UI-only tweaks with no logic change

Example: `feat: add course enrollment endpoint`

## 4. Pull Requests

Every PR must include:

```markdown
## What was changed?
## Why was it changed?
## How was it tested?
## Screenshots (for UI changes)
## Related issue
```

Rules:
- **1 approval minimum** before merging.
- If your PR touches the API (either side — a new/changed endpoint, or the frontend consuming one), get a reviewer from the *other* team (backend reviews frontend's API usage, frontend/design reviews backend's response shape).
- Keep PRs small and focused — one task per PR. Easier to review, easier to catch bugs.
- Don't merge broken code to "finish on time." A half-working feature merged into `main` blocks everyone else.
- Update `docs/API-CONTRACT.md` in the **same PR** if you're changing an endpoint's shape.

## 5. Code review checklist (for reviewers)

- Does it do what the PR description says?
- Any hardcoded secrets, API keys, or `localhost` URLs that should be env variables?
- Any passwords or sensitive data returned in an API response?
- Does it follow the existing folder structure (controllers/routes/models on backend; components/pages/layouts on frontend)?
- Are loading and error states handled (frontend)?
- Is backend input validated, not just trusted from the frontend?

## 6. Environment variables

- Never commit `.env` — it's in `.gitignore`.
- Always update `.env.example` when you add a new required variable, in the same PR.
- Ask a lead for real values (`MONGO_URI`, `JWT_SECRET`) — never share them in the group chat or commit history.

## 7. Local setup reference

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # then fill in real values
npm run dev             # runs on http://localhost:5001
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev             # runs on http://localhost:5173
```

> ⚠️ Mac users: port 5000 conflicts with macOS AirPlay Receiver (causes a 403 error). We use `PORT=5001` for the backend — don't change it back to 5000 unless you also disable AirPlay Receiver in System Settings.

## 8. Folder ownership (ask before editing outside your area)

**Backend** (`backend/src/`):
- `controllers/`, `routes/`, `models/`, `middleware/`, `services/`, `utils/`, `config/`, `validators/`
- Shared files like `app.js` — check with the backend lead before restructuring

**Frontend** (`frontend/src/`):
- `components/`, `pages/`, `layouts/`, `hooks/`, `services/`, `context/`, `utils/`
- Shared files like the router setup, `AuthContext`, `App.jsx` — check with the frontend lead before restructuring

## 9. Project board

`BACKLOG → TODO → IN PROGRESS → CODE REVIEW → TESTING → DONE`

- Move your card to **IN PROGRESS** when you start
- Move to **CODE REVIEW** when your PR is open
- Move to **TESTING** once merged, for QA to verify
- Move to **DONE** once QA confirms it works

## 10. Reporting bugs

Use the bug report Issue template. Include:
- What you did (steps to reproduce)
- What you expected
- What actually happened
- Screenshot if it's a UI issue
- Which environment (local or deployed link)

Tag it with the `bug` label and assign it to the relevant owner (check the API contract or ask in the group if unsure who owns it).

## 11. Golden rules

- If you're blocked for more than ~30 minutes, ask in the group — don't sit stuck silently.
- If in doubt about an API shape, check `docs/API-CONTRACT.md` first, then ask the backend team.
- Frontend builds against the API contract even if the real endpoint isn't merged yet — use mock data, then swap it in once it's ready.
- No fake/mock data left in code once the real endpoint exists — remove it in the same PR that connects to the real API.