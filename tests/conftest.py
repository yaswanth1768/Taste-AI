"""
Pytest Test Fixtures and Test Client Configuration for TasteAI.
"""

import pytest
import os
import sys
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.database.base import Base
from backend.app.database.session import get_db

TEST_DATABASE_URL = "sqlite:///./test_tasteai.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_tasteai.db"):
        try:
            os.remove("./test_tasteai.db")
        except Exception:
            pass

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_token(client):
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"
    res = client.post("/api/auth/register", json={
        "name": "Auth User",
        "email": email,
        "password": password
    })
    assert res.status_code == 201
    return res.json()["access_token"]
