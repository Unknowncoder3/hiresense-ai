from collections import Counter
from typing import Any

from openai import OpenAI
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.recruitment import Application, Candidate, Job


SUGGESTIONS = [
    "Which candidates are strongest for Data Analyst?",
    "Why did our hiring rate change this month?",
    "Which sourcing channel converts best?",
    "Show me roles that need recruiter attention.",
]


def _candidate_rows(db: Session) -> list[dict[str, Any]]:
    rows = db.execute(
        select(Candidate, Application, Job)
        .join(Application, Application.candidate_id == Candidate.id)
        .join(Job, Job.id == Application.job_id)
        .order_by(Application.match_score.desc(), Candidate.name.asc())
        .limit(20)
    ).all()
    return [
        {
            "id": candidate.id,
            "name": candidate.name,
            "role": job.title,
            "department": job.department,
            "location": candidate.location,
            "experience": candidate.experience_years,
            "skills": [s.strip() for s in candidate.skills.split(",") if s.strip()],
            "match_score": round(application.match_score, 1),
            "stage": application.stage,
            "source": candidate.source,
        }
        for candidate, application, job in rows
    ]


def _build_context(db: Session, question: str) -> dict[str, Any]:
    candidates = _candidate_rows(db)
    jobs = db.scalars(select(Job).order_by(Job.created_at.desc())).all()

    funnel = {}
    for stage in ["Applied", "Screening", "Shortlisted", "Interview", "Offer", "Hired"]:
        funnel[stage] = db.scalar(
            select(func.count(Application.id)).where(Application.stage == stage)
        ) or 0

    source_counts = dict(
        db.execute(
            select(Candidate.source, func.count(Application.id))
            .join(Application, Application.candidate_id == Candidate.id)
            .group_by(Candidate.source)
        ).all()
    )

    roles = [
        {
            "id": job.id,
            "title": job.title,
            "department": job.department,
            "location": job.location,
            "status": job.status,
            "openings": job.openings,
            "applications": db.scalar(
                select(func.count(Application.id)).where(Application.job_id == job.id)
            ) or 0,
        }
        for job in jobs
    ]

    q = question.lower()
    if any(word in q for word in ["candidate", "strongest", "best", "match", "data analyst", "data scientist", "engineer"]):
        intent = "candidate_ranking"
    elif any(word in q for word in ["source", "linkedin", "referral", "channel"]):
        intent = "sourcing"
    elif any(word in q for word in ["role", "job", "attention", "opening"]):
        intent = "job_attention"
    else:
        intent = "hiring_diagnostics"

    return {
        "intent": intent,
        "question": question,
        "candidates": candidates,
        "jobs": roles,
        "funnel": funnel,
        "source_counts": source_counts,
    }


def _fallback_answer(context: dict[str, Any]) -> dict[str, Any]:
    intent = context["intent"]
    candidates = context["candidates"]
    funnel = context["funnel"]
    source_counts = context["source_counts"]
    jobs = context["jobs"]

    if intent == "candidate_ranking":
        top = candidates[:5]
        explanation = "Top candidates are ranked by the current application match score, then checked against role, experience, and stage context."
        recommendations = [f"Review {candidate['name']} ({candidate['match_score']}% match)" for candidate in top[:3]]
        signals = [
            {"label": "Top match", "value": f"{top[0]['name']} · {top[0]['match_score']}%" if top else "No candidates", "detail": "Highest current application match score."},
            {"label": "Candidate pool", "value": str(len(candidates)), "detail": "Recent active applications available to the copilot."},
            {"label": "Primary signal", "value": "Skill alignment", "detail": "Application match score is the leading ranking signal."},
        ]
        return {"answer": explanation, "signals": signals, "recommendations": recommendations, "candidates": top, "source": "rules"}

    if intent == "sourcing":
        total = sum(source_counts.values()) or 1
        ranked = sorted(source_counts.items(), key=lambda item: item[1], reverse=True)
        best = ranked[0] if ranked else ("—", 0)
        signals = [
            {"label": "Top source", "value": best[0], "detail": f"{best[1]} applications in the current dataset."},
            {"label": "Share", "value": f"{best[1] / total * 100:.1f}%", "detail": "Share of tracked applications by source."},
            {"label": "Tracked sources", "value": str(len(source_counts)), "detail": "Distinct candidate acquisition sources."},
        ]
        recommendations = [f"Benchmark conversion from {name} before increasing spend or outreach." for name, _ in ranked[:3]]
        return {"answer": f"{best[0]} is the largest source by application volume in the current dataset. Use source-to-hire conversion, not volume alone, for budget decisions.", "signals": signals, "recommendations": recommendations, "candidates": [], "source": "rules"}

    if intent == "job_attention":
        attention = sorted(jobs, key=lambda job: (job["status"] != "Open", -job["applications"]))[:5]
        signals = [
            {"label": "Open roles", "value": str(sum(job["status"] == "Open" for job in jobs)), "detail": "Currently open positions."},
            {"label": "Highest applicant load", "value": f"{attention[0]['title']} · {attention[0]['applications']}" if attention else "—", "detail": "Largest application volume in the current dataset."},
            {"label": "Action", "value": "Review pipeline", "detail": "Prioritize roles with low applicant volume or aging demand."},
        ]
        recommendations = [f"Review {job['title']} ({job['applications']} applications, {job['openings']} openings)" for job in attention[:3]]
        return {"answer": "Roles needing recruiter attention are best identified by open status, applicant volume, and openings. Start with roles where demand and available candidates are out of balance.", "signals": signals, "recommendations": recommendations, "candidates": [], "source": "rules"}

    applied = funnel.get("Applied", 0)
    hired = funnel.get("Hired", 0)
    interview = funnel.get("Interview", 0)
    conversion = hired / applied * 100 if applied else 0
    signals = [
        {"label": "Hiring rate", "value": f"{conversion:.1f}%", "detail": f"{hired} hired from {applied} applications in the current dataset."},
        {"label": "Interview stage", "value": str(interview), "detail": "Applications currently at interview stage."},
        {"label": "Largest funnel", "value": str(max(funnel, key=funnel.get)), "detail": "Stage with the largest current candidate volume."},
    ]
    recommendations = [
        "Inspect conversion between Screening → Shortlisted.",
        "Review Interview → Offer progression for bottlenecks.",
        "Compare source quality using hires, not application volume alone.",
    ]
    return {"answer": "The current dataset shows where the hiring funnel is concentrated, but month-over-month movement needs historical snapshots to explain a true change over time.", "signals": signals, "recommendations": recommendations, "candidates": [], "source": "rules"}


def ask_copilot(db: Session, question: str) -> dict[str, Any]:
    question = question.strip()
    if not question:
        raise ValueError("Question cannot be empty")

    context = _build_context(db, question)
    fallback = _fallback_answer(context)

    if not settings.openai_api_key:
        fallback["ai_enabled"] = False
        fallback["notice"] = "OpenAI API key not configured. Showing deterministic recruitment analysis from PostgreSQL."
        return fallback

    try:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.responses.create(
            model=settings.openai_model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are HireSense AI, a recruitment analytics copilot. "
                        "Use only the supplied recruitment data. Do not invent facts. "
                        "Return concise decision support, cite the relevant numeric signals "
                        "from the context, and never make a final hiring decision. "
                        "Recommendations must keep a human recruiter in the loop."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Recruiter question: {question}\n\n"
                        f"Recruitment context:\n{context}\n\n"
                        "Write a clear 2-4 sentence answer plus one sentence on what the recruiter should inspect next."
                    ),
                },
            ],
        )
        answer = response.output_text.strip()
        fallback["answer"] = answer
        fallback["source"] = "openai"
        fallback["ai_enabled"] = True
        fallback["model"] = settings.openai_model
        fallback["notice"] = "AI response grounded in the current PostgreSQL recruitment dataset."
        return fallback
    except Exception as exc:
        fallback["ai_enabled"] = False
        fallback["source"] = "rules-fallback"
        fallback["notice"] = f"OpenAI request unavailable; using deterministic analysis instead. ({type(exc).__name__})"
        return fallback
