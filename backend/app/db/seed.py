import os
from datetime import date, datetime, timedelta
from random import Random
from sqlalchemy import delete
from app.db.session import Base, engine, SessionLocal
from app.models import Job, Candidate, Application, Interview, User
from app.services.auth import hash_password

rng = Random(42)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for model in [Interview, Application, Candidate, Job]:
            db.execute(delete(model))

        admin_email = os.getenv("ADMIN_EMAIL", "admin@hiresense.ai").lower()
        admin_password = os.getenv("ADMIN_PASSWORD", "HireSense123!")
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            db.add(User(name="Snehasish", email=admin_email, password_hash=hash_password(admin_password), role="Recruiter"))
        else:
            admin.password_hash = hash_password(admin_password)
            admin.name = "Snehasish"
            admin.role = "Recruiter"

        jobs = [
            Job(title="Data Analyst", department="Data", location="Bengaluru", status="Open", openings=3, created_at=date(2026, 6, 3)),
            Job(title="ML Engineer", department="AI", location="Hyderabad", status="Open", openings=2, created_at=date(2026, 6, 9)),
            Job(title="Product Analyst", department="Product", location="Remote", status="Open", openings=2, created_at=date(2026, 7, 1)),
            Job(title="Backend Engineer", department="Engineering", location="Pune", status="Open", openings=4, created_at=date(2026, 7, 12)),
            Job(title="BI Developer", department="Data", location="Mumbai", status="Closed", openings=2, created_at=date(2026, 5, 18)),
        ]
        db.add_all(jobs); db.flush()
        names = ["Aarav Mehta","Priya Sharma","Rohan Das","Ananya Singh","Kabir Verma","Ishita Roy","Aditya Sen","Neha Kapoor","Arjun Nair","Meera Iyer","Rahul Joshi","Sana Khan","Vivek Rao","Tanya Bose","Karan Malhotra","Pooja Gupta","Dev Patel","Riya Sen","Aman Ghosh","Nikita Das","Siddharth Jain","Maya Roy","Aditi Shah","Varun Kumar"]
        skills = ["Python, SQL, Power BI, Excel, Pandas", "Python, ML, TensorFlow, SQL, AWS", "SQL, Tableau, Excel, Statistics, Python", "Java, Spring Boot, PostgreSQL, Docker", "Python, NLP, Scikit-learn, SQL, Git"]
        candidates=[]
        for i, name in enumerate(names, start=1):
            candidates.append(Candidate(name=name, email=f"candidate{i}@example.com", location=rng.choice(["Bengaluru","Hyderabad","Kolkata","Pune","Mumbai","Remote"]), experience_years=round(rng.uniform(0.5, 5.5), 1), skills=rng.choice(skills), education=rng.choice(["B.Tech Computer Science","B.Tech CSBS","M.Sc Data Science","BCA","MBA Analytics"]), source=rng.choice(["LinkedIn","Referral","Company Website","Job Portal","Campus"]), created_at=date(2026, 6, rng.randint(1, 28))))
        db.add_all(candidates); db.flush()
        stages=["Applied","Screening","Shortlisted","Interview","Offer","Hired"]
        applications=[]
        for c in candidates:
            job = rng.choice(jobs[:4]); stage = rng.choices(stages, weights=[25,20,18,15,10,12])[0]
            applications.append(Application(candidate_id=c.id, job_id=job.id, stage=stage, match_score=round(rng.uniform(68,98),1), applied_at=datetime(2026,6,1)+timedelta(days=rng.randint(0,85))))
        db.add_all(applications); db.flush()
        for application in applications:
            if application.stage in ["Interview", "Offer", "Hired"]:
                db.add(Interview(application_id=application.id, interview_type=rng.choice(["Technical","Hiring Manager","HR"]), scheduled_at=application.applied_at+timedelta(days=rng.randint(5,16)), score=round(rng.uniform(62,98),1), outcome="Passed" if application.stage in ["Offer","Hired"] else "Pending"))
        db.commit()
        print(f"Seeded {len(jobs)} jobs, {len(candidates)} candidates, {len(applications)} applications")
        print(f"Recruiter login: {admin_email}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
