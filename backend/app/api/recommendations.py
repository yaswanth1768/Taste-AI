"""
Recommendation Endpoints (Content-Based, Hybrid Personalized, Mood-Based, Cross-Domain).
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.recommender.movie_engine import movie_engine
from backend.app.recommender.music_engine import music_engine
from backend.app.recommender.hybrid_engine import hybrid_engine
from backend.app.recommender.mood_engine import mood_engine
from backend.app.recommender.cross_domain_engine import cross_domain_engine
from backend.app.schemas.movie import MovieRecommendationResponse
from backend.app.schemas.music import MusicRecommendationResponse
from backend.app.schemas.recommendation import (
    PersonalizedRecommendationResponse,
    MoodRecommendationResponse,
    CrossDomainRecommendationResponse
)
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/movies/{movie_id}", response_model=MovieRecommendationResponse)
def get_movie_recommendations(
    movie_id: int,
    top_k: int = Query(5, ge=1, le=20)
):
    """Returns content-based movie recommendations using CountVectorizer & Cosine Similarity."""
    movie = movie_engine.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {movie_id} not found."
        )

    recommendations = movie_engine.get_similar_movies(movie_id=movie_id, top_k=top_k)
    return {
        "movie": movie["title"],
        "movie_id": movie["id"],
        "recommendations": recommendations
    }

@router.get("/music/{song_id}", response_model=MusicRecommendationResponse)
def get_music_recommendations(
    song_id: str,
    top_k: int = Query(5, ge=1, le=20)
):
    """Returns audio-feature and genre-based music recommendations using NearestNeighbors."""
    track = music_engine.get_track_by_id(song_id)
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track with ID '{song_id}' not found."
        )

    recommendations = music_engine.get_similar_tracks(track_id=song_id, top_k=top_k)
    return {
        "song": track["title"],
        "song_id": track["id"],
        "artist": track["artist"],
        "recommendations": recommendations
    }

@router.get("/personalized", response_model=PersonalizedRecommendationResponse)
def get_personalized_recommendations(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(8, ge=1, le=20)
):
    """
    Computes hybrid personalized recommendations blending content similarity,
    user preferences, catalog popularity, explicit feedback, and intra-list diversity.
    """
    user_id = current_user.id if current_user else 1

    # 1. Hybrid personalized movies & music
    rec_movies = hybrid_engine.get_personalized_movies(user_id=user_id, db=db, limit=limit)
    rec_music = hybrid_engine.get_personalized_music(user_id=user_id, db=db, limit=limit)

    # 2. Mood recommendations
    user_mood = "Happy"
    if current_user and current_user.preferences and current_user.preferences.preferred_mood:
        user_mood = current_user.preferences.preferred_mood

    mood_res = mood_engine.get_mood_recommendations(mood=user_mood, limit=6)

    # 3. "Because you liked..." recommendations
    because_movies = []
    if current_user and current_user.preferences and current_user.preferences.favorite_movies:
        first_fav = current_user.preferences.favorite_movies[0]
        fav_m = movie_engine.get_movie_by_title(first_fav)
        if fav_m:
            because_movies = movie_engine.get_similar_movies(fav_m["id"], top_k=6)
    if not because_movies and rec_movies:
        because_movies = movie_engine.get_similar_movies(rec_movies[0]["id"], top_k=6)

    because_music = []
    if rec_music:
        because_music = music_engine.get_similar_tracks(rec_music[0]["id"], top_k=6)

    # 4. Cross-domain sample
    cross_sample = None
    if rec_movies:
        cross_sample = cross_domain_engine.recommend_music_for_movie(rec_movies[0]["id"], limit=6)

    return {
        "user_id": user_id,
        "recommended_movies": rec_movies,
        "recommended_music": rec_music,
        "mood_movies": mood_res["movies"],
        "mood_music": mood_res["music"],
        "because_you_liked_movies": because_movies,
        "because_you_liked_music": because_music,
        "cross_domain": cross_sample
    }

@router.get("/mood", response_model=MoodRecommendationResponse)
def get_mood_recommendations(
    mood: str = Query("Happy", description="Mood (Happy, Sad, Workout, Relax, Romantic, Focus)"),
    limit: int = Query(8, ge=1, le=20)
):
    """Returns mood-aligned cinema and soundtrack selections without hardcoding."""
    return mood_engine.get_mood_recommendations(mood=mood, limit=limit)

@router.get("/cross-domain", response_model=CrossDomainRecommendationResponse)
def get_cross_domain_recommendations(
    movie_id: Optional[int] = Query(None, description="Source movie ID to find corresponding tracks"),
    song_id: Optional[str] = Query(None, description="Source track ID to find corresponding cinema"),
    limit: int = Query(6, ge=1, le=20)
):
    """
    Connects Movies and Music:
    - Given a Movie -> recommends soundtrack and thematic music tracks.
    - Given a Song -> recommends cinematic films with matching aesthetic/tempo.
    """
    if movie_id:
        return cross_domain_engine.recommend_music_for_movie(movie_id=movie_id, limit=limit)
    elif song_id:
        return cross_domain_engine.recommend_movies_for_music(track_id=song_id, limit=limit)
    else:
        # Default to top movie
        all_m = movie_engine.get_popular_movies(limit=1)
        default_id = all_m[0]["id"] if all_m else 19995
        return cross_domain_engine.recommend_music_for_movie(movie_id=default_id, limit=limit)
