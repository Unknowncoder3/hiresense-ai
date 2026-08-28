from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dashboard import get_dashboard

router = APIRouter(prefix="/api")

@router.get("/health")
def health():
    return {"status": "ok", "service": "hiresense-api"}

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard(db)
