"""
Hybrid Recommendation Weights Validator & Offline Optimizer.
Validates multi-signal weighting consistency for the TasteAI platform.
"""

import os
import json
from backend.app.core.config import settings

def validate_hybrid_configuration():
    print("=== TasteAI Hybrid Recommender Configuration ===")
    weights = settings.HYBRID_WEIGHTS
    total_weight = sum(weights.values())
    
    print(f"Configured Signal Weights:")
    for signal, weight in weights.items():
        print(f" - {signal.replace('_', ' ').title():<25}: {weight * 100:.1f}%")
        
    print(f"\nSum of Weights: {total_weight:.2f}")
    if abs(total_weight - 1.0) < 1e-4:
        print("[SUCCESS] Hybrid weights sum to 100% (valid probability distribution).")
    else:
        print(f"[WARNING] Hybrid weights sum to {total_weight:.2f}, should equal 1.0.")

if __name__ == "__main__":
    validate_hybrid_configuration()
