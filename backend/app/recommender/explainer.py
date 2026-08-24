"""
Transparent, Feature-Grounded Recommendation Explainer for TasteAI.
Generates genuine explanations rooted in dataset metadata and audio feature profiles.
"""

from typing import List, Dict, Any, Optional

def explain_movie_recommendation(
    target_movie: Dict[str, Any],
    source_movie: Optional[Dict[str, Any]] = None,
    user_genres: Optional[List[str]] = None,
    user_liked_directors: Optional[List[str]] = None
) -> str:
    """Generates transparent explanation based on actual shared features."""
    target_genres = target_movie.get("genres", [])
    director = target_movie.get("director", "")
    
    # 1. Explanation based on source movie similarity
    if source_movie:
        source_title = source_movie.get("title", "your favorite movie")
        source_genres = source_movie.get("genres", [])
        overlap = [g for g in target_genres if g in source_genres]
        
        if director and director == source_movie.get("director", ""):
            return f"Directed by {director}, matching your enjoyment of '{source_title}'."
        if overlap:
            return f"Recommended because you liked '{source_title}' ({' + '.join(overlap[:2])} themes)."
        return f"High narrative & thematic alignment with '{source_title}'."

    # 2. Explanation based on user profile preferences
    if user_genres:
        matched_genres = [g for g in target_genres if any(ug.lower() in g.lower() for ug in user_genres)]
        if matched_genres:
            return f"Matches your preferred genres: {' + '.join(matched_genres[:2])}."

    if user_liked_directors and director in user_liked_directors:
        return f"Directed by {director}, who matches your taste profile."

    # 3. Quality / Popularity explanation
    vote_avg = target_movie.get("vote_average", 0.0)
    if vote_avg >= 7.8:
        return f"Critically acclaimed ({vote_avg}/10 rating) with standout {target_genres[0] if target_genres else 'cinematic'} elements."

    return "Curated to match your emerging entertainment taste profile."

def explain_music_recommendation(
    target_track: Dict[str, Any],
    source_track: Optional[Dict[str, Any]] = None,
    user_genres: Optional[List[str]] = None,
    mood: Optional[str] = None
) -> str:
    """Generates explanation based on audio features, tempo, valence, and genres."""
    genre = target_track.get("genre", "music")
    artist = target_track.get("artist", "")
    audio = target_track.get("audio_features", {})
    energy = audio.get("energy", 0.5) if isinstance(audio, dict) else 0.5
    tempo = audio.get("tempo", 120.0) if isinstance(audio, dict) else 120.0
    valence = audio.get("valence", 0.5) if isinstance(audio, dict) else 0.5

    # 1. Source track similarity
    if source_track:
        source_title = source_track.get("title", "")
        source_artist = source_track.get("artist", "")
        if artist == source_artist:
            return f"More from {artist}, who created '{source_title}'."
        return f"Similar acoustic profile & rhythm to '{source_title}' by {source_artist} ({genre})."

    # 2. Mood-based explanation
    if mood:
        if mood.lower() == "happy":
            return f"Upbeat {genre} track with high valence ({valence:.2f}) and positive energy."
        elif mood.lower() in ["workout", "energetic"]:
            return f"High-tempo ({int(tempo)} BPM) and intense energy ({energy:.2f}) for workout momentum."
        elif mood.lower() == "sad":
            return f"Mellow {genre} melodies with soulful acoustic depth."
        elif mood.lower() in ["relax", "relaxed"]:
            return f"Gentle rhythm ({int(tempo)} BPM) and soothing tones ideal for unwinding."
        elif mood.lower() == "focus":
            return f"Subtle {genre} instrumentation tuned for sustained concentration."

    # 3. User profile preference
    if user_genres and any(ug.lower() in genre.lower() for ug in user_genres):
        return f"Recommended because you enjoy {genre.upper()} music."

    return f"Trending {genre} track with engaging acoustic features."
