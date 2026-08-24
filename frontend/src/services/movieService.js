import api from './api';

export const movieService = {
  getMovies: async (params = {}) => {
    const response = await api.get('/movies', { params });
    return response.data;
  },

  getMovieDetails: async (movieId) => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  },

  getGenres: async () => {
    const response = await api.get('/movies/genres/all');
    return response.data;
  },

  getPopular: async (limit = 12) => {
    const response = await api.get('/movies/popular', { params: { limit } });
    return response.data;
  }
};
