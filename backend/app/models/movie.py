"""
Movie SQLAlchemy Model for Cached & Enriched Movies.
"""

from sqlalchemy import Column, Integer, String, Float, Text, JSON
from backend.app.database.base import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True, nullable=True)
    title = Column(String(255), index=True, nullable=False)
    overview = Column(Text, default="")
    genres = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    director = Column(String(150), default="")
    cast = Column(JSON, default=list)
    poster_path = Column(String(255), nullable=True)
    backdrop_path = Column(String(255), nullable=True)
    vote_average = Column(Float, default=0.0)
    vote_count = Column(Integer, default=0)
    popularity = Column(Float, default=0.0)
    release_date = Column(String(50), default="")
    tagline = Column(String(255), default="")
