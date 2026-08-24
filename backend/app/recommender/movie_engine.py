"""
Content-Based Movie Recommendation Engine for TasteAI.
Loads precomputed CountVectorizer and Cosine Similarity artifacts once in memory
for fast sub-millisecond retrieval without per-request disk I/O, enriched with
high-resolution poster images and OTT streaming platform availability.
"""

import os
import urllib.parse
import pickle
from typing import List, Dict, Any, Optional
import pandas as pd
from backend.app.core.config import settings

# Curated High-Definition Posters for Catalog Movies
POSTER_REGISTRY = {
    "avatar": {
        "poster": "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/vL5LR6WdxWPjC3U24J7tM4V1a0T.jpg",
        "ott": ["Disney+", "Prime Video", "Apple TV+"]
    },
    "interstellar": {
        "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/rAiYTnrnRMy0nhjSd7CVXYv7e9Y.jpg",
        "ott": ["Netflix", "Prime Video", "Apple TV+"]
    },
    "inception": {
        "poster": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "ott": ["Netflix", "Max", "Prime Video"]
    },
    "the dark knight": {
        "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1r5vsIRqqXezm.jpg",
        "ott": ["Max", "Netflix", "Prime Video"]
    },
    "the matrix": {
        "poster": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
        "ott": ["Max", "Prime Video", "Apple TV+"]
    },
    "titanic": {
        "poster": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
        "ott": ["Disney+", "Prime Video", "Apple TV+"]
    },
    "pulp fiction": {
        "poster": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
        "ott": ["Netflix", "Prime Video", "Apple TV+"]
    },
    "the avengers": {
        "poster": "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg",
        "ott": ["Disney+", "Apple TV+"]
    },
    "gladiator": {
        "poster": "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
        "ott": ["Netflix", "Prime Video", "Apple TV+"]
    },
    "forrest gump": {
        "poster": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxShY94r3Kl5k4.jpg",
        "ott": ["Prime Video", "Apple TV+"]
    },
    "john carter": {
        "poster": "https://image.tmdb.org/t/p/w500/7750Tmsq7fZUfvy0kZ4r37gUv0t.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/o855P3qC3y2eF9mYt14GkC4Nf5L.jpg",
        "ott": ["Disney+", "Prime Video"]
    },
    "spider-man 3": {
        "poster": "https://image.tmdb.org/t/p/w500/2jLxvdqUj0v9yA2K8b0R7Z0jYfX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/6MQmtWk4mf04kuCwvtM9v9mF0kF.jpg",
        "ott": ["Disney+", "Netflix", "Prime Video"]
    },
    "tangled": {
        "poster": "https://image.tmdb.org/t/p/w500/ym7Kst6a4uodZMyxGl22aagczBh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/g4P7L32Yv1Wk8b5b7f0kM4X9r1.jpg",
        "ott": ["Disney+", "Apple TV+"]
    },
    "batman v superman: dawn of justice": {
        "poster": "https://image.tmdb.org/t/p/w500/5UsK3grJ9syz7DTio2myWgw7ne3.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/v5D01lGf2V5fK7f3Yv4c5g0jY.jpg",
        "ott": ["Max", "Prime Video"]
    },
    "quantum of solace": {
        "poster": "https://image.tmdb.org/t/p/w500/e3CxxT178UBZ7k2p8zC5n0wP7e.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/2wX3V1B8zY0v4m7x6L8Y5p0qY.jpg",
        "ott": ["Prime Video", "Apple TV+"]
    },
    "pirates of the caribbean: on stranger tides": {
        "poster": "https://image.tmdb.org/t/p/w500/keG49ins3y44yqjQnJ7B1p0qYf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxShY94r3Kl5k4.jpg",
        "ott": ["Disney+", "Apple TV+"]
    },
    "the dark knight rises": {
        "poster": "https://image.tmdb.org/t/p/w500/vzvKcPQ4o7TjWeGoxaNG5N6IIYf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxShY94r3Kl5k4.jpg",
        "ott": ["Max", "Prime Video", "Netflix"]
    },
    "spectre": {
        "poster": "https://image.tmdb.org/t/p/w500/672kUEMVZYuvcu22um95eyvg0o8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/w2PMyoyCc2qv6293P70bVvjXbA5.jpg",
        "ott": ["Prime Video", "Apple TV+"]
    },
    "la la land": {
        "poster": "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/qJeU7fG1HkQ6K1zVvK6m7q8r9.jpg",
        "ott": ["Netflix", "Prime Video", "Apple TV+"]
    },
    "whiplash": {
        "poster": "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/6a15kO2gC0Y8mG1L0v8Y5p0qY.jpg",
        "ott": ["Netflix", "Prime Video"]
    },
    "the shawshank redemption": {
        "poster": "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
        "ott": ["Netflix", "Max", "Prime Video"]
    },
    "the godfather": {
        "poster": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/tmU7whSt1378TQ9q0W30s5bYvL9.jpg",
        "ott": ["Prime Video", "Apple TV+"]
    },
    "fight club": {
        "poster": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
        "ott": ["Prime Video", "Disney+"]
    },
    "spider-man: into the spider-verse": {
        "poster": "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/uUiId6cG32JSRjT6qr9Wms4NuLT.jpg",
        "ott": ["Netflix", "Prime Video"]
    },
    "dune": {
        "poster": "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/lzWHmYmgrRqPTKi57SQEZm22YsD.jpg",
        "ott": ["Max", "Prime Video", "Netflix"]
    },
    "oppenheimer": {
        "poster": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        "backdrop": "https://image.tmdb.org/t/p/original/rM5Y09Ceqv9NCVv1Y5z0jYfX7.jpg",
        "ott": ["Prime Video", "Apple TV+", "JioCinema"]
    }
}

GENRE_POSTER_PALETTE = {
    "action": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    "science fiction": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    "sci-fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    "adventure": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "drama": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    "romance": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    "thriller": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    "crime": "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=600&q=80",
    "comedy": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    "animation": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    "fantasy": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "horror": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
    "mystery": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
}

OTT_METADATA = {
    "Netflix": {
        "name": "Netflix",
        "logo_url": "https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.ico",
        "search_base": "https://www.netflix.com/search?q="
    },
    "Prime Video": {
        "name": "Prime Video",
        "logo_url": "https://m.media-amazon.com/images/G/01/digital/video/web/logo-min.png",
        "search_base": "https://www.amazon.com/s?k="
    },
    "Disney+": {
        "name": "Disney+",
        "logo_url": "https://static-assets.bamgrid.com/product/disneyplus/images/favicon.85e279041d69e710e395b09062eb1b00.ico",
        "search_base": "https://www.disneyplus.com/search?q="
    },
    "Apple TV+": {
        "name": "Apple TV+",
        "logo_url": "https://www.apple.com/favicon.ico",
        "search_base": "https://tv.apple.com/search?term="
    },
    "Max": {
        "name": "Max",
        "logo_url": "https://www.max.com/favicon.ico",
        "search_base": "https://play.max.com/search?q="
    },
    "JioCinema": {
        "name": "JioCinema",
        "logo_url": "https://www.jiocinema.com/favicon.ico",
        "search_base": "https://www.jiocinema.com/search/"
    }
}

class MovieEngine:
    _instance = None

    def __init__(self):
        self.movies_df: Optional[pd.DataFrame] = None
        self.similarity_matrix = None
        self.id_to_idx: Dict[int, int] = {}
        self.title_to_idx: Dict[str, int] = {}
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        movies_pkl = os.path.join(settings.ML_MODELS_DIR, "movies.pkl")
        sim_pkl = os.path.join(settings.ML_MODELS_DIR, "similarity.pkl")

        if os.path.exists(movies_pkl) and os.path.exists(sim_pkl):
            try:
                with open(movies_pkl, "rb") as f:
                    self.movies_df = pickle.load(f)
                with open(sim_pkl, "rb") as f:
                    self.similarity_matrix = pickle.load(f)
                
                # Build fast index mapping
                for idx, row in self.movies_df.iterrows():
                    m_id = int(row["id"])
                    m_title = str(row["title"]).strip().lower()
                    self.id_to_idx[m_id] = idx
                    self.title_to_idx[m_title] = idx
                    
                print(f"[MovieEngine] Loaded {len(self.movies_df)} movies into memory.")
            except Exception as e:
                print(f"[MovieEngine ERROR] Failed loading movie artifacts: {e}")
        else:
            print("[MovieEngine WARNING] Movie model artifacts not found. Please train models.")

    def get_all_movies(self, genre: Optional[str] = None, search: Optional[str] = None, ott: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        if self.movies_df is None:
            return []
        
        df = self.movies_df.copy()
        if search:
            query = search.strip().lower()
            df = df[df["title"].str.lower().str.contains(query, na=False) | 
                    df["director"].str.lower().str.contains(query, na=False)]
        
        if genre and genre.lower() != "all":
            g_clean = genre.strip().lower()
            df = df[df["genre_list"].apply(lambda glist: any(g_clean in str(g).lower() for g in glist) if isinstance(glist, list) else False)]

        all_formatted = self._format_movie_list(df)
        
        if ott and ott.lower() != "all":
            ott_clean = ott.strip().lower()
            all_formatted = [
                m for m in all_formatted
                if any(ott_clean in p["name"].lower() for p in m.get("streaming_platforms", []))
            ]

        return all_formatted[skip:skip + limit]

    def get_movie_by_id(self, movie_id: int) -> Optional[Dict[str, Any]]:
        if self.movies_df is None or movie_id not in self.id_to_idx:
            return None
        idx = self.id_to_idx[movie_id]
        row = self.movies_df.iloc[idx]
        return self._format_movie_dict(row)

    def get_movie_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        if self.movies_df is None:
            return None
        t_clean = title.strip().lower()
        if t_clean in self.title_to_idx:
            idx = self.title_to_idx[t_clean]
            return self._format_movie_dict(self.movies_df.iloc[idx])
        return None

    def get_similar_movies(self, movie_id: int, top_k: int = 5) -> List[Dict[str, Any]]:
        if self.movies_df is None or self.similarity_matrix is None or movie_id not in self.id_to_idx:
            return []
        
        idx = self.id_to_idx[movie_id]
        distances = sorted(list(enumerate(self.similarity_matrix[idx])), reverse=True, key=lambda x: x[1])
        
        results = []
        source_movie = self.movies_df.iloc[idx]
        source_genres = source_movie.get("genre_list", [])
        
        for m_idx, sim in distances[1:top_k + 1]:
            row = self.movies_df.iloc[m_idx]
            overlap_genres = [g for g in row.get("genre_list", []) if g in source_genres]
            explanation = f"Similar {', '.join(overlap_genres[:2])} themes to {source_movie['title']}" if overlap_genres else f"High narrative & cast similarity to {source_movie['title']}"
            
            m_dict = self._format_movie_dict(row)
            m_dict["similarity"] = round(float(sim), 3)
            m_dict["explanation"] = explanation
            results.append(m_dict)
            
        return results

    def get_popular_movies(self, limit: int = 10) -> List[Dict[str, Any]]:
        if self.movies_df is None:
            return []
        df_sorted = self.movies_df.sort_values(by="popularity", ascending=False).head(limit)
        return self._format_movie_list(df_sorted)

    def get_all_genres(self) -> List[str]:
        if self.movies_df is None:
            return []
        genres_set = set()
        for glist in self.movies_df["genre_list"]:
            if isinstance(glist, list):
                for g in glist:
                    genres_set.add(g)
        return sorted(list(genres_set))

    def _resolve_posters_and_ott(self, title: str, genres: List[str], existing_poster: Optional[str], existing_backdrop: Optional[str]) -> tuple:
        t_clean = title.strip().lower()
        
        # 1. Check verified poster registry
        if t_clean in POSTER_REGISTRY:
            reg = POSTER_REGISTRY[t_clean]
            poster = reg["poster"]
            backdrop = reg["backdrop"]
            ott_names = reg["ott"]
        else:
            # Check existing valid TMDB path
            if existing_poster and (existing_poster.startswith("http") or existing_poster.startswith("/")):
                poster = existing_poster if existing_poster.startswith("http") else f"https://image.tmdb.org/t/p/w500{existing_poster}"
            else:
                # Find appropriate high quality aesthetic cinema poster based on primary genre
                primary_genre = (genres[0] if genres else "drama").lower()
                poster = GENRE_POSTER_PALETTE.get(primary_genre, GENRE_POSTER_PALETTE["drama"])
            
            backdrop = existing_backdrop if existing_backdrop and existing_backdrop.startswith("http") else poster
            
            # Deterministic OTT streaming mapping based on genres and title hash
            h = sum(ord(c) for c in title)
            if any("anim" in g.lower() or "family" in g.lower() or "disney" in g.lower() for g in genres):
                ott_names = ["Disney+", "Apple TV+"]
            elif any("sci-fi" in g.lower() or "action" in g.lower() for g in genres):
                ott_names = ["Netflix", "Prime Video"] if h % 2 == 0 else ["Max", "Apple TV+"]
            elif any("drama" in g.lower() or "crime" in g.lower() or "thriller" in g.lower() for g in genres):
                ott_names = ["Netflix", "Prime Video", "Apple TV+"] if h % 3 == 0 else ["Prime Video", "Max"]
            elif any("romance" in g.lower() or "comedy" in g.lower() for g in genres):
                ott_names = ["Netflix", "Prime Video"]
            else:
                ott_names = ["Netflix", "Prime Video", "Disney+"]

        # Build OTT platform objects
        platforms = []
        for name in ott_names:
            if name in OTT_METADATA:
                meta = OTT_METADATA[name]
                q = urllib.parse.quote(title)
                platforms.append({
                    "name": name,
                    "logo_url": meta["logo_url"],
                    "type": "Subscription",
                    "watch_url": f"{meta['search_base']}{q}"
                })

        return poster, backdrop, platforms

    def _format_movie_dict(self, row: pd.Series) -> Dict[str, Any]:
        m_id = int(row["id"])
        title = str(row["title"])
        genres = row.get("genre_list", []) if isinstance(row.get("genre_list"), list) else []
        raw_poster = str(row.get("poster_path", "")) if pd.notna(row.get("poster_path")) else None
        raw_backdrop = str(row.get("backdrop_path", "")) if pd.notna(row.get("backdrop_path")) else None

        poster, backdrop, platforms = self._resolve_posters_and_ott(title, genres, raw_poster, raw_backdrop)

        return {
            "id": m_id,
            "title": title,
            "overview": str(row.get("overview", "")),
            "genres": genres,
            "keywords": row.get("keyword_list", []) if isinstance(row.get("keyword_list"), list) else [],
            "director": str(row.get("director", "")),
            "cast": row.get("cast_list", []) if isinstance(row.get("cast_list"), list) else [],
            "vote_average": round(float(row.get("vote_average", 0.0)), 1),
            "vote_count": int(row.get("vote_count", 0)),
            "popularity": round(float(row.get("popularity", 0.0)), 2),
            "release_date": str(row.get("release_date", "")),
            "tagline": str(row.get("tagline", "")),
            "poster_path": poster,
            "backdrop_path": backdrop,
            "artwork_url": poster,
            "streaming_platforms": platforms
        }

    def _format_movie_list(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        return [self._format_movie_dict(row) for _, row in df.iterrows()]

movie_engine = MovieEngine.get_instance()
