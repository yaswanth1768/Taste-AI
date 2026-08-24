"""
Pydantic Schemas for Interactions, Feedback, and Favorites.
"""

from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class FeedbackCreate(BaseModel):
    item_id: str
    item_type: str  # 'movie' or 'music'
    action: str     # 'like', 'dislike', 'favorite', 'skip', 'click'
    rating: Optional[float] = None

class FeedbackOut(FeedbackCreate):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class FavoriteCreate(BaseModel):
    item_id: str
    item_type: str
    title: str
    subtitle: Optional[str] = ""
    artwork_url: Optional[str] = None

class FavoriteOut(FavoriteCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
