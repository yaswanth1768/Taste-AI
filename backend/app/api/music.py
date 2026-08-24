"""
Music Tracks Catalog & Audio Features API Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.recommender.music_engine import music_engine
from backend.app.schemas.music import MusicOut

router = APIRouter(prefix="/music", tags=["Music"])

@router.get("", response_model=List[MusicOut])
def list_music(
    genre: Optional[str] = Query(None, description="Filter by genre (e.g., Pop, EDM, Rock)"),
    search: Optional[str] = Query(None, description="Search by title, artist, or album"),
    limit: int = Query(24, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    """Retrieves list of songs with optional genre filter and keyword search."""
    return music_engine.get_all_tracks(genre=genre, search=search, limit=limit, skip=skip)

@router.get("/genres/all", response_model=List[str])
def list_music_genres():
    """Retrieves all music genres available in the dataset."""
    return music_engine.get_all_genres()

@router.get("/popular", response_model=List[MusicOut])
def get_popular_music(limit: int = Query(12, ge=1, le=50)):
    """Retrieves top trending music tracks."""
    return music_engine.get_popular_tracks(limit=limit)

@router.get("/filter/audio", response_model=List[MusicOut])
def filter_music_by_audio(
    min_energy: float = Query(0.0, ge=0.0, le=1.0),
    max_energy: float = Query(1.0, ge=0.0, le=1.0),
    min_valence: float = Query(0.0, ge=0.0, le=1.0),
    max_valence: float = Query(1.0, ge=0.0, le=1.0),
    min_danceability: float = Query(0.0, ge=0.0, le=1.0),
    max_danceability: float = Query(1.0, ge=0.0, le=1.0),
    limit: int = Query(20, ge=1, le=50)
):
    """Filters tracks by dynamic acoustic attribute thresholds (Energy, Valence, Danceability)."""
    return music_engine.filter_by_audio_features(
        min_energy=min_energy, max_energy=max_energy,
        min_valence=min_valence, max_valence=max_valence,
        min_danceability=min_danceability, max_danceability=max_danceability,
        limit=limit
    )

@router.get("/{song_id}", response_model=MusicOut)
def get_track_details(song_id: str):
    """Retrieves complete details for a single track with audio feature breakdown."""
    track = music_engine.get_track_by_id(song_id)
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Music track with ID '{song_id}' not found in catalog."
        )
    return track
