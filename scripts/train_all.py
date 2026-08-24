"""
Master Training Pipeline for TasteAI.
Executes dataset ingestion, movie model training, music model training, and full evaluation.
"""

import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from scripts.download_datasets import build_datasets
from ml.preprocessing.imdb_genres_importer import load_and_merge_imdb_genres
from ml.training.train_movie_model import train_movie_model
from ml.training.train_music_model import train_music_model
from ml.training.train_hybrid_model import validate_hybrid_configuration
from ml.evaluation.evaluate import evaluate_movie_model, evaluate_music_model

def run_pipeline():
    print("==================================================================")
    print("           TASTEAI COMPLETE ML PIPELINE EXECUTION                ")
    print("==================================================================")

    print("\n[STEP 1/5] Building Base Movie & Music Datasets...")
    build_datasets()

    print("\n[STEP 2/5] Ingesting 'jquigl/imdb-genres' Dataset...")
    load_and_merge_imdb_genres(limit=500)

    print("\n[STEP 3/5] Training Movie Content-Based Recommendation Model...")
    train_movie_model()

    print("\n[STEP 4/5] Training Music Audio + Content Hybrid Model...")
    train_music_model()

    print("\n[STEP 5/5] Validating Hybrid Configuration & Running Model Evaluation...")
    validate_hybrid_configuration()
    evaluate_movie_model()
    evaluate_music_model()

    print("\n==================================================================")
    print("   [SUCCESS] ALL ML MODELS TRAINED & PERSISTED TO ml/models/!     ")
    print("==================================================================")

if __name__ == "__main__":
    run_pipeline()
