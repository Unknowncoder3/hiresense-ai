# HireSense AI

AI-powered Recruitment Intelligence Dashboard — a production-style portfolio project for recruiter analytics, candidate intelligence, job matching, resume intelligence, and hiring insights.

## Stack
- Frontend: React + Vite 7 + Bootstrap 5.3 + Recharts
- Backend: FastAPI + SQLAlchemy 2 + PostgreSQL
- Analytics/ML: Pandas + NumPy + Scikit-learn
- Resume intelligence: PyPDF + python-docx + TF-IDF semantic matching
- AI: OpenAI API (planned for Hiring Copilot)

## Progress
### Phase 1 — Foundation ✅
- PostgreSQL schema for jobs, candidates, applications and interviews
- FastAPI health and dashboard API
- Seed data with realistic recruitment records
- React recruiter dashboard
- Docker Compose for PostgreSQL

### Phase 2 — Product UI ✅
- Candidates intelligence screen with filtering and profile drawer
- Jobs intelligence screen
- Applications pipeline screen
- Interview operations screen
- Recruitment analytics screen
- AI Hiring Copilot preview
- Responsive enterprise-style UI

### Phase 3 — Live Data Layer ✅
- REST endpoints for candidates, jobs, applications, interviews and analytics
- Search and filter parameters for candidates and jobs
- React service layer connected to FastAPI
- Recruitment pages backed by PostgreSQL
- Live pipeline counts and recruitment metrics

### Phase 4 — Resume Intelligence ✅
- PDF, DOCX and TXT resume parsing
- Skill extraction from resume text
- Experience extraction
- Resume metadata persisted in PostgreSQL
- Candidate profile enrichment from parsed resumes
- Explainable candidate-job matching
- Match score breakdown: skills, experience, semantic relevance
- Skill-gap recommendations
- Resume Intelligence workspace in the React app

## Run locally

### 1. Database
```bash
docker compose up -d db
```

### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.db.seed
python -m uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Resume Intelligence API
- `POST /api/resume/upload/{candidate_id}` — upload and parse a PDF/DOCX/TXT resume
- `GET /api/resume/{candidate_id}` — retrieve the latest parsed resume
- `POST /api/resume/match/{candidate_id}/{job_id}` — calculate an explainable job-match score

## Core API endpoints
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/candidates?search=&stage=&role=`
- `GET /api/jobs?search=&status=`
- `GET /api/applications`
- `GET /api/interviews`
- `GET /api/analytics`

## Upcoming phases
- Phase 5: AI Hiring Copilot with natural-language recruitment analysis
- Phase 6: Authentication, deeper testing, CI, and deployment
