// src/service/api.ts
import axios, { type AxiosRequestConfig } from 'axios';
import type { RefObject } from 'react';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const setupAuthInterceptors = (
  setAccessToken: (token: string | null) => void,
  logout: () => void,
  accessTokenRef: RefObject<string | null>
) => {
  const requestInterceptor = apiClient.interceptors.request.use(
    (config) => {
      if (accessTokenRef.current) {
        config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
      }
      config.headers['x-api-key'] = import.meta.env.VITE_FRONTEND_API_KEY;
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

  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // --- START: THE FIX ---
      // If the refresh token request itself fails, logout immediately.
      if (originalRequest.url === '/user/refresh-token') {
        console.error("Session has expired or refresh token is invalid. Logging out.");
        logout();
        return Promise.reject(error);
      }
      // --- END: THE FIX ---

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await authApi.refreshToken();
          const newAccessToken = data.accessToken;
          
          setAccessToken(newAccessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);

        } catch (refreshError) {
          processQueue((refreshError as Error), null);
          console.error("Session expired. Please log in again.", refreshError);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    apiClient.interceptors.request.eject(requestInterceptor);
    apiClient.interceptors.response.eject(responseInterceptor);
  };
};




export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'player' | 'admin' | 'moderator';
  profileUrl: string;
  isVerified: boolean;
  google_id?: string;
  createdAt: string;
  updatedAt: string;
  lastQuizId?: string;
}

export interface ILoginResponse {
  message: string;
  accessToken: string;
  user: IUser;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}

export interface IVerifyCodeResponse extends ILoginResponse {}

export interface IRequestCodePayload {
  email: string;
}

export interface IVerifyCodePayload {
  email: string;
  code: string;
}

export interface IResetPasswordPayload {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IVerifyResetCodeResponse {
  message: string;
  resetToken: string;
}

export const authApi = {
  login: (credentials: object) => {
    return apiClient.post<ILoginResponse>('/user/login', credentials);
  },

  logout: () => {
    return apiClient.post('/user/logout');
  },

  signUp: (data: object) => {
    return apiClient.post('/user/register', data);
  },

  getProfile: () => {
    return apiClient.get<IUser>('/user/profile');
  },

  refreshToken: () => {
    return apiClient.post<IRefreshTokenResponse>('/user/refresh-token');
  },

  requestCode: (payload: IRequestCodePayload) => {
    return apiClient.post('/user/request-code', payload);
  },

  verifyEmail: (payload: IVerifyCodePayload) => {
    return apiClient.post<IVerifyCodeResponse>('/user/verify-otp', payload);
  },

  verifyPasswordResetCode: (payload: IVerifyCodePayload) => {
    return apiClient.post<IVerifyResetCodeResponse>('/user/verify-password-reset-code', payload);
  },

  resetPassword: (payload: IResetPasswordPayload) => {
    return apiClient.post('/user/reset-password', payload);
  },
  googleAuthenication:(token:string)=>{
    return apiClient.post('/user/google',{token})
  }
};

export const apiService ={
  uploadImageToCloudinary: async (file: File | Blob) => { 
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