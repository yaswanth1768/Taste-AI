"""
Hybrid Recommendation Engine for TasteAI.
Computes multi-factor personalized discovery scores combining:
  1. Content/Audio Similarity (40%)
  2. User Profile Preferences (25%)
  3. Catalog Popularity (15%)
  4. Explicit User Feedback History (10%)
  5. Diversity / Exploration Bonus (10%)
"""

from typing import List, Dict, Any, Optional
import numpy as np
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.recommender.movie_engine import movie_engine
from backend.app.recommender.music_engine import music_engine
from backend.app.recommender.explainer import explain_movie_recommendation, explain_music_recommendation
from backend.app.models.user import User, UserPreference
from backend.app.models.interaction import UserInteraction, Favorite

class HybridEngine:
    def __init__(self):
        self.weights = settings.HYBRID_WEIGHTS

    def get_personalized_movies(self, user_id: int, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """Calculates 5-factor hybrid recommendations for movies."""
        user_pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        interactions = db.query(UserInteraction).filter(UserInteraction.user_id == user_id, UserInteraction.item_type == "movie").all()
        favorites = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.item_type == "movie").all()

        liked_ids = {int(i.item_id) for i in interactions if i.action in ["like", "favorite"] and str(i.item_id).isdigit()}
        disliked_ids = {int(i.item_id) for i in interactions if i.action in ["dislike", "skip"] and str(i.item_id).isdigit()}
        for fav in favorites:
            if str(fav.item_id).isdigit():
                liked_ids.add(int(fav.item_id))

        user_genres = user_pref.favorite_movie_genres if user_pref and user_pref.favorite_movie_genres else []
        favorite_movies_input = user_pref.favorite_movies if user_pref and user_pref.favorite_movies else []

        all_movies = movie_engine.get_all_movies(limit=200)
        if not all_movies:
            return []

        scored_candidates = []
        
        # Max popularity for normalization
        max_pop = max([m.get("popularity", 1.0) for m in all_movies]) or 1.0

        for movie in all_movies:
            m_id = movie["id"]
            if m_id in disliked_ids:
                continue  # Filter out disliked items

            # 1. Content Similarity Signal (similarity to liked/onboarded movies)
            content_sim = 0.0
            best_source_movie = None
            if liked_ids:
                for src_id in liked_ids:
                    similar = movie_engine.get_similar_movies(src_id, top_k=5)
                    for sim_item in similar:
                        if sim_item["id"] == m_id and sim_item["similarity"] > content_sim:
                            content_sim = sim_item["similarity"]
                            best_source_movie = movie_engine.get_movie_by_id(src_id)
            elif favorite_movies_input:
                for fav_name in favorite_movies_input:
                    src_m = movie_engine.get_movie_by_title(fav_name)
                    if src_m:
                        similar = movie_engine.get_similar_movies(src_m["id"], top_k=5)
                        for sim_item in similar:
                            if sim_item["id"] == m_id and sim_item["similarity"] > content_sim:
                                content_sim = sim_item["similarity"]
                                best_source_movie = src_m

            # 2. User Preference Score (Genre alignment)
            movie_genres = movie.get("genres", [])
            pref_score = 0.0
            if user_genres:
                matched = [g for g in movie_genres if any(ug.lower() in g.lower() for ug in user_genres)]
                pref_score = min(1.0, len(matched) / max(1, len(user_genres)))

            # 3. Popularity Score
            pop_score = min(1.0, movie.get("popularity", 0.0) / max_pop)

            # 4. Feedback Score
            feedback_score = 0.8 if m_id in liked_ids else 0.5

            # 5. Diversity / Exploration Score
            diversity_score = 0.7 if any(g not in user_genres for g in movie_genres) else 0.3

            # Calculate Weighted Final Hybrid Score
            w = self.weights
            final_score = (
                w.get("content_similarity", 0.40) * content_sim +
                w.get("user_preference", 0.25) * pref_score +
                w.get("popularity", 0.15) * pop_score +
                w.get("feedback", 0.10) * feedback_score +
                w.get("diversity", 0.10) * diversity_score
            )

            # Cold start fallback if user has no prior interaction
            if not liked_ids and not user_genres:
                final_score = 0.6 * pop_score + 0.4 * (movie.get("vote_average", 7.0) / 10.0)

            explanation = explain_movie_recommendation(
                target_movie=movie,
                source_movie=best_source_movie,
                user_genres=user_genres
            )

            rec_item = dict(movie)
            rec_item["similarity"] = round(float(final_score), 3)
            rec_item["explanation"] = explanation
            scored_candidates.append(rec_item)

        # Sort by final score descending
        scored_candidates.sort(key=lambda x: x["similarity"], reverse=True)
        
        # Apply diversity balancing: ensure genre variety across top results
        return self._diversify_results(scored_candidates, limit=limit, genre_key="genres")

    def get_personalized_music(self, user_id: int, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """Calculates 5-factor hybrid recommendations for music."""
        user_pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        interactions = db.query(UserInteraction).filter(UserInteraction.user_id == user_id, UserInteraction.item_type == "music").all()
        favorites = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.item_type == "music").all()

        liked_ids = {i.item_id for i in interactions if i.action in ["like", "favorite"]}
        disliked_ids = {i.item_id for i in interactions if i.action in ["dislike", "skip"]}
        for fav in favorites:
            liked_ids.add(fav.item_id)

        user_genres = user_pref.favorite_music_genres if user_pref and user_pref.favorite_music_genres else []
        favorite_artists = user_pref.favorite_artists if user_pref and user_pref.favorite_artists else []

        all_tracks = music_engine.get_all_tracks(limit=300)
        if not all_tracks:
            return []

        scored_candidates = []
        max_pop = max([t.get("popularity", 1.0) for t in all_tracks]) or 1.0

        for track in all_tracks:
            t_id = track["id"]
            if t_id in disliked_ids:
                continue

            # 1. Content/Audio Similarity Signal
            content_sim = 0.0
            best_source_track = None
            if liked_ids:
                for src_id in liked_ids:
                    similar = music_engine.get_similar_tracks(src_id, top_k=5)
                    for sim_item in similar:
                        if sim_item["id"] == t_id and sim_item["similarity"] > content_sim:
                            content_sim = sim_item["similarity"]
                            best_source_track = music_engine.get_track_by_id(src_id)

            # 2. User Preference Score
            track_genre = track.get("genre", "").lower()
            track_artist = track.get("artist", "").lower()
            pref_score = 0.0
            if any(ug.lower() in track_genre for ug in user_genres):
                pref_score += 0.6
            if any(fa.lower() in track_artist for fa in favorite_artists):
                pref_score += 0.4
            pref_score = min(1.0, pref_score)

            # 3. Popularity Score
            pop_score = min(1.0, track.get("popularity", 50.0) / max_pop)

            # 4. Feedback Score
            feedback_score = 0.8 if t_id in liked_ids else 0.5

            # 5. Diversity Score
            diversity_score = 0.7 if track_genre not in [g.lower() for g in user_genres] else 0.3

            # Calculate Weighted Final Hybrid Score
            w = self.weights
            final_score = (
                w.get("content_similarity", 0.40) * content_sim +
                w.get("user_preference", 0.25) * pref_score +
                w.get("popularity", 0.15) * pop_score +
                w.get("feedback", 0.10) * feedback_score +
                w.get("diversity", 0.10) * diversity_score
            )

            # Cold start fallback
            if not liked_ids and not user_genres:
                final_score = 0.7 * pop_score + 0.3 * (track.get("audio_features", {}).get("energy", 0.5))

            explanation = explain_music_recommendation(
                target_track=track,
                source_track=best_source_track,
                user_genres=user_genres
            )

            rec_item = dict(track)
            rec_item["similarity"] = round(float(final_score), 3)
            rec_item["explanation"] = explanation
            scored_candidates.append(rec_item)

        scored_candidates.sort(key=lambda x: x["similarity"], reverse=True)
        return self._diversify_results(scored_candidates, limit=limit, genre_key="genre")

    def _diversify_results(self, items: List[Dict[str, Any]], limit: int, genre_key: str) -> List[Dict[str, Any]]:
        """Ensures balanced intra-list diversity (e.g. max 3 items of the exact same genre in top 5)."""
        selected = []
        genre_counts: Dict[str, int] = {}

        for item in items:
            raw_genre = item.get(genre_key, "")
            main_genre = raw_genre[0] if isinstance(raw_genre, list) and raw_genre else str(raw_genre)
            count = genre_counts.get(main_genre, 0)
            
            if count < 3 or len(selected) >= (limit - 2):
                selected.append(item)
                genre_counts[main_genre] = count + 1
                if len(selected) >= limit:
                    break

        if len(selected) < limit and items:
            for item in items:
                if item not in selected:
                    selected.append(item)
                    if len(selected) >= limit:
                        break

        return selected

hybrid_engine = HybridEngine()
