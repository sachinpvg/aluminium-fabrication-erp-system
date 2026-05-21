import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};

export const authHeaders = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: { 'Content-Type': 'application/json' }
});

export default apiClient;
