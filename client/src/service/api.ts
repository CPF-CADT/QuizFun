import axios from 'axios';
import { getToken, setToken, clearClientAuthData } from '../service/auth';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void, reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        const { data } = await apiClient.post('/user/refresh-token');
        const newAccessToken = data.accessToken;

        setToken(newAccessToken); 
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken); 
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        // If refresh fails, log the user out
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
export const apiService = {

  uploadImageToCloudinary: async (file: string | Blob) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('service/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return res.data.url;

    } catch (error) {
      throw new Error((error as Error).message || "Failed to upload image");
    }
  },

}

export const authApi = {
  login: async (credentials: object) => {
    return apiClient.post('/user/login', credentials);
  },
  logout: async () => {
    return apiClient.post('/user/logout');
  },
  signUp: async() =>{
    return apiClient.post('/user/')
  }
};