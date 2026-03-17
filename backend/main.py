from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, doctors, scan, appointments, dashboard
from app.config import settings

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LungCare+ API",
    description="AI-powered lung cancer detection and doctor appointment platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

@app.get("/")
def root():
    return {"message": "backend is working"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
API = "/api"
app.include_router(auth.router,         prefix=API)
app.include_router(doctors.router,      prefix=API)
app.include_router(scan.router,         prefix=API)
app.include_router(appointments.router, prefix=API)
app.include_router(dashboard.router,    prefix=API)


@app.get("/")
def root():
    return {
        "name": "LungCare+ API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
