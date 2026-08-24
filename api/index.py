"""
Vercel Serverless Entrypoint for TasteAI FastAPI Backend.
"""

import os
import sys

# Ensure workspace root is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.main import app
