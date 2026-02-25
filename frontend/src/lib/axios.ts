/**
 * Axios instance with auth token and base URL
 * Uses same-origin /api (proxied to backend) to avoid CORS/Network errors
 */

import axios from 'axios';

// Use relative /api when proxied - requests go to same origin, Next.js rewrites to backend
const API_URL =
  typeof window !== 'undefined'
    ? '/api' // Browser: use proxy (next.config rewrites)
    : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '')}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Network error - backend likely not running
    if (err.code === 'ERR_NETWORK' && typeof window !== 'undefined') {
      import('react-hot-toast').then(({ default: toast }) =>
        toast.error('Cannot reach server. Start the backend: cd backend && npm run dev')
      );
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshUrl = typeof window !== 'undefined' ? '/api/auth/refresh' : `${API_URL}/auth/refresh`;
        const { data } = await axios.post(refreshUrl, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);
