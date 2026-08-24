"""
Pydantic Schemas for Users, Authentication, and Preferences.
"""

from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserPreferencesBase(BaseModel):
    favorite_movie_genres: List[str] = []
    favorite_music_genres: List[str] = []
    favorite_movies: List[str] = []
    favorite_artists: List[str] = []
    preferred_language: str = "en"
    preferred_mood: str = "Happy"

class UserPreferencesUpdate(UserPreferencesBase):
    onboarding_completed: Optional[bool] = True

class UserPreferencesOut(UserPreferencesBase):
    id: int
    user_id: int
    onboarding_completed: bool
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    preferences: Optional[UserPreferencesOut] = None

    class Config:
        from_attributes = True
