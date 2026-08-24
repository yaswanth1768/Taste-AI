"""
Music Recommendation Model Training for TasteAI.
Combines standardized audio features with genre/artist TF-IDF embeddings
using NearestNeighbors (Cosine metric) and persists artifacts to ml/models/.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from ml.preprocessing.music_preprocessing import preprocess_music
except ImportError:
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from ml.preprocessing.music_preprocessing import preprocess_music

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
DATASETS_DIR = os.path.join(BASE_DIR, "datasets", "music")

def train_music_model():
    os.makedirs(MODELS_DIR, exist_ok=True)
    music_csv = os.path.join(DATASETS_DIR, "dataset.csv")

    print("[1/4] Preprocessing Music Dataset with Dynamic Schema Inspection...")
    df, scaled_audio, scaler, audio_cols = preprocess_music(music_csv)
    print(f"Loaded {len(df)} tracks across {len(df['genre'].unique())} genres.")
    print(f"Audio Features: {audio_cols}")

    print("[2/4] Vectorizing Genre & Artist Metadata...")
    # Combine genre, artist, and title into metadata text representation
    metadata_text = df["genre"].fillna("") + " " + df["artist"].fillna("") + " " + df["album"].fillna("")
    tfidf = TfidfVectorizer(max_features=500, stop_words="english")
    tfidf_vectors = tfidf.fit_transform(metadata_text).toarray()

    print("[3/4] Building Combined Hybrid Audio + Content Feature Space...")
    # Weight audio features 60% and genre/artist text 40%
    audio_weight = 0.60
    text_weight = 0.40
    
    # Normalize scaled audio to [0, 1] range for harmonious blending with TF-IDF
    audio_min = scaled_audio.min(axis=0)
    audio_max = scaled_audio.max(axis=0)
    audio_range = np.where((audio_max - audio_min) == 0, 1, audio_max - audio_min)
    norm_audio = (scaled_audio - audio_min) / audio_range

    combined_features = np.hstack([norm_audio * audio_weight, tfidf_vectors * text_weight])

    # Fit high-performance NearestNeighbors model
    nn_model = NearestNeighbors(n_neighbors=25, metric="cosine", algorithm="brute")
    nn_model.fit(combined_features)

    # Compute similarity matrix or store index
    print("[4/4] Persisting Music Model Artifacts to ml/models/...")
    
    music_bundle = {
        "df": df,
        "features": combined_features,
        "audio_cols": audio_cols,
        "scaler": scaler,
        "tfidf": tfidf,
        "nn_model": nn_model
    }

    with open(os.path.join(MODELS_DIR, "music_model.pkl"), "wb") as f:
        pickle.dump(music_bundle, f)

    with open(os.path.join(MODELS_DIR, "music_scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)

    print("[SUCCESS] Music Model Trained & Persisted Successfully!")

    # Test recommendation
    test_track = df.iloc[0]["title"]
    print(f"\nVerification Recommendations for '{test_track}' by {df.iloc[0]['artist']}:")
    distances, indices = nn_model.kneighbors([combined_features[0]], n_neighbors=6)
    for rank, (dist, idx) in enumerate(zip(distances[0][1:], indices[0][1:]), 1):
        rec_track = df.iloc[idx]
        sim_score = 1.0 - dist
        print(f" {rank}. {rec_track['title']} - {rec_track['artist']} [{rec_track['genre']}] (Similarity: {sim_score:.3f})")

    return music_bundle

if __name__ == "__main__":
    train_music_model()
