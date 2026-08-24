import api from './api';

export const feedbackService = {
  recordFeedback: async (feedbackData) => {
    // feedbackData: { item_id, item_type: 'movie'|'music', action: 'like'|'dislike'|'favorite'|'skip'|'click', rating }
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },

  toggleFavorite: async (favData) => {
    // favData: { item_id, item_type: 'movie'|'music', title, subtitle, artwork_url }
    const response = await api.post('/feedback/favorite', favData);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/feedback/favorites');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/feedback/history');
    return response.data;
  }
};
