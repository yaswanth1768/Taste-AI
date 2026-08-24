"""
Music Preprocessing Pipeline for TasteAI Recommender System.
Dynamically inspects dataset columns, scales audio feature vectors,
and encodes genre/artist tags for hybrid audio-content similarity.
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler

def inspect_music_columns(df: pd.DataFrame) -> dict:
    """
    Dynamically maps available dataset columns to standard feature names.
    Supports varying Spotify schemas (e.g. track_name vs song_title, artist_name vs artists).
    """
    col_map = {}
    cols_lower = {col.lower(): col for col in df.columns}

    # ID mapping
    for candidate in ["track_id", "id", "song_id", "uri"]:
        if candidate in cols_lower:
            col_map["id"] = cols_lower[candidate]
            break

    # Title mapping
    for candidate in ["track_name", "title", "song_name", "song_title", "name"]:
        if candidate in cols_lower:
            col_map["title"] = cols_lower[candidate]
            break

    # Artist mapping
    for candidate in ["artist_name", "artists", "artist", "performer"]:
        if candidate in cols_lower:
            col_map["artist"] = cols_lower[candidate]
            break

    # Album mapping
    for candidate in ["album_name", "album", "release"]:
        if candidate in cols_lower:
            col_map["album"] = cols_lower[candidate]
            break

    # Genre mapping
    for candidate in ["genre", "track_genre", "genres", "playlist_genre", "top genre"]:
        if candidate in cols_lower:
            col_map["genre"] = cols_lower[candidate]
            break

    # Popularity mapping
    for candidate in ["popularity", "pop", "track_popularity"]:
        if candidate in cols_lower:
            col_map["popularity"] = cols_lower[candidate]
            break

    # Numerical Audio Features
    audio_features = [
        "danceability", "energy", "valence", "tempo", "acousticness",
        "instrumentalness", "loudness", "speechiness", "liveness", "duration_ms", "key", "mode"
    ]
    col_map["audio_features"] = [cols_lower[f] for f in audio_features if f in cols_lower]

    return col_map

def preprocess_music(music_csv_path: str):
    """
    Loads and standardizes music dataset.
    Returns:
      - standardized DataFrame
      - normalized audio features matrix
      - fitted StandardScaler
      - active audio feature column names
    """
    df = pd.read_csv(music_csv_path)
    col_map = inspect_music_columns(df)

    clean_df = pd.DataFrame()
    
    # ID
    if "id" in col_map:
        clean_df["id"] = df[col_map["id"]].astype(str)
    else:
        clean_df["id"] = [f"t_{i:05d}" for i in range(len(df))]

    # Title & Artist
    clean_df["title"] = df[col_map.get("title", df.columns[0])].fillna("Unknown Track").astype(str)
    clean_df["artist"] = df[col_map.get("artist", df.columns[1])].fillna("Unknown Artist").astype(str)
    clean_df["album"] = df[col_map.get("album", df.columns[2])].fillna("Unknown Album").astype(str) if "album" in col_map else "Single"
    clean_df["genre"] = df[col_map.get("genre", df.columns[3])].fillna("general").astype(str).str.lower()
    clean_df["popularity"] = pd.to_numeric(df[col_map["popularity"]], errors="coerce").fillna(50) if "popularity" in col_map else 50

    # Extract available audio features
    active_audio_cols = col_map.get("audio_features", [])
    if not active_audio_cols:
        # Fallback to default synthesized audio columns if none found
        synth_cols = ["danceability", "energy", "valence", "tempo", "acousticness", "instrumentalness", "loudness"]
        for sc in synth_cols:
            clean_df[sc] = 0.5
        active_audio_cols = synth_cols
    else:
        for feat in active_audio_cols:
            clean_df[feat] = pd.to_numeric(df[feat], errors="coerce").fillna(0.5)

    # Standardize numerical features using StandardScaler
    scaler = StandardScaler()
    scaled_audio = scaler.fit_transform(clean_df[active_audio_cols])

    return clean_df, scaled_audio, scaler, active_audio_cols

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    music_csv = os.path.join(base_dir, "datasets", "music", "dataset.csv")
    df, scaled, scaler, feats = preprocess_music(music_csv)
    print(f"Preprocessed {len(df)} tracks.")
    print("Identified Audio Features:", feats)
    print("Scaled feature shape:", scaled.shape)
