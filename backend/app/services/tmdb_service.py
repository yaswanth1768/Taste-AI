"""
TMDB External API Service with Local Memory Caching & Resilient Fallbacks.
"""

import os
import requests
from typing import Dict, Any, Optional
from backend.app.core.config import settings

class TMDBService:
    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.base_url = "https://api.themoviedb.org/3"
        self.image_base_url = "https://image.tmdb.org/t/p/w500"
        self.backdrop_base_url = "https://image.tmdb.org/t/p/w1280"
        self._cache: Dict[int, Dict[str, Any]] = {}

    def get_movie_details(self, tmdb_id: int) -> Optional[Dict[str, Any]]:
        """Fetches poster, backdrop, overview and trailer with caching."""
        if tmdb_id in self._cache:
            return self._cache[tmdb_id]

        if not self.api_key:
            return None

        try:
            url = f"{self.base_url}/movie/{tmdb_id}?api_key={self.api_key}&append_to_response=videos,credits"
            resp = requests.get(url, timeout=4)
            if resp.status_code == 200:
                data = resp.json()
                poster_path = f"{self.image_base_url}{data.get('poster_path')}" if data.get('poster_path') else None
                backdrop_path = f"{self.backdrop_base_url}{data.get('backdrop_path')}" if data.get('backdrop_path') else None
                
                # Extract YouTube trailer
                trailer_key = None
                videos = data.get("videos", {}).get("results", [])
                for v in videos:
                    if v.get("site") == "YouTube" and v.get("type") == "Trailer":
                        trailer_key = v.get("key")
                        break

                enriched = {
                    "poster_path": poster_path,
                    "backdrop_path": backdrop_path,
                    "trailer_url": f"https://www.youtube.com/watch?v={trailer_key}" if trailer_key else None,
                    "tagline": data.get("tagline", ""),
                    "runtime": data.get("runtime", 120),
                    "vote_average": round(data.get("vote_average", 0.0), 1)
                }
                self._cache[tmdb_id] = enriched
                return enriched
        except Exception as e:
            print(f"[TMDBService WARNING] External API fetch failed: {e}")
        return None

tmdb_service = TMDBService()
