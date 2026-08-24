"""
Tests for Authentication, User Registration, and Preferences.
"""

import uuid

def test_user_registration_and_login(client):
    unique_id = uuid.uuid4().hex[:8]
    email = f"user_{unique_id}@example.com"
    password = "MyPassword123!"

    # 1. Register
    reg_res = client.post("/api/auth/register", json={
        "name": "Jane Doe",
        "email": email,
        "password": password
    })
    assert reg_res.status_code == 201
    token_data = reg_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == email

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 3. Get Me
    token = login_res.json()["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Jane Doe"

def test_duplicate_registration_rejected(client):
    email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"
    
    # First registration should succeed
    res1 = client.post("/api/auth/register", json={
        "name": "First User",
        "email": email,
        "password": password
    })
    assert res1.status_code == 201

    # Second registration with same email must fail with 400
    res2 = client.post("/api/auth/register", json={
        "name": "Second User",
        "email": email,
        "password": password
    })
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()

def test_update_user_preferences(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    update_data = {
        "favorite_movie_genres": ["Sci-Fi", "Thriller"],
        "favorite_music_genres": ["edm", "classical"],
        "favorite_movies": ["Interstellar", "Inception"],
        "favorite_artists": ["Hans Zimmer", "Daft Punk"],
        "preferred_mood": "Focus",
        "onboarding_completed": True
    }
    res = client.put("/api/users/preferences", json=update_data, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["favorite_movie_genres"] == ["Sci-Fi", "Thriller"]
    assert data["preferred_mood"] == "Focus"
    assert data["onboarding_completed"] is True
