import axios from "axios";

// Dev: Vite proxies /api → http://localhost:8000 (see vite.config.ts)
// Prod: set VITE_API_URL=https://your-backend.up.railway.app in your deployment env
const VITE_API_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL;

export const API_BASE_URL = VITE_API_URL ? `${VITE_API_URL}/api` : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { token?: string };
      if (parsed.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      // ignore malformed JSON
    }
  }
  return config;
});

// Global 401 handler — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
