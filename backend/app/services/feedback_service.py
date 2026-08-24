"""
Feedback & Interaction Tracking Service for TasteAI.
Processes User likes, dislikes, skips, and favorites to refine personalization profiles.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.interaction import UserInteraction, Favorite
from backend.app.models.user import UserPreference
from backend.app.schemas.feedback import FeedbackCreate, FavoriteCreate

class FeedbackService:
    def record_interaction(self, user_id: int, feedback: FeedbackCreate, db: Session) -> UserInteraction:
        """Stores or updates user interaction (like, dislike, favorite, skip, click)."""
        existing = db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id,
            UserInteraction.item_id == feedback.item_id,
            UserInteraction.item_type == feedback.item_type
        ).first()

        if existing:
            existing.action = feedback.action
            existing.rating = feedback.rating
            existing.timestamp = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            return existing

        new_interaction = UserInteraction(
            user_id=user_id,
            item_id=feedback.item_id,
            item_type=feedback.item_type,
            action=feedback.action,
            rating=feedback.rating
        )
        db.add(new_interaction)
        db.commit()
        db.refresh(new_interaction)
        return new_interaction

    def toggle_favorite(self, user_id: int, favorite: FavoriteCreate, db: Session) -> Dict[str, Any]:
        """Adds or removes item from user's favorites list."""
        existing = db.query(Favorite).filter(
            Favorite.user_id == user_id,
            Favorite.item_id == favorite.item_id,
            Favorite.item_type == favorite.item_type
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            return {"status": "removed", "item_id": favorite.item_id}

        new_fav = Favorite(
            user_id=user_id,
            item_id=favorite.item_id,
            item_type=favorite.item_type,
            title=favorite.title,
            subtitle=favorite.subtitle or "",
            artwork_url=favorite.artwork_url
        )
        db.add(new_fav)
        db.commit()
        db.refresh(new_fav)
        return {"status": "added", "favorite": new_fav}

    def get_user_favorites(self, user_id: int, db: Session):
        return db.query(Favorite).filter(Favorite.user_id == user_id).order_by(Favorite.created_at.desc()).all()

    def get_user_interactions(self, user_id: int, db: Session, limit: int = 50):
        return db.query(UserInteraction).filter(UserInteraction.user_id == user_id).order_by(UserInteraction.timestamp.desc()).limit(limit).all()

feedback_service = FeedbackService()
