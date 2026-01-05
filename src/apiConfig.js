// src/apiConfig.js (FINAL VERSION - CONTAINS EVERYTHING)
import axios from 'axios';

const API_URL = 'https://dadiex.pythonanywhere.com/api';

const apiClient = axios.create({
  baseURL: API_URL
} );

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
