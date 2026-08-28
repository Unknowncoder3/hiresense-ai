from datetime import datetime
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.recruitment import Application, Candidate, Interview, Job


def list_candidates(db: Session, search: str = "", stage: str = "", role: str = ""):
    stmt = (
        select(Candidate, Application, Job)
        .join(Application, Application.candidate_id == Candidate.id)
        .join(Job, Job.id == Application.job_id)
        .order_by(Application.match_score.desc(), Candidate.name.asc())
    )
    if stage and stage != "All":
        stmt = stmt.where(Application.stage == stage)
    if role and role != "All":
        stmt = stmt.where(Job.title == role)
    if search:
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(
            Candidate.name.ilike(pattern)
            | Candidate.location.ilike(pattern)
            | Candidate.skills.ilike(pattern)
            | Job.title.ilike(pattern)
        )

    rows = db.execute(stmt).all()
    return [
        {
            "id": candidate.id,
            "application_id": application.id,
            "name": candidate.name,
            "email": candidate.email,
            "role": job.title,
            "department": job.department,
            "location": candidate.location,
            "experience": candidate.experience_years,
            "skills": [s.strip() for s in candidate.skills.split(",") if s.strip()],
            "education": candidate.education,
            "score": round(application.match_score, 1),
            "stage": application.stage,
            "source": candidate.source,
            "applied": application.applied_at.strftime("%d %b %Y"),
        }
        for candidate, application, job in rows
    ]


def list_jobs(db: Session, search: str = "", status: str = ""):
    stmt = select(Job).order_by(Job.created_at.desc())
    if status and status != "All":
        stmt = stmt.where(Job.status == status)
    if search:
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(
            Job.title.ilike(pattern)
            | Job.department.ilike(pattern)
            | Job.location.ilike(pattern)
        )

    results = []
    for job in db.scalars(stmt).all():
        applicant_count = db.scalar(
            select(func.count(Application.id)).where(Application.job_id == job.id)
        ) or 0
        shortlisted_count = db.scalar(
            select(func.count(Application.id)).where(
                Application.job_id == job.id,
                Application.stage.in_(["Shortlisted", "Interview", "Offer", "Hired"]),
            )
        ) or 0
        days_open = max((datetime.utcnow().date() - job.created_at).days, 0)
        priority = "High" if job.status == "Open" and applicant_count < job.openings * 30 else "Medium"
        results.append({
            "id": f"JOB-{job.id:03d}",
            "title": job.title,
            "dept": job.department,
            "location": job.location,
            "type": "Full-time",
            "applicants": applicant_count,
            "shortlisted": shortlisted_count,
            "days": days_open,
            "status": job.status,
            "priority": priority,
            "skills": _skills_for_role(job.title),
            "openings": job.openings,
            "created_at": job.created_at.isoformat(),
        })
    return results


def list_applications(db: Session):
    rows = db.execute(
        select(Application, Candidate, Job)
        .join(Candidate, Candidate.id == Application.candidate_id)
        .join(Job, Job.id == Application.job_id)
        .order_by(Application.applied_at.desc())
    ).all()
    return [
        {
            "id": application.id,
            "candidate": candidate.name,
            "role": job.title,
            "match": round(application.match_score, 1),
            "stage": application.stage,
            "applied": application.applied_at.strftime("%d %b %Y"),
            "location": candidate.location,
        }
        for application, candidate, job in rows
    ]


def list_interviews(db: Session):
    rows = db.execute(
        select(Interview, Application, Candidate, Job)
        .join(Application, Interview.application_id == Application.id)
        .join(Candidate, Application.candidate_id == Candidate.id)
        .join(Job, Application.job_id == Job.id)
        .order_by(Interview.scheduled_at.asc())
    ).all()
    interviewer_pool = ["Priya Shah", "Arvind Kumar", "Neha Kapoor", "Rahul Mehta"]
    return [
        {
            "id": interview.id,
            "candidate": candidate.name,
            "role": job.title,
            "scheduled_at": interview.scheduled_at.isoformat(),
            "date_label": interview.scheduled_at.strftime("%d %b · %I:%M %p"),
            "round": interview.interview_type,
            "interviewer": interviewer_pool[index % len(interviewer_pool)],
            "status": "Scheduled" if interview.outcome == "Pending" else "Completed",
            "score": interview.score,
            "outcome": interview.outcome,
        }
        for index, (interview, _application, candidate, job) in enumerate(rows)
    ]


def analytics(db: Session):
    total_candidates = db.scalar(select(func.count(Candidate.id))) or 0
    hired = db.scalar(select(func.count(Application.id)).where(Application.stage == "Hired")) or 0
    offers = db.scalar(select(func.count(Application.id)).where(Application.stage.in_(["Offer", "Hired"]))) or 0

    source_rows = db.execute(
        select(Candidate.source, func.count(Application.id))
        .join(Application, Application.candidate_id == Candidate.id)
        .group_by(Candidate.source)
    ).all()
    source_total = sum(count for _, count in source_rows) or 1
    sources = [{"name": name, "value": round(count / source_total * 100, 1)} for name, count in source_rows]

    department_rows = db.execute(
        select(Job.department, func.count(Application.id))
        .join(Application, Application.job_id == Job.id)
        .group_by(Job.department)
    ).all()
    departments = []
    for department, application_count in department_rows:
        hire_count = db.scalar(
            select(func.count(Application.id))
            .join(Job, Application.job_id == Job.id)
            .where(Job.department == department, Application.stage == "Hired")
        ) or 0
        departments.append({"name": department, "applications": application_count, "hires": hire_count})

    trend_rows = db.execute(select(Application.applied_at, Application.stage)).all()
    buckets = {}
    for applied_at, stage in trend_rows:
        key = applied_at.strftime("%b")
        buckets.setdefault(key, {"a": 0, "h": 0})
        buckets[key]["a"] += 1
        if stage == "Hired":
            buckets[key]["h"] += 1
    ordered = sorted(buckets.items(), key=lambda item: datetime.strptime(item[0], "%b").month)
    trends = [{"m": month, **values} for month, values in ordered[-6:]]

    interview_count = db.scalar(select(func.count(Interview.id))) or 0
    completed_interviews = db.scalar(select(func.count(Interview.id)).where(Interview.outcome != "Pending")) or 0
    scored = db.scalars(select(Interview.score).where(Interview.score.is_not(None))).all()

    return {
        "kpis": {
            "cost_per_hire": 42800,
            "time_to_hire": 18.6,
            "offer_acceptance": round(hired / offers * 100, 1) if offers else 0,
            "source_conversion": round(hired / total_candidates * 100, 1) if total_candidates else 0,
            "interviews": interview_count,
            "completed_interviews": completed_interviews,
            "avg_interview_score": round(sum(scored) / len(scored), 1) if scored else 0,
        },
        "sources": sources,
        "departments": departments,
        "trends": trends,
    }


def _skills_for_role(title: str):
    defaults = {
        "Data Analyst": ["SQL", "Python", "Power BI"],
        "ML Engineer": ["Python", "TensorFlow", "AWS"],
        "Product Analyst": ["SQL", "Excel", "A/B Testing"],
        "Backend Engineer": ["Python", "PostgreSQL", "Docker"],
        "BI Developer": ["SQL", "Power BI", "DAX"],
    }
    return defaults.get(title, ["Python", "SQL", "Communication"])
