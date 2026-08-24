"""
Admin Telemetry & Analytics API Endpoints.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.user import User, UserPreference
from backend.app.models.interaction import UserInteraction, Favorite
from backend.app.recommender.movie_engine import movie_engine
from backend.app.recommender.music_engine import music_engine
from backend.app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin & Telemetry"])

@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Returns application statistics, user metrics, model memory state, and interaction breakdown."""
    total_users = db.query(User).count()
    total_interactions = db.query(UserInteraction).count()
    total_likes = db.query(UserInteraction).filter(UserInteraction.action == "like").count()
    total_dislikes = db.query(UserInteraction).filter(UserInteraction.action == "dislike").count()
    total_favorites = db.query(Favorite).count()

    total_movies = len(movie_engine.movies_df) if movie_engine.movies_df is not None else 0
    total_music = len(music_engine.music_df) if music_engine.music_df is not None else 0

    return {
        "status": "online",
        "system": {
            "project_name": settings.PROJECT_NAME,
            "database": "connected",
            "models_loaded": {
                "movie_model": movie_engine.movies_df is not None,
                "music_model": music_engine.music_df is not None
            }
        },
        "catalog": {
            "total_movies": total_movies,
            "total_music_tracks": total_music,
            "movie_genres_count": len(movie_engine.get_all_genres()),
            "music_genres_count": len(music_engine.get_all_genres())
        },
        "users": {
            "total_registered": total_users,
            "total_interactions": total_interactions,
            "likes_count": total_likes,
            "dislikes_count": total_dislikes,
            "favorites_count": total_favorites
        },
        "recommender_hyperparameters": settings.HYBRID_WEIGHTS
    }
