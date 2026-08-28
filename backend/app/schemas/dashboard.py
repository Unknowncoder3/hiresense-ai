from pydantic import BaseModel
from typing import List

class KPIResponse(BaseModel):
    total_candidates: int
    active_jobs: int
    shortlisted: int
    interviews: int
    offers: int
    hiring_rate: float
    avg_time_to_hire_days: float

class FunnelItem(BaseModel):
    stage: str
    count: int

class TrendItem(BaseModel):
    month: str
    applications: int
    hires: int

class CandidateRow(BaseModel):
    id: int
    name: str
    job: str
    match_score: float
    stage: str
    experience_years: float
    location: str

class DashboardResponse(BaseModel):
    kpis: KPIResponse
    funnel: List[FunnelItem]
    trends: List[TrendItem]
    candidates: List[CandidateRow]
