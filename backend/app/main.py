from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import Base, engine
from app.models import Job, Candidate, Application, Interview, Resume  # noqa: F401
from app.api.routes import router
from app.api.resume import router as resume_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HireSense AI API", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(resume_router)


@app.get("/")
def root():
    return {"name": "HireSense AI", "docs": "/docs", "version": "0.4.0"}
