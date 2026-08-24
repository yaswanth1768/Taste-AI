"""
Music SQLAlchemy Model for Tracks & Audio Profiles.
"""

from sqlalchemy import Column, Integer, String, Float
from backend.app.database.base import Base

class Music(Base):
    __tablename__ = "music"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    track_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), index=True, nullable=False)
    artist = Column(String(255), index=True, nullable=False)
    album = Column(String(255), default="")
    genre = Column(String(100), index=True, default="pop")
    popularity = Column(Float, default=50.0)
    duration_ms = Column(Integer, default=180000)
    
    # Standard Audio Features
    danceability = Column(Float, default=0.5)
    energy = Column(Float, default=0.5)
    valence = Column(Float, default=0.5)
    tempo = Column(Float, default=120.0)
    acousticness = Column(Float, default=0.5)
    instrumentalness = Column(Float, default=0.0)
    loudness = Column(Float, default=-8.0)
    speechiness = Column(Float, default=0.05)
    liveness = Column(Float, default=0.1)

    artwork_url = Column(String(255), nullable=True)
    preview_url = Column(String(255), nullable=True)
