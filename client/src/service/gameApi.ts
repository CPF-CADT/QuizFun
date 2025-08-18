import { apiClient } from './api'; 

export interface IFeedbackRequest {
  userId: string;
  rating: number;
  comment?: string;
}

export interface IAnswerAttempt {
  selectedOptionId: string;
  isCorrect: boolean;
  answerTimeMs: number;
}

export interface IGameHistory {
  _id: string;
  gameSessionId: string;
  quizId: string;
  questionId: string;
  userId: string;
  guestNickname?: string;
  attempts: IAnswerAttempt[];
  isUltimatelyCorrect: boolean;
  finalScoreGained: number;
  createdAt: string; // ISO Date String
}

export interface IGameResult {
  userId: string;
  nickname: string;
  finalScore: number;
  finalRank: number;
  feedback: {
    rating: string; 
    comment?: string;
  }[];
}

export interface IGameSession {
  _id: string;
  quizId: string;
  hostId: string;
  joinCode: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  results: IGameResult[];
  startedAt?: string; // ISO Date String
  endedAt?: string;   // ISO Date String
}


export interface IGetSessionsParams {
  page?: number;
  limit?: number;
}


export const gameApi = {

  getGameSessions: (params: IGetSessionsParams) => {
    return apiClient.get('/session', { params });
  },

  getSessionDetails: (sessionId: string) => {
    return apiClient.get(`/session/${sessionId}`);
  },

  getSessionHistory: (sessionId: string) => {
    return apiClient.get<IGameHistory[]>(`/session/${sessionId}/history`);
  },

  addFeedback: (sessionId: string, feedbackData: IFeedbackRequest) => {
    return apiClient.post(`/session/${sessionId}/feedback`, feedbackData);
  },

  getUserHistory: (userId: string) => {
    return apiClient.get<IGameHistory[]>(`/user/${userId}/history`);
  },

  getUserPerformanceOnQuiz: (userId: string, quizId: string) => {
    return apiClient.get<IGameHistory[]>(`/user/${userId}/performance/${quizId}`);
  },
};