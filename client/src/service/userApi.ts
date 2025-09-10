import { apiClient } from './api';
type UserRole = 'player' | 'admin' | 'moderator';

interface ILoginCredentials {
  email: string;
  password: string;
  profile_url?:string;
}

interface IRegisterUserData {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    profile_url?: string;
}

interface IUpdateUserData {
  name?: string;
  password?: string;
  profileUrl?: string;
}

interface IVerifyEmailPayload {
  email: string;
  code: string | number;
}

interface IGetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const authApi = {
  login: (credentials: ILoginCredentials) => {
    return apiClient.post('/user/login', credentials);
  },
  logout: () => {
    return apiClient.post('/user/logout');
  },
  signUp: (data: IRegisterUserData) => {
    return apiClient.post('/user/register', data);
  },
  verifyEmail: (payload: IVerifyEmailPayload) => {
    return apiClient.post('/user/verify-otp', payload);
  }, 
  requestVerificationCode: (email: string) => {
    return apiClient.post('/user/request-code', { email });
  }
};


export const userApi = {

  getAllUsers: (params: IGetAllUsersParams) => {
    return apiClient.get('/user', { params });
  },
  getUserProfileDetail:(params:ILoginCredentials | IRegisterUserData) =>{
    return apiClient.get('/profile',{params})
  },

  getUsersByRole: (role: UserRole, params: IGetAllUsersParams) => {
    return apiClient.get(`/user/by-role/${role}`, { params });
  },

  updateUser: (userId: string, data: IUpdateUserData) => {
    return apiClient.put(`/user/${userId}`, data);
  },
   requestPasswordResetCode: (email: string) => {
    return apiClient.post('/user/request-password-reset', { email });
  },
  verifyPasswordResetCode: (payload: { email: string; code: string }) => {
    return apiClient.post('/user/verify-password-reset-code', payload);
  },
  resetPassword: (payload: { resetToken: string; newPassword: string; confirmPassword: string }) => {
    return apiClient.post('/user/reset-password', payload);
  },
  getUserById: (userId: string) => {
    return apiClient.get(`/user/${userId}`);
  },
    getUserQuizHistory: (userId: string) => {
    return apiClient.get(`/user/${userId}/quiz-history`);
  },
};
