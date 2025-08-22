// src/service/quizApi.ts
import { apiClient } from './api'; // Assuming your central axios instance is in 'api.ts'
import type{ AxiosResponse } from 'axios';
// --- INTERFACES (based on your Swagger schemas) ---

export interface IOption {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id?: string;
  questionText: string;
  point: number;
  timeLimit: number;
  options: IOption[];
  imageUrl?: string;
  tags?: string[];
}

export type Dificulty = 'Hard' | 'Medium' | 'Easy';

export interface IQuiz {
  _id: string;
  title: string;
  description?: string;
  creatorId: string;
  visibility: 'public' | 'private';
  dificulty: Dificulty;
  templateImgUrl?: string;
  questions: IQuestion[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// --- PAYLOAD & PARAMS INTERFACES ---

export interface ICreateQuizPayload {
  title: string;
  description?: string;
  visibility: 'public' | 'private';
  dificulty: Dificulty;
  templateImgUrl?: string;
  tags:string[];
}

export interface IGetAllQuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string; // e.g., "math,science"
  sortBy?: 'createdAt' | 'title' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IGetQuizzesByUserParams {
  page?: number;
  limit?: number;
}

export interface IQuizPaginatedResponse {
  quizzes: IQuiz[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ILeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    profileUrl: string;
}

export const quizApi = {
  getAllQuizzes: (params: IGetAllQuizzesParams): Promise<AxiosResponse<IQuizPaginatedResponse>> => {
    return apiClient.get<IQuizPaginatedResponse>('/quizz', { params });
  },

  getQuizById: (quizId: string) => {
    return apiClient.get<IQuiz>(`/quizz/${quizId}`);
  },

  getMyQuizzes: (params: IGetQuizzesByUserParams): Promise<AxiosResponse<IQuizPaginatedResponse>> => {
    return apiClient.get<IQuizPaginatedResponse>('/quizz/user/', { params });
  },
  
  createQuiz: (quizData: ICreateQuizPayload) => {
    return apiClient.post<{ message: string, data: IQuiz }>('/quizz', quizData);
  },

  deleteQuiz: (quizId: string) => {
    return apiClient.delete<{ message: string }>(`/quizz/${quizId}`);
  },
  
 cloneQuiz: (quizId: string): Promise<AxiosResponse<IQuiz>> => {
    return apiClient.post<IQuiz>(`/quizz/${quizId}/clone`);
  },

  getQuizLeaderboard: (quizId: string) => {
    return apiClient.get<ILeaderboardEntry[]>(`/quizz/${quizId}/leaderboard`);
  },

  addQuestionToQuiz : (quizId: string, question: Omit<IQuestion, '_id'>) => {
    return apiClient.post<{ message: string }>('/quizz/question', { quizzId: quizId, question });
  },

  updateQuestion: (quizId: string, questionId: string, questionData: Omit<IQuestion, '_id'>) => {
    return apiClient.put<{ message: string, question: IQuestion }>(`/quizz/${quizId}/question/${questionId}`, questionData);
  },

  deleteQuestion: (quizId: string, questionId: string) => {
    return apiClient.delete<{ message: string }>(`/quizz/${quizId}/question/${questionId}`);
  },

  updateOption: (quizId: string, questionId: string, optionId: string, optionData: Omit<IOption, '_id'>) => {
    return apiClient.put<{ message: string, option: IOption }>(`/quizz/${quizId}/question/${questionId}/option/${optionId}`, optionData);
  },

  deleteOption: (quizId: string, questionId: string, optionId: string) => {
    return apiClient.delete<{ message: string }>(`/quizz/${quizId}/question/${questionId}/option/${optionId}`);
  },
  getDashboardStats: () => {
    return apiClient.get('/quizz/stats');
  }
};