import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface UploadResponse {
  url: string;
}

export const apiService = {
  uploadImageToCloudinary: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post<UploadResponse>('service/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.url;
    } catch (error) {
      throw new Error("An unexpected error occurred during image upload.");
    }
  },
};
