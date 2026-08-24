"""
Movie Preprocessing Pipeline for TasteAI Recommender System.
Processes TMDB 5000 movies & credits dataset into clean vectorized tags with Porter stemming.
"""

import ast
import json
import re
import pandas as pd
import nltk
from nltk.stem.porter import PorterStemmer

# Initialize stemmer
ps = PorterStemmer()

def parse_json_safely(obj):
    """Safely parses JSON strings or python literal evaluations."""
    if pd.isna(obj):
        return []
    if isinstance(obj, list):
        return obj
    try:
        return json.loads(obj)
    except Exception:
        try:
            return ast.literal_eval(obj)
        except Exception:
            return []

def extract_names(obj, limit=None):
    """Extracts 'name' values from list of dictionaries."""
    items = parse_json_safely(obj)
    names = []
    for item in items:
        if isinstance(item, dict) and "name" in item:
            names.append(item["name"])
            if limit and len(names) >= limit:
                break
    return names

def extract_director(obj):
    """Extracts the director's name from crew list."""
    items = parse_json_safely(obj)
    for item in items:
        if isinstance(item, dict) and item.get("job") == "Director":
            return [item.get("name")]
    return []

def clean_entity_spaces(elements):
    """Removes spaces within entity names to avoid token collision (e.g., 'Sam Worthington' -> 'samworthington')."""
    if not isinstance(elements, list):
        return []
    return [str(e).replace(" ", "").lower() for e in elements if e]

def stem_text(text):
    """Applies Porter Stemmer to tokens in text."""
    if not isinstance(text, str):
        return ""
    words = []
    for word in text.split():
        words.append(ps.stem(word))
    return " ".join(words)

def preprocess_movies(movies_csv_path: str, credits_csv_path: str) -> pd.DataFrame:
    """
    Loads, joins, and preprocesses movies and credits datasets.
    Returns DataFrame containing: id, title, overview, genres, keywords, cast, crew, tags, vote_average, vote_count, popularity, release_date.
    """
    movies_df = pd.read_csv(movies_csv_path)
    credits_df = pd.read_csv(credits_csv_path)

    # Handle join key variations ('id' vs 'movie_id')
    if "movie_id" in credits_df.columns and "id" in movies_df.columns:
        merged_df = movies_df.merge(credits_df, left_on="id", right_on="movie_id", suffixes=("", "_cred"))
    elif "title" in movies_df.columns and "title" in credits_df.columns:
        merged_df = movies_df.merge(credits_df, on="title")
    else:
        merged_df = movies_df

    # Extract required fields
    cols_to_keep = ["id", "title", "overview", "genres", "keywords", "cast", "crew"]
    for col in ["popularity", "vote_average", "vote_count", "release_date", "tagline"]:
        if col in merged_df.columns and col not in cols_to_keep:
            cols_to_keep.append(col)

    df = merged_df[[c for c in cols_to_keep if c in merged_df.columns]].copy()
    df.dropna(subset=["title"], inplace=True)
    df["overview"] = df["overview"].fillna("")

    # Extract clean list features
    raw_genres = df["genres"].apply(lambda x: extract_names(x))
    raw_keywords = df["keywords"].apply(lambda x: extract_names(x))
    raw_cast = df["cast"].apply(lambda x: extract_names(x, limit=3))
    raw_director = df["crew"].apply(lambda x: extract_director(x))

    # Keep human-readable versions for API details
    df["genre_list"] = raw_genres
    df["keyword_list"] = raw_keywords
    df["cast_list"] = raw_cast
    df["director"] = raw_director.apply(lambda x: x[0] if len(x) > 0 else "")

    # Clean versions for NLP tag generation
    clean_genres = raw_genres.apply(clean_entity_spaces)
    clean_keywords = raw_keywords.apply(clean_entity_spaces)
    clean_cast = raw_cast.apply(clean_entity_spaces)
    clean_director = raw_director.apply(clean_entity_spaces)
    clean_overview = df["overview"].apply(lambda x: str(x).lower().split())

    # Build combined tags list
    df["tags_list"] = clean_overview + clean_genres + clean_keywords + clean_cast + clean_director
    df["tags"] = df["tags_list"].apply(lambda x: " ".join(x))

    # Apply stemming and lowercase
    df["tags"] = df["tags"].apply(lambda x: x.lower())
    df["tags"] = df["tags"].apply(stem_text)

    # Standardize movie ID
    if "id" not in df.columns and "movie_id" in df.columns:
        df["id"] = df["movie_id"]

    return df

if __name__ == "__main__":
    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    mov_path = os.path.join(base_dir, "datasets", "movies", "tmdb_5000_movies.csv")
    cred_path = os.path.join(base_dir, "datasets", "movies", "tmdb_5000_credits.csv")
    processed = preprocess_movies(mov_path, cred_path)
    print(f"Processed {len(processed)} movies.")
    print("Sample tags for first movie:", processed.iloc[0]["title"], "->", processed.iloc[0]["tags"][:120])
