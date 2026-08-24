"""
Application Configuration and Recommender Hyperparameters for TasteAI.
"""

import os
from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TasteAI - AI Movie & Music Recommender"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-taste-ai-jwt-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    _default_db = "/tmp/tasteai.db" if os.getenv("VERCEL") else os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "tasteai.db")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_default_db}")

    # External APIs
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "")
    SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID", "")
    SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET", "")

    # Configurable Hybrid Recommendation Weights
    # Final Score = 0.40 * Content + 0.25 * UserPref + 0.15 * Popularity + 0.10 * Feedback + 0.10 * Diversity
    HYBRID_WEIGHTS: Dict[str, float] = {
        "content_similarity": 0.40,
        "user_preference": 0.25,
        "popularity": 0.15,
        "feedback": 0.10,
        "diversity": 0.10
    }

    # Model paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    ML_MODELS_DIR: str = os.path.join(BASE_DIR, "ml", "models")
    DATASETS_DIR: str = os.path.join(BASE_DIR, "datasets")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
