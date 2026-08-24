"""
User Interactions, Feedback, Favorites, and Recommendation History Models.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.base import Base

class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(String(100), nullable=False, index=True)
    item_type = Column(String(20), nullable=False) # 'movie' or 'music'
    action = Column(String(30), nullable=False)    # 'like', 'dislike', 'favorite', 'skip', 'click'
    rating = Column(Float, nullable=True)          # 1.0 to 5.0
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="interactions")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(String(100), nullable=False)
    item_type = Column(String(20), nullable=False) # 'movie' or 'music'
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), default="")    # Director or Artist
    artwork_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="favorites")

class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(String(100), nullable=False)
    item_type = Column(String(20), nullable=False) # 'movie' or 'music'
    recommendation_type = Column(String(50), default="hybrid") # 'content', 'hybrid', 'mood', 'cross_domain'
    score = Column(Float, default=0.0)
    explanation = Column(Text, default="")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="history")
