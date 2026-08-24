"""
User Preferences & Onboarding API Endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.user import User, UserPreference
from backend.app.schemas.user import UserPreferencesUpdate, UserPreferencesOut
from backend.app.api.auth import require_current_user

router = APIRouter(prefix="/users", tags=["Users & Preferences"])

@router.get("/preferences", response_model=UserPreferencesOut)
def get_preferences(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """Fetches recommendation preferences for the authenticated user."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/preferences", response_model=UserPreferencesOut)
def update_preferences(
    prefs_in: UserPreferencesUpdate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """Updates user favorite genres, favorite movies/artists, mood, and sets onboarding completed."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    pref.favorite_movie_genres = prefs_in.favorite_movie_genres
    pref.favorite_music_genres = prefs_in.favorite_music_genres
    pref.favorite_movies = prefs_in.favorite_movies
    pref.favorite_artists = prefs_in.favorite_artists
    pref.preferred_language = prefs_in.preferred_language
    pref.preferred_mood = prefs_in.preferred_mood
    pref.onboarding_completed = prefs_in.onboarding_completed if prefs_in.onboarding_completed is not None else True

    db.commit()
    db.refresh(pref)
    return pref
