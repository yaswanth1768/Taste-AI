"""
Export all Pydantic schemas.
"""

from backend.app.schemas.user import (
    UserCreate, UserLogin, UserOut, Token, UserPreferencesUpdate, UserPreferencesOut
)
from backend.app.schemas.movie import (
    MovieOut, MovieRecommendationItem, MovieRecommendationResponse
)
from backend.app.schemas.music import (
    MusicOut, MusicRecommendationItem, MusicRecommendationResponse, AudioFeatures
)
from backend.app.schemas.recommendation import (
    PersonalizedRecommendationResponse, MoodRecommendationResponse, CrossDomainRecommendationResponse
)
from backend.app.schemas.feedback import (
    FeedbackCreate, FeedbackOut, FavoriteCreate, FavoriteOut
)

__all__ = [
    "UserCreate", "UserLogin", "UserOut", "Token", "UserPreferencesUpdate", "UserPreferencesOut",
    "MovieOut", "MovieRecommendationItem", "MovieRecommendationResponse",
    "MusicOut", "MusicRecommendationItem", "MusicRecommendationResponse", "AudioFeatures",
    "PersonalizedRecommendationResponse", "MoodRecommendationResponse", "CrossDomainRecommendationResponse",
    "FeedbackCreate", "FeedbackOut", "FavoriteCreate", "FavoriteOut"
]
