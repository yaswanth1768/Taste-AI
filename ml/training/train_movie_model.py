"""
Movie Recommendation Model Training for TasteAI.
Builds CountVectorizer representations and Cosine Similarity matrix,
persisting the model artifacts to ml/models/.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Support direct execution or module import
try:
    from ml.preprocessing.movie_preprocessing import preprocess_movies
except ImportError:
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from ml.preprocessing.movie_preprocessing import preprocess_movies

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
DATASETS_DIR = os.path.join(BASE_DIR, "datasets", "movies")

def train_movie_model(max_features=5000):
    os.makedirs(MODELS_DIR, exist_ok=True)
    movies_csv = os.path.join(DATASETS_DIR, "tmdb_5000_movies.csv")
    credits_csv = os.path.join(DATASETS_DIR, "tmdb_5000_credits.csv")

    print("[1/4] Preprocessing Movie & Credits Datasets...")
    df = preprocess_movies(movies_csv, credits_csv)
    print(f"Total Preprocessed Movies: {len(df)}")

    print("[2/4] Vectorizing Tags with CountVectorizer...")
    cv = CountVectorizer(max_features=max_features, stop_words="english")
    vectors = cv.fit_transform(df["tags"]).toarray()
    print(f"Vector Matrix Shape: {vectors.shape}")

    print("[3/4] Calculating Cosine Similarity Matrix...")
    similarity = cosine_similarity(vectors)

    print("[4/4] Saving Artifacts to ml/models/...")
    # Clean dataframe columns for serialization and API consumption
    export_cols = [c for c in ["id", "title", "overview", "genre_list", "keyword_list", "cast_list", "director", "tags", "popularity", "vote_average", "vote_count", "release_date", "tagline"] if c in df.columns]
    movies_export = df[export_cols].copy().reset_index(drop=True)

    with open(os.path.join(MODELS_DIR, "movies.pkl"), "wb") as f:
        pickle.dump(movies_export, f)

    with open(os.path.join(MODELS_DIR, "similarity.pkl"), "wb") as f:
        pickle.dump(similarity, f)

    with open(os.path.join(MODELS_DIR, "movie_vectorizer.pkl"), "wb") as f:
        pickle.dump(cv, f)

    print("[SUCCESS] Movie Model Trained & Persisted Successfully!")
    
    # Verification test
    test_movie = "Avatar"
    if test_movie in movies_export["title"].values:
        idx = movies_export[movies_export["title"] == test_movie].index[0]
        distances = sorted(list(enumerate(similarity[idx])), reverse=True, key=lambda x: x[1])
        print(f"\nVerification Recommendations for '{test_movie}':")
        for i in distances[1:6]:
            rec_title = movies_export.iloc[i[0]]["title"]
            score = i[1]
            print(f" - {rec_title} (Similarity: {score:.3f})")

    return movies_export, similarity, cv

if __name__ == "__main__":
    train_movie_model()
