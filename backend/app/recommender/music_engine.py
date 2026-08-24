"""
Content & Audio Feature-Based Music Recommendation Engine for TasteAI.
Loads NearestNeighbors and Scaler artifacts once in memory for ultra-fast queries,
enriched with high-resolution album cover artwork posters and streaming platforms.
"""

import os
import urllib.parse
import pickle
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from backend.app.core.config import settings

# Curated High-Definition Album Covers for Popular Artists / Tracks
MUSIC_POSTER_REGISTRY = {
    "the weeknd": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    "taylor swift": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    "hans zimmer": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80",
    "daft punk": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
    "drake": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    "imagine dragons": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80",
    "kendrick lamar": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    "avicii": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    "billie eilish": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    "queen": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80",
    "post malone": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
    "dua lipa": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80",
    "coldplay": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
    "ed sheeran": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
    "calvin harris": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80",
    "ludovico einaudi": "https://images.unsplash.com/photo-1520523839898-507125ef538a?auto=format&fit=crop&w=600&q=80",
    "miles davis": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80",
    "claude debussy": "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80"
}

GENRE_MUSIC_POSTER_PALETTE = {
    "edm": [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
    ],
    "rock": [
        "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
    ],
    "classical": [
        "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1520523839898-507125ef538a?auto=format&fit=crop&w=600&q=80"
    ],
    "jazz": [
        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=600&q=80"
    ],
    "lo-fi": [
        "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80"
    ],
    "soundtrack": [
        "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"
    ],
    "hip-hop": [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80"
    ],
    "pop": [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80"
    ],
    "chill": [
        "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80"
    ],
    "indie": [
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80"
    ],
    "r-b": [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"
    ],
    "metal": [
        "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80"
    ]
}

MUSIC_STREAMING_METADATA = {
    "Spotify": {
        "name": "Spotify",
        "logo_url": "https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico",
        "search_base": "https://open.spotify.com/search/"
    },
    "Apple Music": {
        "name": "Apple Music",
        "logo_url": "https://music.apple.com/favicon.ico",
        "search_base": "https://music.apple.com/us/search?term="
    },
    "YouTube Music": {
        "name": "YouTube Music",
        "logo_url": "https://music.youtube.com/favicon.ico",
        "search_base": "https://music.youtube.com/search?q="
    },
    "Amazon Music": {
        "name": "Amazon Music",
        "logo_url": "https://m.media-amazon.com/images/G/01/digital/music/player/web/favicon.ico",
        "search_base": "https://music.amazon.com/search/"
    }
}

class MusicEngine:
    _instance = None

    def __init__(self):
        self.music_df: Optional[pd.DataFrame] = None
        self.features_matrix = None
        self.nn_model = None
        self.scaler = None
        self.tfidf = None
        self.audio_cols = []
        self.id_to_idx: Dict[str, int] = {}
        self.title_to_idx: Dict[str, int] = {}
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        model_pkl = os.path.join(settings.ML_MODELS_DIR, "music_model.pkl")
        if os.path.exists(model_pkl):
            try:
                with open(model_pkl, "rb") as f:
                    bundle = pickle.load(f)
                self.music_df = bundle["df"]
                self.features_matrix = bundle["features"]
                self.nn_model = bundle["nn_model"]
                self.scaler = bundle.get("scaler")
                self.tfidf = bundle.get("tfidf")
                self.audio_cols = bundle.get("audio_cols", [])

                for idx, row in self.music_df.iterrows():
                    t_id = str(row["id"])
                    t_title = str(row["title"]).strip().lower()
                    self.id_to_idx[t_id] = idx
                    self.title_to_idx[t_title] = idx
                print(f"[MusicEngine] Loaded {len(self.music_df)} tracks into memory.")
            except Exception as e:
                print(f"[MusicEngine ERROR] Failed loading music artifacts: {e}")
        else:
            print("[MusicEngine WARNING] Music model artifacts not found.")

    def get_all_tracks(self, genre: Optional[str] = None, search: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        if self.music_df is None:
            return []
        df = self.music_df.copy()

        if search:
            query = search.strip().lower()
            df = df[df["title"].str.lower().str.contains(query, na=False) |
                    df["artist"].str.lower().str.contains(query, na=False) |
                    df["album"].str.lower().str.contains(query, na=False)]

        if genre and genre.lower() != "all":
            g_clean = genre.strip().lower()
            df = df[df["genre"].str.lower().str.contains(g_clean, na=False)]

        df_slice = df.iloc[skip:skip + limit]
        return self._format_track_list(df_slice)

    def get_track_by_id(self, track_id: str) -> Optional[Dict[str, Any]]:
        if self.music_df is None or track_id not in self.id_to_idx:
            return None
        idx = self.id_to_idx[track_id]
        return self._format_track_dict(self.music_df.iloc[idx])

    def get_similar_tracks(self, track_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if self.music_df is None or self.nn_model is None or track_id not in self.id_to_idx:
            return []

        idx = self.id_to_idx[track_id]
        target_vector = self.features_matrix[idx].reshape(1, -1)
        distances, indices = self.nn_model.kneighbors(target_vector, n_neighbors=top_k + 1)

        source_track = self.music_df.iloc[idx]
        results = []
        for dist, t_idx in zip(distances[0][1:], indices[0][1:]):
            row = self.music_df.iloc[t_idx]
            sim = max(0.0, min(1.0, 1.0 - float(dist)))
            explanation = f"Matches audio energy ({row.get('energy', 0.5):.2f}) and {row.get('genre', 'music')} genre of {source_track['title']}"
            t_dict = self._format_track_dict(row)
            t_dict["similarity"] = round(sim, 3)
            t_dict["explanation"] = explanation
            results.append(t_dict)
        return results

    def get_popular_tracks(self, limit: int = 10) -> List[Dict[str, Any]]:
        if self.music_df is None:
            return []
        df_sorted = self.music_df.sort_values(by="popularity", ascending=False).head(limit)
        return self._format_track_list(df_sorted)

    def get_all_genres(self) -> List[str]:
        if self.music_df is None:
            return []
        return sorted(list(self.music_df["genre"].dropna().unique()))

    def filter_by_audio_features(self, min_energy: float = 0.0, max_energy: float = 1.0,
                                 min_valence: float = 0.0, max_valence: float = 1.0,
                                 min_danceability: float = 0.0, max_danceability: float = 1.0,
                                 limit: int = 20) -> List[Dict[str, Any]]:
        if self.music_df is None:
            return []
        df = self.music_df.copy()
        df = df[(df["energy"] >= min_energy) & (df["energy"] <= max_energy) &
                (df["valence"] >= min_valence) & (df["valence"] <= max_valence) &
                (df["danceability"] >= min_danceability) & (df["danceability"] <= max_danceability)]
        return self._format_track_list(df.head(limit))

    def _resolve_artwork_and_platforms(self, title: str, artist: str, genre: str) -> tuple:
        a_clean = artist.strip().lower()
        
        # 1. Check verified artist registry
        if a_clean in MUSIC_POSTER_REGISTRY:
            artwork = MUSIC_POSTER_REGISTRY[a_clean]
        else:
            palette = GENRE_MUSIC_POSTER_PALETTE.get(genre.lower(), GENRE_MUSIC_POSTER_PALETTE["pop"])
            h = sum(ord(c) for c in title + artist)
            artwork = palette[h % len(palette)]

        # Direct search links across top music streaming services
        q = urllib.parse.quote(f"{title} {artist}")
        platforms = [
            {
                "name": "Spotify",
                "logo_url": MUSIC_STREAMING_METADATA["Spotify"]["logo_url"],
                "type": "Subscription",
                "watch_url": f"{MUSIC_STREAMING_METADATA['Spotify']['search_base']}{q}"
            },
            {
                "name": "Apple Music",
                "logo_url": MUSIC_STREAMING_METADATA["Apple Music"]["logo_url"],
                "type": "Subscription",
                "watch_url": f"{MUSIC_STREAMING_METADATA['Apple Music']['search_base']}{q}"
            },
            {
                "name": "YouTube Music",
                "logo_url": MUSIC_STREAMING_METADATA["YouTube Music"]["logo_url"],
                "type": "Free / Subscription",
                "watch_url": f"{MUSIC_STREAMING_METADATA['YouTube Music']['search_base']}{q}"
            },
            {
                "name": "Amazon Music",
                "logo_url": MUSIC_STREAMING_METADATA["Amazon Music"]["logo_url"],
                "type": "Included with Prime",
                "watch_url": f"{MUSIC_STREAMING_METADATA['Amazon Music']['search_base']}{q}"
            }
        ]
        return artwork, platforms

    def _format_track_dict(self, row: pd.Series) -> Dict[str, Any]:
        t_id = str(row["id"])
        title = str(row["title"])
        artist = str(row["artist"])
        genre = str(row.get("genre", "pop")).lower()

        artwork, platforms = self._resolve_artwork_and_platforms(title, artist, genre)

        return {
            "id": t_id,
            "title": title,
            "artist": artist,
            "album": str(row.get("album", "Single")),
            "genre": genre,
            "popularity": round(float(row.get("popularity", 50.0)), 1),
            "duration_ms": int(row.get("duration_ms", 180000)),
            "artwork_url": artwork,
            "poster_path": artwork,
            "preview_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            "streaming_platforms": platforms,
            "audio_features": {
                "danceability": round(float(row.get("danceability", 0.5)), 3),
                "energy": round(float(row.get("energy", 0.5)), 3),
                "valence": round(float(row.get("valence", 0.5)), 3),
                "tempo": round(float(row.get("tempo", 120.0)), 1),
                "acousticness": round(float(row.get("acousticness", 0.5)), 3),
                "instrumentalness": round(float(row.get("instrumentalness", 0.0)), 3),
                "loudness": round(float(row.get("loudness", -8.0)), 1),
                "speechiness": round(float(row.get("speechiness", 0.05)), 4),
                "liveness": round(float(row.get("liveness", 0.1)), 3)
            }
        }

    def _format_track_list(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        return [self._format_track_dict(row) for _, row in df.iterrows()]

music_engine = MusicEngine.get_instance()
