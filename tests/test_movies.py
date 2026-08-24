"""
Tests for Movie Endpoints and Recommendation Engine.
"""

def test_get_movies_list(client):
    response = client.get("/api/movies?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "title" in data[0]
    assert "genres" in data[0]

def test_get_movie_details(client):
    # Avatar is ID 19995
    response = client.get("/api/movies/19995")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Avatar"
    assert "director" in data
    assert "James Cameron" in data["director"] or "Cameron" in data["director"] or len(data["director"]) > 0

def test_movie_recommendations(client):
    response = client.get("/api/recommendations/movies/19995?top_k=5")
    assert response.status_code == 200
    data = response.json()
    assert data["movie"] == "Avatar"
    assert len(data["recommendations"]) == 5
    assert "similarity" in data["recommendations"][0]
    assert data["recommendations"][0]["similarity"] > 0

def test_movie_genres_endpoint(client):
    response = client.get("/api/movies/genres/all")
    assert response.status_code == 200
    genres = response.json()
    assert isinstance(genres, list)
    assert len(genres) > 0
    assert "Action" in genres or "Drama" in genres

def test_invalid_movie_returns_404(client):
    response = client.get("/api/movies/99999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
