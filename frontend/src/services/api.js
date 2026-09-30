import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  // Kept above the backend's worst-case AI fallback chain (4 models x 12s + backoff,
  // ~49s) so a real answer from a fallback model isn't cut off as a false "timeout".
  timeout: 60000,
});

// Attach a fresh Firebase ID token to every request.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Token fetch failed — request proceeds unauthenticated and the
      // response interceptor below will handle the 401.
    }
  }
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Centralized 401 handling: notify the auth context so it can sign the
// user out and redirect to /login exactly once.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config || {};
    // Firebase can rotate an ID token while the app is open. Refresh once before
    // treating a 401 as a real session expiration.
    if (status === 401 && auth.currentUser && !config._retriedAuth) {
      config._retriedAuth = true;
      try {
        const freshToken = await auth.currentUser.getIdToken(true);
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${freshToken}`;
        return api(config);
      } catch {
        // Fall through to the centralized session-expired handler.
      }
    }
    if (status === 401 && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
