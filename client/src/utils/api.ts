import axios from 'axios';

// Get API URL from environment variable or use proxy in development
// In production (GitHub Pages), this must be set to your deployed backend URL
const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      const basePath = process.env.NODE_ENV === 'production' ? '/ideasnet' : '';
      window.location.href = `${basePath}/login`;
    }
    return Promise.reject(error);
  }
);

export default api;

