import axios from "axios";
import { getToken, setToken, clearClientAuthData } from "./auth";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/",
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Your existing apiClient interceptors remain here...

// Auth API
export const authApi = {
  login: (credentials: object) => apiClient.post("/user/login", credentials),
  logout: () => apiClient.post("/user/logout"),
  signUp: (data: object) => apiClient.post("/user/register", data),
};

// Verify API
export const verifyApi = {
  verifyCode: (email: string, code: string) =>
    apiClient.post("/user/verify-code", { email, code }),
  resendCode: (email: string) =>
    apiClient.post("/user/resend-code", { email }),
};
