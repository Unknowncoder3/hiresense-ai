from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.copilot import ask_copilot
from app.services.dashboard import get_dashboard
from app.services.recruitment import analytics, list_applications, list_candidates, list_interviews, list_jobs, _skills_for_role
from app.models.recruitment import Application, Candidate, Interview, Job

router = APIRouter(prefix="/api")

@router.get("/health")
def health():
    return {"status": "ok", "service": "hiresense-api"}

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return get_dashboard(db)

@router.get("/candidates")
def candidates(search: str = Query(default=""), stage: str = Query(default=""), role: str = Query(default=""), db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return {"items": list_candidates(db, search=search, stage=stage, role=role)}

@router.post("/candidates")
def create_candidate(payload: dict, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    name=str(payload.get("name", "")).strip(); email=str(payload.get("email", "")).strip().lower(); location=str(payload.get("location", "Remote")).strip() or "Remote"
    if not name or not email: raise HTTPException(status_code=400, detail="Name and email are required")
    if db.scalar(select(Candidate).where(Candidate.email == email)): raise HTTPException(status_code=409, detail="A candidate with this email already exists")
    candidate=Candidate(name=name,email=email,location=location,experience_years=float(payload.get("experience_years",0) or 0),skills=str(payload.get("skills","")).strip(),education=str(payload.get("education","B.Tech Computer Science")).strip(),source=str(payload.get("source","Manual entry")).strip(),created_at=date.today())
    db.add(candidate); db.flush()
    job_id=payload.get("job_id")
    if job_id:
        job=db.get(Job,int(job_id))
        if not job: raise HTTPException(status_code=404, detail="Job not found")
        db.add(Application(candidate_id=candidate.id,job_id=job.id,stage="Applied",match_score=float(payload.get("match_score",75) or 75),applied_at=datetime.utcnow()))
    db.commit(); db.refresh(candidate)
    return {"id":candidate.id,"name":candidate.name,"email":candidate.email}

@router.get("/jobs")
def jobs(search: str = Query(default=""), status: str = Query(default=""), db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return {"items": list_jobs(db, search=search, status=status)}

@router.post("/jobs")
def create_job(payload: dict, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    title=str(payload.get("title","")).strip(); department=str(payload.get("department","Engineering")).strip() or "Engineering"; location=str(payload.get("location","Remote")).strip() or "Remote"
    if not title: raise HTTPException(status_code=400, detail="Job title is required")
    openings=max(1,int(payload.get("openings",1) or 1))
    job=Job(title=title,department=department,location=location,status="Open",openings=openings,created_at=date.today())
    db.add(job); db.commit(); db.refresh(job)
    return {"id":job.id,"title":job.title,"department":job.department,"location":job.location,"status":job.status,"openings":job.openings,"skills":_skills_for_role(job.title)}

@router.get("/applications")
def applications(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return {"items": list_applications(db)}

@router.patch("/applications/{application_id}/stage")
def update_application_stage(application_id: int, payload: dict, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    stages={"Applied","Screening","Shortlisted","Interview","Offer","Hired"}; stage=str(payload.get("stage","")).strip()
    if stage not in stages: raise HTTPException(status_code=400, detail="Invalid application stage")
    app=db.get(Application,application_id)
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    app.stage=stage; db.commit()
    return {"id":app.id,"stage":app.stage}

@router.get("/interviews")
def interviews(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return {"items": list_interviews(db)}

@router.post("/interviews")
def create_interview(payload: dict, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    application_id=int(payload.get("application_id") or 0); interview_type=str(payload.get("interview_type","Technical")); scheduled=str(payload.get("scheduled_at","")).strip()
    if not application_id or not scheduled: raise HTTPException(status_code=400, detail="Application and scheduled time are required")
    if not db.get(Application,application_id): raise HTTPException(status_code=404, detail="Application not found")
    try: scheduled_at=datetime.fromisoformat(scheduled.replace("Z","+00:00")).replace(tzinfo=None)
    except ValueError as exc: raise HTTPException(status_code=400, detail="Invalid scheduled time") from exc
    interview=Interview(application_id=application_id,interview_type=interview_type,scheduled_at=scheduled_at,outcome="Pending")
    db.add(interview); db.commit(); db.refresh(interview)
    return {"id":interview.id,"status":"Scheduled"}

@router.get("/analytics")
def recruitment_analytics(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return analytics(db)

@router.post("/ai/copilot")
def copilot(payload: dict, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    question=str(payload.get("question", "")); return ask_copilot(db, question)
