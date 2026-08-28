from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import Base, engine
from app.models import Job, Candidate, Application, Interview  # noqa: F401
from app.api.routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HireSense AI API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

@app.get("/")
def root():
    return {"name": "HireSense AI", "docs": "/docs"}
