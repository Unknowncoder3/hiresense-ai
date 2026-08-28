# HireSense AI

<p align="center">
  <strong>AI-powered Recruitment Intelligence Platform for candidate screening, resume intelligence, hiring analytics, and explainable decision support.</strong>
</p>

<p align="center">
  <a href="https://hiresense-ai-frontend.netlify.app/">🌐 Live Demo</a> ·
  <a href="https://hiresense-ai-ybbx.onrender.com/docs">📚 API Docs</a> ·
  <a href="https://github.com/Unknowncoder3/hiresense-ai">💻 Source Code</a>
</p>

---

## Overview

HireSense AI is a production-style recruitment operations dashboard that connects structured hiring data, resume intelligence, explainable candidate-job matching, interview operations, analytics, and AI-assisted decision support in one recruiter workspace.

The deployed application uses a React frontend, FastAPI backend, and PostgreSQL database.

## Live Preview

<p align="center">
  <a href="https://hiresense-ai-frontend.netlify.app/">
    <img src="https://image.thum.io/get/width/1400/crop/900/https://hiresense-ai-frontend.netlify.app/" alt="HireSense AI live recruitment dashboard" width="96%" />
  </a>
</p>

<p align="center"><sub>Live recruiter workspace with hiring analytics, job pipelines, resume intelligence, and AI Hiring Copilot.</sub></p>

## Core Capabilities

- **Recruitment Dashboard** — live hiring KPIs, funnel progression, and monthly recruitment trends.
- **Candidate Intelligence** — candidate search, skills, experience, stage tracking, and explainable match scores.
- **Job Management** — create and monitor roles, priorities, locations, applicant counts, shortlist counts, and pipelines.
- **Application Pipeline** — move candidates through Applied, Screening, Shortlisted, Interview, Offer, and Hired stages.
- **Interview Operations** — schedule interviews, track status, interviewer assignments, and feedback workflows.
- **Recruitment Analytics** — time-to-hire, offer acceptance, source conversion, hiring outcomes, and operational signals.
- **Resume Intelligence** — parse PDF, DOCX, and TXT resumes and extract structured skills and experience signals.
- **Explainable Matching** — compare a candidate with an open role using skill, experience, and semantic relevance signals.
- **AI Hiring Copilot** — ask recruitment questions about candidates, jobs, funnel performance, sourcing, and recommended next actions.
- **Production Deployment** — Netlify frontend, Render FastAPI service, and Render PostgreSQL.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite 7, Bootstrap 5.3, Recharts |
| Backend | FastAPI, SQLAlchemy 2, Uvicorn |
| Database | PostgreSQL |
| Analytics / ML | Pandas, NumPy, Scikit-learn |
| Resume Intelligence | PyPDF, python-docx, TF-IDF semantic matching |
| AI | OpenAI API (optional) + deterministic fallback |
| Security | JWT auth, PBKDF2-HMAC password hashing, CORS, security headers |
| Deployment | Netlify, Render, Docker |

## Architecture

```text
                         ┌──────────────────────┐
                         │      Recruiter       │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │ Netlify              │
                         │ React + Vite         │
                         └──────────┬───────────┘
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │ Render               │
                         │ FastAPI backend      │
                         └──────────┬───────────┘
                                    │ SQLAlchemy
                                    ▼
                         ┌──────────────────────┐
                         │ Render PostgreSQL    │
                         │ Recruitment data     │
                         └──────────────────────┘

                         Optional AI path
                         FastAPI → OpenAI API
                         (deterministic fallback available)
```

## Product Modules

### Dashboard
Recruitment KPIs, hiring funnel, application activity, and hiring trends.

### Candidates
Candidate pool search, skills, experience, role alignment, match scores, and pipeline stages.

### Jobs
Open roles, priority, department, location, employment type, applicant counts, and pipeline access.

### Applications
Stage-based candidate progression with filters, actions, and recruiter workflow controls.

### Interviews
Upcoming and completed interviews, scheduling, interviewer assignment, round tracking, and feedback.

### Analytics
Recruitment performance metrics including cost per hire, time to hire, offer acceptance, source conversion, and monthly hiring activity.

### Resume Intelligence
Resume upload and parsing for PDF, DOCX, and TXT inputs, followed by structured extraction and candidate-job matching.

### AI Hiring Copilot
Grounded recruitment analysis over PostgreSQL data with explainable signals and operational recommendations. OpenAI is optional.

## Explainable Decision Support

HireSense is designed as **decision support, not blind automation**. Candidate-job matching and AI-assisted insights expose the signals behind the analysis so recruiters can review evidence and retain human control over hiring decisions.

## Development Milestones

The application was built incrementally across seven stages:

1. **Foundation** — PostgreSQL schema, seed data, FastAPI foundation, and initial React dashboard.
2. **Product UI** — recruiter-facing Candidates, Jobs, Applications, Interviews, Analytics, and Copilot modules.
3. **Live Data Layer** — PostgreSQL-backed APIs, search/filter support, and frontend service integration.
4. **Resume Intelligence** — PDF/DOCX/TXT parsing, extraction, persistence, explainable matching, and skill-gap recommendations.
5. **AI Hiring Copilot** — natural-language recruitment analysis, candidate ranking, hiring diagnostics, and next actions.
6. **Security & Quality** — authentication, protected routes, CI, environment configuration, and production setup.
7. **Production Polish** — security headers, reproducible builds, deployment configuration, containers, and portfolio documentation.

## Run Locally

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

### 2. Configure and run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set the required values in `.env`, then run:

```bash
python -m app.db.seed
python -m uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Backend deployments should provide:

```text
DATABASE_URL=...
APP_ENV=production
CORS_ORIGINS=https://hiresense-ai-frontend.netlify.app
AUTH_SECRET=...
OPENAI_API_KEY=...        # optional
OPENAI_MODEL=...          # optional
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Never commit real credentials, database URLs, or API keys.

## Authentication

Protected API operations use bearer authentication. The development seed reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the backend environment.

For production deployment, create dedicated credentials and a strong random `AUTH_SECRET`.

## OpenAI Integration

OpenAI is **optional**. Supported Hiring Copilot questions can be answered using deterministic PostgreSQL-backed analysis without an API key. When configured, the backend can use OpenAI for live LLM-assisted responses.

Keep `OPENAI_API_KEY` strictly server-side. Never expose it through React or commit it to Git.

## API Surface

```text
GET  /api/health
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
GET  /api/dashboard
GET  /api/candidates?search=&stage=&role=
GET  /api/jobs?search=&status=
GET  /api/applications
GET  /api/interviews
GET  /api/analytics
POST /api/resume/upload/{candidate_id}
GET  /api/resume/{candidate_id}
POST /api/resume/match/{candidate_id}/{job_id}
POST /api/ai/copilot
```

## CI & Deployment

GitHub Actions validates the backend test suite and frontend production build on pushes and pull requests to `main`.

Production topology:

```text
GitHub
 ├── frontend/  → Netlify
 └── backend/   → Render
                  └── PostgreSQL
```

## Security

- Environment files are ignored by Git.
- Secrets stay server-side.
- Protected endpoints require authentication.
- Passwords use PBKDF2-HMAC hashing.
- Security headers are applied by the API.
- CORS is controlled through the deployment environment.
- Resume/job matching is presented as explainable decision support.

## Live Deployment

- **Frontend:** https://hiresense-ai-frontend.netlify.app/
- **Backend:** https://hiresense-ai-ybbx.onrender.com/
- **Swagger:** https://hiresense-ai-ybbx.onrender.com/docs
- **Repository:** https://github.com/Unknowncoder3/hiresense-ai

## Portfolio Note

This project demonstrates end-to-end product thinking across frontend engineering, REST APIs, relational data, analytics, ML-assisted matching, document processing, authentication, deployment, and responsible AI UX.

## License

Portfolio/demo project created for educational and professional demonstration purposes.
