from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.copilot import ask_copilot
from app.services.dashboard import get_dashboard
from app.services.recruitment import analytics, list_applications, list_candidates, list_interviews, list_jobs

router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"status": "ok", "service": "hiresense-api"}


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return get_dashboard(db)


@router.get("/candidates")
def candidates(
    search: str = Query(default=""), stage: str = Query(default=""), role: str = Query(default=""),
    db: Session = Depends(get_db), _user: User = Depends(get_current_user),
):
    return {"items": list_candidates(db, search=search, stage=stage, role=role)}


@router.get("/jobs")
def jobs(
    search: str = Query(default=""), status: str = Query(default=""),
    db: Session = Depends(get_db), _user: User = Depends(get_current_user),
):
    return {"items": list_jobs(db, search=search, status=status)}


@router.get("/applications")
def applications(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return {"items": list_applications(db)}


@router.get("/interviews")
def interviews(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return {"items": list_interviews(db)}


@router.get("/analytics")
def recruitment_analytics(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    return analytics(db)


@router.post("/ai/copilot")
def copilot(payload: dict, db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    question = str(payload.get("question", ""))
    return ask_copilot(db, question)
