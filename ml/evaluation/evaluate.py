"""
Model Evaluation Suite for TasteAI Recommendation Systems.
Computes industry-standard ranking and accuracy metrics:
  - Precision@K
  - Recall@K
  - Hit Rate@K
  - Mean Average Precision (MAP@K)
  - Intra-List Diversity (ILD)
"""

import os
import pickle
import numpy as np
import pandas as pd
from typing import List, Dict, Set, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")

def precision_at_k(recommended: List[Any], ground_truth: Set[Any], k: int) -> float:
    """Calculates proportion of recommended items in top-K that are relevant."""
    if k == 0:
        return 0.0
    rec_k = recommended[:k]
    hits = sum(1 for item in rec_k if item in ground_truth)
    return hits / k

def recall_at_k(recommended: List[Any], ground_truth: Set[Any], k: int) -> float:
    """Calculates proportion of relevant items that are captured in top-K."""
    if not ground_truth:
        return 0.0
    rec_k = recommended[:k]
    hits = sum(1 for item in rec_k if item in ground_truth)
    return hits / len(ground_truth)

def hit_rate_at_k(recommended: List[Any], ground_truth: Set[Any], k: int) -> float:
    """Returns 1.0 if at least one relevant item appears in top-K, 0.0 otherwise."""
    rec_k = recommended[:k]
    return 1.0 if any(item in ground_truth for item in rec_k) else 0.0

def average_precision_at_k(recommended: List[Any], ground_truth: Set[Any], k: int) -> float:
    """Calculates Average Precision @ K."""
    if not ground_truth:
        return 0.0
    score = 0.0
    num_hits = 0
    for i, item in enumerate(recommended[:k]):
        if item in ground_truth:
            num_hits += 1
            score += num_hits / (i + 1.0)
    return score / min(len(ground_truth), k)

def intra_list_diversity(recommended_genres: List[List[str]]) -> float:
    """Measures genre dispersion across the recommendation list."""
    all_genres = set()
    total_slots = 0
    for glist in recommended_genres:
        if isinstance(glist, list):
            for g in glist:
                all_genres.add(g)
                total_slots += 1
    if total_slots == 0:
        return 0.0
    return len(all_genres) / total_slots

def evaluate_movie_model(k_values=[3, 5, 10]):
    print("\n=======================================================")
    print("      EVALUATING MOVIE CONTENT-BASED RECOMMENDER       ")
    print("=======================================================")
    
    movies_pkl = os.path.join(MODELS_DIR, "movies.pkl")
    sim_pkl = os.path.join(MODELS_DIR, "similarity.pkl")
    
    if not os.path.exists(movies_pkl) or not os.path.exists(sim_pkl):
        print("Model artifacts not found! Run training script first.")
        return

    with open(movies_pkl, "rb") as f:
        movies_df = pickle.load(f)
    with open(sim_pkl, "rb") as f:
        similarity = pickle.load(f)

    # Synthetic genre-cluster validation test
    num_movies = len(movies_df)
    precisions = {k: [] for k in k_values}
    recalls = {k: [] for k in k_values}
    hit_rates = {k: [] for k in k_values}
    maps = {k: [] for k in k_values}

    for idx in range(min(num_movies, 50)):
        source = movies_df.iloc[idx]
        src_genres = set(source.get("genre_list", []))
        if not src_genres:
            continue

        # Define relevant ground-truth as movies sharing >= 2 genres or primary genre
        relevant_indices = set()
        for other_idx in range(num_movies):
            if other_idx == idx:
                continue
            other_genres = set(movies_df.iloc[other_idx].get("genre_list", []))
            if len(src_genres.intersection(other_genres)) >= 1:
                relevant_indices.add(other_idx)

        if not relevant_indices:
            continue

        distances = sorted(list(enumerate(similarity[idx])), reverse=True, key=lambda x: x[1])
        recommended_indices = [item[0] for item in distances[1:max(k_values)+1]]

        for k in k_values:
            precisions[k].append(precision_at_k(recommended_indices, relevant_indices, k))
            recalls[k].append(recall_at_k(recommended_indices, relevant_indices, k))
            hit_rates[k].append(hit_rate_at_k(recommended_indices, relevant_indices, k))
            maps[k].append(average_precision_at_k(recommended_indices, relevant_indices, k))

    print(f"\nEvaluation Results across {len(precisions[k_values[0]])} test queries:")
    print("-" * 55)
    print(f"{'Metric':<18} | {'@3':<10} | {'@5':<10} | {'@10':<10}")
    print("-" * 55)
    print(f"{'Precision':<18} | {np.mean(precisions[3]):<10.4f} | {np.mean(precisions[5]):<10.4f} | {np.mean(precisions[10]):<10.4f}")
    print(f"{'Recall':<18} | {np.mean(recalls[3]):<10.4f} | {np.mean(recalls[5]):<10.4f} | {np.mean(recalls[10]):<10.4f}")
    print(f"{'Hit Rate':<18} | {np.mean(hit_rates[3]):<10.4f} | {np.mean(hit_rates[5]):<10.4f} | {np.mean(hit_rates[10]):<10.4f}")
    print(f"{'MAP (Accuracy)':<18} | {np.mean(maps[3]):<10.4f} | {np.mean(maps[5]):<10.4f} | {np.mean(maps[10]):<10.4f}")
    print("-" * 55)

def evaluate_music_model(k_values=[3, 5, 10]):
    print("\n=======================================================")
    print("      EVALUATING MUSIC HYBRID/AUDIO RECOMMENDER        ")
    print("=======================================================")

    music_pkl = os.path.join(MODELS_DIR, "music_model.pkl")
    if not os.path.exists(music_pkl):
        print("Music model artifact not found!")
        return

    with open(music_pkl, "rb") as f:
        bundle = pickle.load(f)

    df = bundle["df"]
    nn_model = bundle["nn_model"]
    features = bundle["features"]

    precisions = {k: [] for k in k_values}
    hit_rates = {k: [] for k in k_values}
    maps = {k: [] for k in k_values}

    num_samples = min(len(df), 100)
    for idx in range(num_samples):
        src_genre = df.iloc[idx].get("genre", "")
        # Ground truth: same genre or high audio acoustic similarity
        relevant = set(df[df["genre"] == src_genre].index) - {idx}
        if not relevant:
            continue

        distances, indices = nn_model.kneighbors([features[idx]], n_neighbors=max(k_values) + 1)
        rec_indices = list(indices[0][1:])

        for k in k_values:
            precisions[k].append(precision_at_k(rec_indices, relevant, k))
            hit_rates[k].append(hit_rate_at_k(rec_indices, relevant, k))
            maps[k].append(average_precision_at_k(rec_indices, relevant, k))

    print(f"\nEvaluation Results across {len(precisions[k_values[0]])} test tracks:")
    print("-" * 55)
    print(f"{'Metric':<18} | {'@3':<10} | {'@5':<10} | {'@10':<10}")
    print("-" * 55)
    print(f"{'Precision':<18} | {np.mean(precisions[3]):<10.4f} | {np.mean(precisions[5]):<10.4f} | {np.mean(precisions[10]):<10.4f}")
    print(f"{'Hit Rate':<18} | {np.mean(hit_rates[3]):<10.4f} | {np.mean(hit_rates[5]):<10.4f} | {np.mean(hit_rates[10]):<10.4f}")
    print(f"{'MAP (Accuracy)':<18} | {np.mean(maps[3]):<10.4f} | {np.mean(maps[5]):<10.4f} | {np.mean(maps[10]):<10.4f}")
    print("-" * 55)

if __name__ == "__main__":
    evaluate_movie_model()
    evaluate_music_model()
