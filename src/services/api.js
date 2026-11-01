import axios from "axios";

// The address of the backend: from the VITE_API_URL setting when it exists,
// otherwise localhost (while developing on your laptop)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const API = axios.create({
  baseURL: API_URL,
});

// Automatically add the token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gets a new access token using the refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });

  localStorage.setItem("accessToken", response.data.accessToken);
  return response.data.accessToken;
};

// When several requests fail at the same time, they all wait for ONE refresh
let refreshPromise = null;

// When the access token expired: renew it and repeat the request
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasRefreshToken = Boolean(localStorage.getItem("refreshToken"));

    const tokenExpired = error.response?.status === 401 && !originalRequest._retry;

    if (tokenExpired && hasRefreshToken) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        if (refreshError.response) {
          // the server refused the refresh token: the user has to log in again
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }

        // no answer from the server (bad connection): keep the user logged in
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;