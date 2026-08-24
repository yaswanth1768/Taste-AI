"""
Automated Turnkey Setup Script for TasteAI Recommender System.
Prepares datasets, trains ML models, and initializes Database.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from scripts.train_all import run_pipeline
from backend.app.database.session import engine
from backend.app.models import Base

def setup():
    print("==========================================================")
    print("               TASTEAI ENVIRONMENT SETUP                  ")
    print("==========================================================")

    # 1. Execute ML Pipeline
    run_pipeline()

    # 2. Initialize Database Schema
    print("\n[DB SETUP] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("[DB SETUP] Database tables created successfully!")

    print("\n==========================================================")
    print("  Setup Complete! You can now launch backend & frontend:  ")
    print("  Backend: uvicorn backend.app.main:app --reload          ")
    print("  Frontend: cd frontend && npm run dev                    ")
    print("==========================================================")

if __name__ == "__main__":
    setup()
