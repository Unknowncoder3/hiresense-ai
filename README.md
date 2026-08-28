# HireSense AI

AI-powered Recruitment Intelligence Dashboard — a production-style portfolio project for recruiter analytics, candidate intelligence, job matching, and hiring insights.

## Stack
- Frontend: React + Vite 8 + Bootstrap 5.3 + Recharts
- Backend: FastAPI + SQLAlchemy 2 + PostgreSQL
- Analytics/ML: Pandas + NumPy + Scikit-learn
- AI: OpenAI API (Phase 4)

## Phase 1
This starter includes:
- PostgreSQL schema for jobs, candidates, applications and interviews
- FastAPI health and recruitment KPI APIs
- Seed data with realistic recruitment records
- React dashboard with KPI cards, hiring funnel, trends and candidate table
- Docker Compose for PostgreSQL

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
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

API docs: http://localhost:8000/docs
# hiresense-ai
