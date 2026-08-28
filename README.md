# HireSense AI

AI-powered Recruitment Intelligence Dashboard for recruiter analytics, candidate intelligence, resume matching, and explainable hiring decision support.

## Stack
- Frontend: React + Vite 7 + Bootstrap 5.3 + Recharts
- Backend: FastAPI + SQLAlchemy 2 + PostgreSQL
- Analytics/ML: Pandas + NumPy + Scikit-learn
- Resume intelligence: PyPDF + python-docx + TF-IDF semantic matching
- AI: OpenAI Responses API (optional) with deterministic fallback

## Progress
### Phase 1 — Foundation ✅
- PostgreSQL schema and seed data
- FastAPI health and dashboard API
- React recruiter dashboard
- Docker Compose PostgreSQL

### Phase 2 — Product UI ✅
- Candidates, Jobs, Applications, Interviews, Analytics
- AI Hiring Copilot workspace
- Responsive enterprise-style UI

### Phase 3 — Live Data Layer ✅
- PostgreSQL-backed recruitment APIs
- Search/filter parameters
- React service layer connected to FastAPI

### Phase 4 — Resume Intelligence ✅
- PDF, DOCX and TXT parsing
- Skill and experience extraction
- Resume persistence
- Explainable candidate-job matching
- Skill-gap recommendations

### Phase 5 — AI Hiring Copilot ✅
- Natural-language recruitment questions
- PostgreSQL-grounded recruitment context
- Candidate ranking and hiring diagnostics
- Explainable signals and next actions
- Optional OpenAI integration with deterministic fallback

### Phase 6 — Security, Quality & Deployment ✅
- JWT-based recruiter authentication
- PBKDF2-HMAC password hashing
- Protected recruitment, resume, and Copilot endpoints
- Login, registration, session restore, and sign-out UI
- GitHub Actions CI
- Production Dockerfiles and Nginx SPA configuration
- Environment-based secrets and configuration

### Phase 7 — Production Polish ✅
- API security headers (`nosniff`, frame protection, referrer policy, permissions policy)
- Full backend test suite executed in CI
- Reproducible frontend build in CI
- Production-ready FastAPI and Nginx containers
- Clean environment/secrets workflow
- Deployment-oriented documentation
- Portfolio-ready project structure and README

## Run locally

### Database
```bash
docker compose up -d db
```

### Backend
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

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Authentication
The seed command creates a development recruiter account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`.

Default local credentials:
- Email: `admin@hiresense.ai`
- Password: `HireSense123!`

Change these values before any public deployment.

## OpenAI integration
OpenAI is optional. The Hiring Copilot can answer supported recruitment questions using deterministic PostgreSQL analysis without a key. To enable live LLM responses, put `OPENAI_API_KEY` in `backend/.env` and keep it server-side. Never expose it to React or commit it to Git.

## API endpoints
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/candidates?search=&stage=&role=`
- `GET /api/jobs?search=&status=`
- `GET /api/applications`
- `GET /api/interviews`
- `GET /api/analytics`
- `POST /api/resume/upload/{candidate_id}`
- `GET /api/resume/{candidate_id}`
- `POST /api/resume/match/{candidate_id}/{job_id}`
- `POST /api/ai/copilot`

## CI
GitHub Actions runs the backend test suite and a production frontend build on pushes and pull requests to `main`.

## Production containers
- `backend/Dockerfile` runs FastAPI with Uvicorn. fileciteturn160file0L1-L6
- `frontend/Dockerfile` builds React and serves it through Nginx. fileciteturn161file0L1-L6
- Set `DATABASE_URL`, `CORS_ORIGINS`, `AUTH_SECRET`, `OPENAI_API_KEY`, and admin credentials in the deployment environment.

## Security notes
- `.env` is ignored by Git.
- API keys remain server-side.
- Protected endpoints require a bearer token.
- Use a strong random `AUTH_SECRET` in production.
