import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: Inject JWT Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tasteai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle Unauthorized token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on optional /auth/me queries
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('tasteai_token');
        localStorage.removeItem('tasteai_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
