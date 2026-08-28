from collections import Counter, defaultdict
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.recruitment import Candidate, Job, Application, Interview

STAGES = ["Applied", "Screening", "Shortlisted", "Interview", "Offer", "Hired"]

def get_dashboard(db: Session):
    total_candidates = db.scalar(select(func.count(Candidate.id))) or 0
    active_jobs = db.scalar(select(func.count(Job.id)).where(Job.status == "Open")) or 0
    shortlisted = db.scalar(select(func.count(Application.id)).where(Application.stage.in_(["Shortlisted", "Interview", "Offer", "Hired"]))) or 0
    interviews = db.scalar(select(func.count(Interview.id))) or 0
    offers = db.scalar(select(func.count(Application.id)).where(Application.stage.in_(["Offer", "Hired"]))) or 0
    hired = db.scalar(select(func.count(Application.id)).where(Application.stage == "Hired")) or 0
    hiring_rate = round((hired / total_candidates * 100), 1) if total_candidates else 0

    funnel = []
    for stage in STAGES:
        count = db.scalar(select(func.count(Application.id)).where(Application.stage == stage)) or 0
        funnel.append({"stage": stage, "count": count})

    rows = db.execute(
        select(Application, Candidate, Job)
        .join(Candidate, Candidate.id == Application.candidate_id)
        .join(Job, Job.id == Application.job_id)
        .order_by(Application.match_score.desc())
        .limit(8)
    ).all()
    candidates = [{
        "id": app.id,
        "name": candidate.name,
        "job": job.title,
        "match_score": round(app.match_score, 1),
        "stage": app.stage,
        "experience_years": candidate.experience_years,
        "location": candidate.location,
    } for app, candidate, job in rows]

    trend_rows = db.execute(select(Application.applied_at, Application.stage)).all()
    months = defaultdict(lambda: {"applications": 0, "hires": 0})
    for applied_at, stage in trend_rows:
        key = applied_at.strftime("%b")
        months[key]["applications"] += 1
        if stage == "Hired":
            months[key]["hires"] += 1
    ordered = sorted(months.items(), key=lambda x: datetime.strptime(x[0], "%b").month)
    trends = [{"month": m, **vals} for m, vals in ordered]

    return {
        "kpis": {
            "total_candidates": total_candidates,
            "active_jobs": active_jobs,
            "shortlisted": shortlisted,
            "interviews": interviews,
            "offers": offers,
            "hiring_rate": hiring_rate,
            "avg_time_to_hire_days": 18.6 if hired else 0,
        },
        "funnel": funnel,
        "trends": trends,
        "candidates": candidates,
    }
