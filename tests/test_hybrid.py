"""
Tests for Hybrid Personalization and User Feedback Loop.
"""

def test_user_feedback_and_favorite_toggle(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}

    # 1. Post Like interaction
    feedback_res = client.post("/api/feedback", json={
        "item_id": "19995",
        "item_type": "movie",
        "action": "like",
        "rating": 5.0
    }, headers=headers)
    assert feedback_res.status_code == 200
    assert feedback_res.json()["action"] == "like"

    # 2. Toggle Favorite
    fav_res = client.post("/api/feedback/favorite", json={
        "item_id": "19995",
        "item_type": "movie",
        "title": "Avatar",
        "subtitle": "James Cameron"
    }, headers=headers)
    assert fav_res.status_code == 200
    assert fav_res.json()["status"] == "added"

    # 3. Get Favorites list
    favs_list = client.get("/api/feedback/favorites", headers=headers)
    assert favs_list.status_code == 200
    assert len(favs_list.json()) > 0
    assert favs_list.json()[0]["title"] == "Avatar"

def test_personalized_hybrid_recommendations(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    res = client.get("/api/recommendations/personalized?limit=6", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "recommended_movies" in data
    assert "recommended_music" in data
    assert len(data["recommended_movies"]) > 0
    assert len(data["recommended_music"]) > 0
    assert "explanation" in data["recommended_movies"][0]
