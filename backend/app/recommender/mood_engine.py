"""
Mood-Based Recommendation Engine for TasteAI.
Maps emotional states (Happy, Sad, Workout, Relax, Romantic, Focus) to dataset audio feature vectors
and cinema genre/narrative vectors without hardcoded item lists.
"""

from typing import Dict, Any, List
from backend.app.recommender.movie_engine import movie_engine
from backend.app.recommender.music_engine import music_engine
from backend.app.recommender.explainer import explain_movie_recommendation, explain_music_recommendation

MOOD_PROFILES = {
    "happy": {
        "movie_genres": ["Comedy", "Adventure", "Animation", "Family"],
        "music_genres": ["pop", "edm", "dance", "rock"],
        "audio_ranges": {"min_valence": 0.55, "min_energy": 0.50, "min_danceability": 0.50},
        "description": "Upbeat anthems and uplifting cinema to elevate your spirits."
    },
    "sad": {
        "movie_genres": ["Drama", "Romance"],
        "music_genres": ["classical", "indie", "acoustic", "lo-fi"],
        "audio_ranges": {"max_valence": 0.40, "max_energy": 0.45, "min_acousticness": 0.50},
        "description": "Soulful melodies and deep narrative cinema for reflection."
    },
    "workout": {
        "movie_genres": ["Action", "Thriller", "Adventure", "Crime"],
        "music_genres": ["edm", "hip-hop", "rock", "metal"],
        "audio_ranges": {"min_energy": 0.70, "min_danceability": 0.60, "min_tempo": 115.0},
        "description": "High-octane cinema and driving bpm beats to fuel peak performance."
    },
    "energetic": {
        "movie_genres": ["Action", "Science Fiction", "Adventure"],
        "music_genres": ["edm", "rock", "hip-hop"],
        "audio_ranges": {"min_energy": 0.70, "min_danceability": 0.60},
        "description": "Electrifying tracks and action-packed storytelling."
    },
    "relax": {
        "movie_genres": ["Animation", "Fantasy", "Comedy", "Drama"],
        "music_genres": ["lo-fi", "chill", "ambient", "jazz"],
        "audio_ranges": {"max_energy": 0.50, "min_acousticness": 0.55, "max_tempo": 105.0},
        "description": "Gentle acoustic tones and relaxing cinema to unwind."
    },
    "relaxed": {
        "movie_genres": ["Animation", "Fantasy", "Comedy", "Drama"],
        "music_genres": ["lo-fi", "chill", "ambient", "jazz"],
        "audio_ranges": {"max_energy": 0.50, "min_acousticness": 0.55, "max_tempo": 105.0},
        "description": "Gentle acoustic tones and relaxing cinema to unwind."
    },
    "romantic": {
        "movie_genres": ["Romance", "Drama", "Comedy"],
        "music_genres": ["r-b", "pop", "jazz", "acoustic"],
        "audio_ranges": {"min_valence": 0.40, "min_acousticness": 0.30},
        "description": "Heartwarming romantic movies and intimate melodies."
    },
    "focus": {
        "movie_genres": ["Science Fiction", "Mystery", "Drama", "Thriller"],
        "music_genres": ["lo-fi", "classical", "ambient", "soundtrack"],
        "audio_ranges": {"max_energy": 0.55, "min_instrumentalness": 0.40},
        "description": "Atmospheric soundtracks and cerebral films to enter deep flow."
    }
}

class MoodEngine:
    def get_mood_recommendations(self, mood: str, limit: int = 8) -> Dict[str, Any]:
        m_key = mood.strip().lower()
        profile = MOOD_PROFILES.get(m_key, MOOD_PROFILES["happy"])

        # 1. Fetch matching movies
        all_movies = movie_engine.get_all_movies(limit=150)
        target_movie_genres = [g.lower() for g in profile["movie_genres"]]
        
        matching_movies = []
        for m in all_movies:
            m_genres = [g.lower() for g in m.get("genres", [])]
            overlap = [g for g in m_genres if any(tg in g for tg in target_movie_genres)]
            if overlap:
                item = dict(m)
                item["similarity"] = round(0.70 + 0.05 * len(overlap) + 0.02 * (m.get("vote_average", 7.0) / 10), 3)
                item["explanation"] = f"Matches your '{mood.capitalize()}' mood ({' + '.join(overlap[:2])})."
                matching_movies.append(item)

        matching_movies.sort(key=lambda x: x["similarity"], reverse=True)
        recommended_movies = matching_movies[:limit] if matching_movies else all_movies[:limit]

        # 2. Fetch matching music tracks based on audio ranges and genres
        all_tracks = music_engine.get_all_tracks(limit=300)
        target_music_genres = [g.lower() for g in profile["music_genres"]]
        ranges = profile.get("audio_ranges", {})

        matching_music = []
        for t in all_tracks:
            t_genre = t.get("genre", "").lower()
            audio = t.get("audio_features", {})
            
            # Check genre overlap
            genre_match = any(tg in t_genre for tg in target_music_genres)
            
            # Check audio range constraints
            audio_match = True
            if "min_energy" in ranges and audio.get("energy", 0.5) < ranges["min_energy"]:
                audio_match = False
            if "max_energy" in ranges and audio.get("energy", 0.5) > ranges["max_energy"]:
                audio_match = False
            if "min_valence" in ranges and audio.get("valence", 0.5) < ranges["min_valence"]:
                audio_match = False
            if "max_valence" in ranges and audio.get("valence", 0.5) > ranges["max_valence"]:
                audio_match = False

            if genre_match or audio_match:
                item = dict(t)
                item["similarity"] = round(0.75 + (0.15 if genre_match and audio_match else 0.05), 3)
                item["explanation"] = explain_music_recommendation(target_track=t, mood=mood)
                matching_music.append(item)

        matching_music.sort(key=lambda x: x["similarity"], reverse=True)
        recommended_music = matching_music[:limit] if matching_music else all_tracks[:limit]

        return {
            "mood": mood.capitalize(),
            "movies": recommended_movies,
            "music": recommended_music,
            "explanation": profile["description"]
        }

mood_engine = MoodEngine()
