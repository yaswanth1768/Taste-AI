import api from './api';

export const musicService = {
  getMusic: async (params = {}) => {
    const response = await api.get('/music', { params });
    return response.data;
  },

  getTrackDetails: async (songId) => {
    const response = await api.get(`/music/${songId}`);
    return response.data;
  },

  getGenres: async () => {
    const response = await api.get('/music/genres/all');
    return response.data;
  },

  getPopular: async (limit = 12) => {
    const response = await api.get('/music/popular', { params: { limit } });
    return response.data;
  },

  filterByAudio: async (audioParams = {}) => {
    const response = await api.get('/music/filter/audio', { params: audioParams });
    return response.data;
  }
};
