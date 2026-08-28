from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Candidate, Job, Resume
from app.services.resume_intelligence import extract_skills, extract_text, extract_years, match_resume_to_job

router = APIRouter(prefix="/api/resume", tags=["Resume Intelligence"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


@router.post("/upload/{candidate_id}")
async def upload_resume(candidate_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT resumes are supported")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume exceeds the 8 MB upload limit")

    try:
        text = extract_text(file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if len(text.strip()) < 80:
        raise HTTPException(status_code=400, detail="Could not extract enough readable text from this resume")

    skills = extract_skills(text)
    years = extract_years(text)
    resume = Resume(
        candidate_id=candidate_id,
        filename=file.filename,
        extracted_text=text,
        skills=skills,
        extracted_experience_years=years,
    )
    db.add(resume)

    candidate.skills = ", ".join(skills) if skills else candidate.skills
    if years > candidate.experience_years:
        candidate.experience_years = years
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "candidate_id": candidate_id,
        "filename": resume.filename,
        "skills": skills,
        "extracted_experience_years": years,
        "text_preview": text[:700],
        "parsed_at": resume.parsed_at.isoformat(),
    }


@router.get("/{candidate_id}")
def latest_resume(candidate_id: int, db: Session = Depends(get_db)):
    resume = db.scalar(
        select(Resume)
        .where(Resume.candidate_id == candidate_id)
        .order_by(Resume.parsed_at.desc())
        .limit(1)
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No resume has been uploaded for this candidate")
    return {
        "id": resume.id,
        "filename": resume.filename,
        "skills": resume.skills or [],
        "extracted_experience_years": resume.extracted_experience_years,
        "text_preview": resume.extracted_text[:1200],
        "parsed_at": resume.parsed_at.isoformat(),
    }


@router.post("/match/{candidate_id}/{job_id}")
def match_candidate(candidate_id: int, job_id: int, db: Session = Depends(get_db)):
    candidate = db.get(Candidate, candidate_id)
    job = db.get(Job, job_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume = db.scalar(
        select(Resume)
        .where(Resume.candidate_id == candidate_id)
        .order_by(Resume.parsed_at.desc())
        .limit(1)
    )
    if not resume:
        raise HTTPException(status_code=400, detail="Upload a resume before matching this candidate")

    result = match_resume_to_job(
        resume.extracted_text,
        resume.skills or [],
        job.title,
        candidate.experience_years,
    )
    return {"candidate": candidate.name, "job": job.title, **result}
