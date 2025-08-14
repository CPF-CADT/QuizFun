import { apiClient } from './api'; 

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
  imageUrl?: string | null;
  tags?: string[] | null;
}

export interface IQuiz {
  _id?: string;
  title: string;
  description?: string;
  creatorId: string;
  visibility: 'public' | 'private';
  templateImgUrl?: string;
  questions?: IQuestion[];
}

export interface IGetAllQuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: 'public' | 'private';
  sortBy?: 'createdAt' | 'title' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IGetQuizzesByUserParams {
    page?: number;
    limit?: number;
    visibility?: 'public' | 'private';
}


export const quizApi = {
  getAllQuizzes: (params: IGetAllQuizzesParams) => {
    return apiClient.get('/quizz', { params });
  },

  getQuizById: (quizId: string) => {
    return apiClient.get(`/quizz/${quizId}`);
  },

  getQuizzesByUser: (userId: string, params: IGetQuizzesByUserParams) => {
    return apiClient.get(`/quizz/user/${userId}`, { params });
  },

  createQuiz: (quizData: Omit<IQuiz, '_id' | 'questions'>) => {
    return apiClient.post('/quizz', quizData);
  },

  deleteQuiz: (quizId: string) => {
    return apiClient.delete(`/quizz/${quizId}`);
  },

  addQuestionToQuiz: (data: { quizId: string; question: Omit<IQuestion, '_id'> }) => {
    return apiClient.post('/quizz/question', data);
  },

  updateQuestion: (quizId: string, questionId: string, questionData: IQuestion) => {
    return apiClient.put(`/quizz/${quizId}/question/${questionId}`, questionData);
  },

  deleteQuestion: (quizId: string, questionId: string) => {
    return apiClient.delete(`/quizz/${quizId}/question/${questionId}`);
  },

  updateOption: (quizId: string, questionId: string, optionId: string, optionData: IOption) => {
    return apiClient.put(`/quizz/${quizId}/question/${questionId}/option/${optionId}`, optionData);
  },

  deleteOption: (quizId: string, questionId: string, optionId: string) => {
    return apiClient.delete(`/quizz/${quizId}/question/${questionId}/option/${optionId}`);
  },

  getDashboardStats: () => {
    return apiClient.get('/quizz/dashboard/stats');
  },
};