// src/service/api.ts
import axios from 'axios';
import { getAccessToken, setAccessToken, clearClientAuthData } from './auth';

// Create an axios instance with a base URL and credentials support.
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/', // Your API's base URL
  withCredentials: true,
});

// Request interceptor: Adds the Authorization header to every outgoing request.
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Handles 401 errors by attempting to refresh the token.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any; // Use 'any' to add custom property

    // Check if the error is a 401 and we haven't retried this request yet.
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a token refresh is already in progress, queue this request.
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to get a new access token using the refresh token cookie.
        const { data } = await apiClient.post('/user/refresh-token');
        const newAccessToken = data.accessToken;
        setAccessToken(newAccessToken);
        
        // Update the header of the original request and process the queue.
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue((refreshError as Error), null);
        // If refresh fails, clear auth data and redirect to login.
        clearClientAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Export a structured object for authentication-related API calls.
export const authApi = {
  login: (credentials: object) => {
    return apiClient.post('/user/login', credentials);
  },
  logout: () => {
    return apiClient.post('/user/logout');
  },
  signUp: (data: object) => {
    return apiClient.post('/user/register', data);
  },
  getProfile: () => {
    return apiClient.get('/user/profile'); 
  }
};
