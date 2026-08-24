"""
Database Engine & Session Management for TasteAI.
Supports PostgreSQL with transparent SQLite fallback for frictionless local development.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

# Configure SQLite check_same_thread if SQLite is used
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """FastAPI Dependency for obtaining request-scoped DB sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
