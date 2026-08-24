"""
Pydantic Schemas for Music, Streaming Platforms, and Recommendations.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.movie import StreamingPlatform

class AudioFeatures(BaseModel):
    danceability: float = 0.5
    energy: float = 0.5
    valence: float = 0.5
    tempo: float = 120.0
    acousticness: float = 0.5
    instrumentalness: float = 0.0
    loudness: float = -8.0
    speechiness: float = 0.05
    liveness: float = 0.1

class MusicBase(BaseModel):
    id: str
    title: str
    artist: str
    album: Optional[str] = "Single"
    genre: str = "pop"
    popularity: float = 50.0
    duration_ms: int = 180000
    artwork_url: Optional[str] = None
    poster_path: Optional[str] = None
    preview_url: Optional[str] = None
    audio_features: Optional[AudioFeatures] = None
    streaming_platforms: List[StreamingPlatform] = []

class MusicOut(MusicBase):
    model_config = ConfigDict(from_attributes=True)

class MusicRecommendationItem(BaseModel):
    id: str
    title: str
    artist: str
    genre: str
    similarity: float
    artwork_url: Optional[str] = None
    poster_path: Optional[str] = None
    preview_url: Optional[str] = None
    popularity: float = 50.0
    audio_features: Optional[AudioFeatures] = None
    explanation: Optional[str] = None
    streaming_platforms: List[StreamingPlatform] = []

class MusicRecommendationResponse(BaseModel):
    song: str
    song_id: str
    artist: str
    recommendations: List[MusicRecommendationItem]
