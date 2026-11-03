import axios from 'axios';

// Render-ൽ ലൈവ് ആയി നിൽക്കുന്ന ബാക്കെൻഡ് URL
const BASE_URL = 'https://revathy-holidays-backend.onrender.com/api/';

const API = axios.create({
  baseURL: BASE_URL,
});

// Request Interceptor: Attach token if exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh access token on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if 401 Unauthorized and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Request new access token using refresh token from Live Backend
          const res = await axios.post(`${BASE_URL}token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          localStorage.setItem('token', newAccessToken);

          // Retry the original booking request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        } catch (refreshErr) {
          // If refresh token also expired, clear storage and log out
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('username');
          window.location.reload();
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;