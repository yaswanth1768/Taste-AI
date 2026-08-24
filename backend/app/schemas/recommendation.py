"""
Pydantic Schemas for Hybrid, Mood, and Cross-Domain Recommendations.
"""

from typing import List, Optional, Any
from pydantic import BaseModel
from backend.app.schemas.movie import MovieRecommendationItem
from backend.app.schemas.music import MusicRecommendationItem

class PersonalizedRecommendationResponse(BaseModel):
    user_id: int
    recommended_movies: List[MovieRecommendationItem]
    recommended_music: List[MusicRecommendationItem]
    mood_movies: List[MovieRecommendationItem]
    mood_music: List[MusicRecommendationItem]
    because_you_liked_movies: List[MovieRecommendationItem]
    because_you_liked_music: List[MusicRecommendationItem]
    cross_domain: Optional[Any] = None

class MoodRecommendationResponse(BaseModel):
    mood: str
    movies: List[MovieRecommendationItem]
    music: List[MusicRecommendationItem]
    explanation: str

class CrossDomainRecommendationResponse(BaseModel):
    query_type: str # 'movie' or 'music'
    query_item: str
    recommended_tracks: Optional[List[MusicRecommendationItem]] = []
    recommended_movies: Optional[List[MovieRecommendationItem]] = []
    cross_domain_theme: str
    explanation: str
