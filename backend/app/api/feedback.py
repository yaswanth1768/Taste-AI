"""
Feedback & Interaction API Endpoints (Like, Dislike, Favorite, History).
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.services.feedback_service import feedback_service
from backend.app.schemas.feedback import FeedbackCreate, FeedbackOut, FavoriteCreate, FavoriteOut
from backend.app.api.auth import require_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback & Interactions"])

@router.post("", response_model=FeedbackOut)
def record_user_feedback(
    feedback_in: FeedbackCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """Records an explicit interaction (like, dislike, favorite, skip, click) from the user."""
    return feedback_service.record_interaction(
        user_id=current_user.id,
        feedback=feedback_in,
        db=db
    )

@router.post("/favorite")
def toggle_favorite(
    fav_in: FavoriteCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """Toggles bookmark/favorite status for a movie or music track."""
    return feedback_service.toggle_favorite(
        user_id=current_user.id,
        favorite=fav_in,
        db=db
    )

@router.get("/favorites", response_model=List[FavoriteOut])
def get_user_favorites(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all items bookmarked by the user."""
    return feedback_service.get_user_favorites(user_id=current_user.id, db=db)

@router.get("/history", response_model=List[FeedbackOut])
def get_user_interaction_history(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves interaction history for the current user."""
    return feedback_service.get_user_interactions(user_id=current_user.id, db=db)
