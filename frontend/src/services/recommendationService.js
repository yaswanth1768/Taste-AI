import api from './api';

export const recommendationService = {
  getPersonalized: async (limit = 8) => {
    const response = await api.get('/recommendations/personalized', { params: { limit } });
    return response.data;
  },

  getMovieRecommendations: async (movieId, topK = 6) => {
    const response = await api.get(`/recommendations/movies/${movieId}`, { params: { top_k: topK } });
    return response.data;
  },

  getMusicRecommendations: async (songId, topK = 6) => {
    const response = await api.get(`/recommendations/music/${songId}`, { params: { top_k: topK } });
    return response.data;
  },

  getMoodRecommendations: async (mood = 'Happy', limit = 8) => {
    const response = await api.get('/recommendations/mood', { params: { mood, limit } });
    return response.data;
  },

  getCrossDomain: async (params = {}) => {
    const response = await api.get('/recommendations/cross-domain', { params });
    return response.data;
  }
};
