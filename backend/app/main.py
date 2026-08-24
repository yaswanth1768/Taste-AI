"""
TasteAI FastAPI Application Entrypoint.
Production-ready REST API orchestrating AI-driven personalized movie and music recommendations.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.database.session import engine
from backend.app.models import Base
from backend.app.recommender.movie_engine import movie_engine
from backend.app.recommender.music_engine import music_engine

# Include API Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.users import router as users_router
from backend.app.api.movies import router as movies_router
from backend.app.api.music import router as music_router
from backend.app.api.recommendations import router as recommendations_router
from backend.app.api.feedback import router as feedback_router
from backend.app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB tables exist and models are loaded
    print("[TasteAI Backend] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("[TasteAI Backend] Verifying recommendation engines...")
    if movie_engine.movies_df is None:
        movie_engine.load_models()
    if music_engine.music_df is None:
        music_engine.load_models()
        
    print("[TasteAI Backend] Ready to serve recommendations!")
    yield
    # Shutdown
    print("[TasteAI Backend] Shutting down...")

app = FastAPI(
    title="TasteAI - AI Movie & Music Recommendation System",
    description="Production-grade Hybrid & Cross-Domain Recommendation REST API for Movies & Music.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: configure explicit origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[ERROR] Unhandled server exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Include API Endpoints
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(movies_router, prefix=settings.API_V1_STR)
app.include_router(music_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(feedback_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
