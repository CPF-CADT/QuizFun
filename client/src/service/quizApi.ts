// src/service/quizApi.ts
import { apiClient } from './api'; // Assuming your central axios instance is in 'api.ts'
import type { AxiosResponse } from 'axios';
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
  tags?: any;
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
  tags: string;
}

export interface IGetAllQuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string; // e.g., "math,science"
  sortBy?: 'createdAt' | 'title' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  owner?: 'me' | 'other' | 'all';
}

export interface IGetQuizzesByUserParams {
  page?: number;
  limit?: number;
  search?: string;
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

export interface IUpdateQuizPayload {
  title: string;
  description?: string;
  visibility: 'public' | 'private';
  dificulty: Dificulty;
  tags?: any;
}

export type IReportQuestionPayload = {
  quizId: string;
  questionId: string;
  reason: 'incorrect_answer' | 'unclear_wording' | 'typo' | 'inappropriate_content' | 'other';
  comment?: string;
};

export interface IUserReportSummary {
  userId: string;
  totalReports: number;
}
export interface IPaginatedUserReports {
  data: IUserReportSummary[];
  page: number;
  limit: number;
  totalDocuments: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
// src/types/quiz.ts (or a similar file)

export interface IQuizHistory {
  id: string;
  title: string;
  category: string;
  date: string; // Or Date if you plan to parse it
  score: number;
  totalQuestions: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard'; // Using literal types for specificity
  status: string; // Could also be a literal type e.g., 'Completed' | 'In Progress'
  rating: number;
  participants: number;
  lastUpdated: string;
  description: string;
}



export const quizApi = {
  addBugReport(report: { title: string; description: string; rating: number }) {
    return apiClient.post('/bug-report', {
      title: report.title,
      description: report.description,
      rating: report.rating,
    });
  },
  getAllQuizzes: (params: IGetAllQuizzesParams): Promise<AxiosResponse<IQuizPaginatedResponse>> => {
    return apiClient.get<IQuizPaginatedResponse>('/quizz', { params });
  },

  getQuizById: (quizId: string) => {
    return apiClient.get<IQuiz>(`/quizz/${quizId}`);
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

  addQuestionToQuiz: (quizId: string, question: Omit<IQuestion, '_id'>) => {
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
  },

  importPDF: (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return apiClient.post<{
      message: string;
      data: {
        questions: Omit<IQuestion, '_id'>[];
        title?: string;
        errors: string[];
      }
    }>('/quizz/import-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  createQuizFromImport: (quizData: {
    title: string;
    description?: string;
    visibility: 'public' | 'private';
    dificulty: Dificulty;
    templateImgUrl?: string;
    questions: Omit<IQuestion, '_id'>[];
  }) => {
    return apiClient.post<{ message: string, data: IQuiz }>('/quizz/create-from-import', quizData);
  },
  updateQuiz: (quizId: string, quizData: IUpdateQuizPayload) => {
    return apiClient.put<{ message: string, data: IQuiz }>(`/quizz/${quizId}`, quizData);
  },
  reportQuestion: (payload: IReportQuestionPayload): Promise<AxiosResponse<{ message: string }>> => {
    console.log(payload)
    return apiClient.post('/reports/question', payload);
  },
  getReportsByUser: (page: number, limit: number = 10): Promise<AxiosResponse<IPaginatedUserReports>> => {
    return apiClient.get('/report/by-user', { params: { page, limit } });
  },
};