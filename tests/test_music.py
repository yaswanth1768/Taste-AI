"""
Tests for Music Endpoints and NearestNeighbors Audio Recommendation Engine.
"""

def test_get_music_list(client):
    response = client.get("/api/music?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "artist" in data[0]
    assert "audio_features" in data[0]

def test_get_track_details(client):
    # Starboy is t_0001
    response = client.get("/api/music/t_0001")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Starboy"
    assert "The Weeknd" in data["artist"]
    assert "danceability" in data["audio_features"]

def test_music_recommendations(client):
    response = client.get("/api/recommendations/music/t_0001?top_k=5")
    assert response.status_code == 200
    data = response.json()
    assert data["song"] == "Starboy"
    assert len(data["recommendations"]) == 5
    assert data["recommendations"][0]["similarity"] > 0

def test_filter_by_audio_features(client):
    response = client.get("/api/music/filter/audio?min_energy=0.7&max_energy=1.0&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for track in data:
        assert track["audio_features"]["energy"] >= 0.7

def test_invalid_song_returns_404(client):
    response = client.get("/api/music/non_existent_id")
    assert response.status_code == 404
