from datetime import date, datetime
from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    department: Mapped[str] = mapped_column(String(80), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Open")
    openings: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[date] = mapped_column(Date, nullable=False)
    applications = relationship("Application", back_populates="job")

class Candidate(Base):
    __tablename__ = "candidates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    experience_years: Mapped[float] = mapped_column(Float, default=0)
    skills: Mapped[str] = mapped_column(Text, default="")
    education: Mapped[str] = mapped_column(String(180), default="")
    source: Mapped[str] = mapped_column(String(80), default="LinkedIn")
    created_at: Mapped[date] = mapped_column(Date, nullable=False)
    applications = relationship("Application", back_populates="candidate")

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), nullable=False)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), nullable=False)
    stage: Mapped[str] = mapped_column(String(40), default="Applied")
    match_score: Mapped[float] = mapped_column(Float, default=0)
    applied_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class Interview(Base):
    __tablename__ = "interviews"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), nullable=False)
    interview_type: Mapped[str] = mapped_column(String(50), default="Technical")
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    outcome: Mapped[str] = mapped_column(String(40), default="Pending")
