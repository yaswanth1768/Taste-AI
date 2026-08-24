"""
Export all SQLAlchemy models for TasteAI.
"""

from backend.app.database.base import Base
from backend.app.models.user import User, UserPreference
from backend.app.models.movie import Movie
from backend.app.models.music import Music
from backend.app.models.interaction import UserInteraction, Favorite, RecommendationHistory

__all__ = [
    "Base",
    "User",
    "UserPreference",
    "Movie",
    "Music",
    "UserInteraction",
    "Favorite",
    "RecommendationHistory"
]
