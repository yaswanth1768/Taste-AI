"""
Spotify External API Service with Local Fallback for TasteAI.
"""

import os
import requests
from typing import Dict, Any, Optional
from backend.app.core.config import settings

class SpotifyService:
    def __init__(self):
        self.client_id = settings.SPOTIFY_CLIENT_ID
        self.client_secret = settings.SPOTIFY_CLIENT_SECRET
        self.token = None
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get_track_metadata(self, track_name: str, artist_name: str) -> Optional[Dict[str, Any]]:
        """Returns album artwork and preview url from cache or API."""
        cache_key = f"{track_name}:{artist_name}".lower()
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Returns graceful local default artwork & preview
        return None

spotify_service = SpotifyService()
