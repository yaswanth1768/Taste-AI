"""
Cross-Domain Recommendation Engine for TasteAI.
Connects Cinema Themes and Musical Aesthetics (Movie <-> Music Bridge).
"""

from typing import Dict, Any, List, Optional
from backend.app.recommender.movie_engine import movie_engine
from backend.app.recommender.music_engine import music_engine

# Cross-domain thematic mapping dictionary
THEME_BRIDGE = {
    "science fiction": {
        "music_genres": ["soundtrack", "ambient", "edm", "lo-fi"],
        "music_artists": ["Hans Zimmer", "M83", "Daft Punk", "Max Richter"],
        "theme_name": "Cosmic & Atmospheric Soundscapes"
    },
    "action": {
        "music_genres": ["rock", "metal", "edm", "hip-hop"],
        "music_artists": ["Imagine Dragons", "Nirvana", "Linkin Park", "Eminem", "AC/DC"],
        "theme_name": "High-Octane Energy & Heavy Rhythms"
    },
    "romance": {
        "music_genres": ["pop", "r-b", "jazz", "acoustic"],
        "music_artists": ["Celine Dion", "Ed Sheeran", "Taylor Swift", "Frank Sinatra", "Daniel Caesar"],
        "theme_name": "Intimate Melodies & Romantic Ballads"
    },
    "drama": {
        "music_genres": ["classical", "soundtrack", "indie", "jazz"],
        "music_artists": ["Hans Zimmer", "Claude Debussy", "Ludovico Einaudi", "Bon Iver", "Miles Davis"],
        "theme_name": "Emotional & Orchestral Depth"
    },
    "crime": {
        "music_genres": ["hip-hop", "jazz", "rock"],
        "music_artists": ["Kendrick Lamar", "Drake", "Miles Davis", "The Rolling Stones"],
        "theme_name": "Urban Beats & Gritty Neo-Noir Rhythms"
    },
    "comedy": {
        "music_genres": ["pop", "dance", "chill"],
        "music_artists": ["Bruno Mars", "Dua Lipa", "Harry Styles"],
        "theme_name": "Feel-Good & Playful Vibes"
    },
    "animation": {
        "music_genres": ["soundtrack", "pop", "lo-fi"],
        "music_artists": ["ChilledCow", "Kupla", "Hans Zimmer"],
        "theme_name": "Whimsical & Wonder-Filled Melodies"
    },
    "thriller": {
        "music_genres": ["soundtrack", "ambient", "rock"],
        "music_artists": ["Hans Zimmer", "Ludwig Göransson", "Radiohead"],
        "theme_name": "Tense & Suspenseful Soundtracks"
    }
}

class CrossDomainEngine:
    def recommend_music_for_movie(self, movie_id: int, limit: int = 6) -> Dict[str, Any]:
        """Translates movie narrative and genre signals into matching musical tracks."""
        movie = movie_engine.get_movie_by_id(movie_id)
        if not movie:
            return {
                "query_type": "movie",
                "query_item": "Unknown Movie",
                "recommended_tracks": [],
                "cross_domain_theme": "General Selection",
                "explanation": "Movie not found in catalog."
            }

        movie_title = movie["title"]
        movie_genres = [g.lower() for g in movie.get("genres", [])]
        movie_director = movie.get("director", "")

        # Find best matching theme in THEME_BRIDGE
        matched_theme = None
        for mg in movie_genres:
            for theme_key, theme_val in THEME_BRIDGE.items():
                if theme_key in mg:
                    matched_theme = theme_val
                    break
            if matched_theme:
                break

        if not matched_theme:
            matched_theme = THEME_BRIDGE["science fiction"]

        target_music_genres = matched_theme["music_genres"]
        target_artists = [a.lower() for a in matched_theme["music_artists"]]

        all_tracks = music_engine.get_all_tracks(limit=300)
        scored_tracks = []

        for track in all_tracks:
            t_genre = track.get("genre", "").lower()
            t_artist = track.get("artist", "").lower()
            score = 0.5

            if any(tg in t_genre for tg in target_music_genres):
                score += 0.3
            if any(ta in t_artist for ta in target_artists):
                score += 0.2

            if score > 0.5:
                rec_t = dict(track)
                rec_t["similarity"] = round(score, 3)
                rec_t["explanation"] = f"Curated for fans of '{movie_title}' ({matched_theme['theme_name']})."
                scored_tracks.append(rec_t)

        scored_tracks.sort(key=lambda x: x["similarity"], reverse=True)

        return {
            "query_type": "movie",
            "query_item": movie_title,
            "recommended_tracks": scored_tracks[:limit] if scored_tracks else all_tracks[:limit],
            "cross_domain_theme": matched_theme["theme_name"],
            "explanation": f"Discovered musical vibes corresponding to the themes and atmosphere of '{movie_title}'."
        }

    def recommend_movies_for_music(self, track_id: str, limit: int = 6) -> Dict[str, Any]:
        """Translates music track genre and audio features into matching cinema."""
        track = music_engine.get_track_by_id(track_id)
        if not track:
            return {
                "query_type": "music",
                "query_item": "Unknown Song",
                "recommended_movies": [],
                "cross_domain_theme": "General Selection",
                "explanation": "Track not found."
            }

        track_title = track["title"]
        track_genre = track.get("genre", "pop").lower()
        
        # Match track genre to movie genres
        matched_movie_genres = ["Action", "Adventure"]
        for movie_genre, theme in THEME_BRIDGE.items():
            if any(mg in track_genre for mg in theme["music_genres"]):
                matched_movie_genres.append(movie_genre.capitalize())

        all_movies = movie_engine.get_all_movies(limit=150)
        scored_movies = []
        for m in all_movies:
            m_genres = [g.lower() for g in m.get("genres", [])]
            overlap = [g for g in m_genres if any(t.lower() in g for t in matched_movie_genres)]
            if overlap:
                rec_m = dict(m)
                rec_m["similarity"] = round(0.70 + 0.05 * len(overlap), 3)
                rec_m["explanation"] = f"Visual aesthetic matches the rhythm and tone of '{track_title}' ({track.get('artist', '')})."
                scored_movies.append(rec_m)

        scored_movies.sort(key=lambda x: x["similarity"], reverse=True)

        return {
            "query_type": "music",
            "query_item": track_title,
            "recommended_movies": scored_movies[:limit] if scored_movies else all_movies[:limit],
            "cross_domain_theme": f"{track_genre.upper()} Cinematic Vibe",
            "explanation": f"Cinema with aesthetic and emotional resonance to '{track_title}'."
        }

cross_domain_engine = CrossDomainEngine()
