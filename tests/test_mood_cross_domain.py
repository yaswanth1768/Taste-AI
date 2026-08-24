"""
Tests for Mood-Based Recommendations and Cross-Domain Movie <-> Music Engine.
"""

def test_mood_recommendations(client):
    moods = ["Happy", "Sad", "Workout", "Relax", "Focus", "Romantic"]
    for mood in moods:
        res = client.get(f"/api/recommendations/mood?mood={mood}&limit=4")
        assert res.status_code == 200
        data = res.json()
        assert data["mood"] == mood
        assert len(data["movies"]) > 0
        assert len(data["music"]) > 0
        assert "explanation" in data

def test_cross_domain_movie_to_music(client):
    # Interstellar ID is 157336
    res = client.get("/api/recommendations/cross-domain?movie_id=157336&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert data["query_type"] == "movie"
    assert "Interstellar" in data["query_item"]
    assert len(data["recommended_tracks"]) > 0
    assert "cross_domain_theme" in data

def test_cross_domain_music_to_movie(client):
    # Starboy track_id is t_0001
    res = client.get("/api/recommendations/cross-domain?song_id=t_0001&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert data["query_type"] == "music"
    assert "Starboy" in data["query_item"]
    assert len(data["recommended_movies"]) > 0
