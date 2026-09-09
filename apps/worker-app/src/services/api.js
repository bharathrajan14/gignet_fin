import axios from 'axios';

export const getBaseUrl = () => {
  const runtimeOverride = typeof window !== 'undefined' ? localStorage.getItem('gignet_api_url') : null;
  const envUrl = runtimeOverride || import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api/v1';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
};

export const setCustomApiUrl = (newUrl) => {
  if (typeof window !== 'undefined') {
    if (newUrl && newUrl.trim()) {
      const clean = newUrl.trim().replace(/\/+$/, '');
      localStorage.setItem('gignet_api_url', clean);
    } else {
      localStorage.removeItem('gignet_api_url');
    }
    api.defaults.baseURL = getBaseUrl();
  }
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  const token = localStorage.getItem('gignet_worker_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
