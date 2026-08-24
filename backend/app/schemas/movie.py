"""
Pydantic Schemas for Movies, Streaming Platforms, and Recommendations.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class StreamingPlatform(BaseModel):
    name: str
    logo_url: Optional[str] = None
    type: str = "Subscription"  # Subscription | Rent | Buy
    watch_url: Optional[str] = None

class MovieBase(BaseModel):
    id: int
    title: str
    overview: Optional[str] = ""
    genres: List[str] = []
    director: Optional[str] = ""
    cast: List[str] = []
    vote_average: float = 0.0
    vote_count: int = 0
    popularity: float = 0.0
    release_date: Optional[str] = ""
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    tagline: Optional[str] = None
    streaming_platforms: List[StreamingPlatform] = []

class MovieOut(MovieBase):
    model_config = ConfigDict(from_attributes=True)

class MovieRecommendationItem(BaseModel):
    id: int
    title: str
    similarity: float
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    genres: List[str] = []
    director: Optional[str] = ""
    vote_average: float = 0.0
    release_date: Optional[str] = ""
    explanation: Optional[str] = None
    streaming_platforms: List[StreamingPlatform] = []

class MovieRecommendationResponse(BaseModel):
    movie: str
    movie_id: int
    recommendations: List[MovieRecommendationItem]
