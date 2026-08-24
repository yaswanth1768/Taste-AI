"""
Movies Catalog & Details API Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.recommender.movie_engine import movie_engine
from backend.app.services.tmdb_service import tmdb_service
from backend.app.schemas.movie import MovieOut

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("", response_model=List[MovieOut])
def list_movies(
    genre: Optional[str] = Query(None, description="Filter by genre (e.g., Action, Sci-Fi)"),
    search: Optional[str] = Query(None, description="Search by title or director"),
    ott: Optional[str] = Query(None, description="Filter by OTT platform (e.g., Netflix, Prime Video, Disney+, Apple TV+, Max)"),
    limit: int = Query(24, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    """Retrieves list of movies with optional genre, OTT platform filter and keyword search."""
    movies = movie_engine.get_all_movies(genre=genre, search=search, ott=ott, limit=limit, skip=skip)
    return movies

@router.get("/genres/all", response_model=List[str])
def list_movie_genres():
    """Retrieves all unique movie genres available in the system."""
    return movie_engine.get_all_genres()

@router.get("/popular", response_model=List[MovieOut])
def get_popular_movies(limit: int = Query(12, ge=1, le=50)):
    """Retrieves top trending and popular movies."""
    return movie_engine.get_popular_movies(limit=limit)

@router.get("/{movie_id}", response_model=MovieOut)
def get_movie_details(movie_id: int):
    """Retrieves complete details for a single movie, enriched with live TMDB data when available."""
    movie = movie_engine.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {movie_id} not found in catalog."
        )

    # Enrich with live TMDB metadata if available
    enriched = tmdb_service.get_movie_details(movie_id)
    if enriched:
        for k, v in enriched.items():
            if v is not None:
                movie[k] = v

    return movie
