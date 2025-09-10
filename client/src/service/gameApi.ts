import { apiClient } from './api';

export interface IFeedbackRequest {
  rating: number;
  comment?: string;
}

export interface IAnswerAttempt {
  selectedOptionId?: string;
  isCorrect: boolean;
  answerTimeMs: number;
  selectedOptionText?: string;
}

export interface IGameHistory {
  _id: string;
  gameSessionId: string;
  quizId: string;
  questionId: string;
  questionText?: string;
  userId: string;
  guestNickname?: string;
  username?: string,
  attempts: IAnswerAttempt[];
  wasUltimatelyCorrect: boolean;
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
export interface IGamePerformace {
  performance: IGameHistory[],
  username: string,
  userId?: string
}
export interface ResultsPayload {
  viewType: 'host' | 'player' | 'guest';
  results: {
    participantId: string;
    name: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    averageTime: number;
  }[];
}

export interface ISessionAnalytics {
  quizTitle: string;
  endedAt: string;
  participants: {
    userId: string;
    name: string;
    profileUrl?: string;
    score: number;
    rank: number;
  }[];
}

export interface IGetSessionByQuizHostParams {
  hostId: string;
  quizId: string;
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
  getUserPerformanceInSession: (userId: string, sessionId: string) => {
    return apiClient.get<IGamePerformace>(`/session/${sessionId}/performance/${userId}`);
  },
  getGuestPerformanceInSession: (sessionId: string, guestName: string) => {
    return apiClient.get<IGamePerformace>(`/session/${sessionId}/performance/guest`, {
      params: { name: guestName }
    });
  },
  getSessionResults: (sessionId: string, params: { userId?: string; guestName?: string; view:string }) => {
    return apiClient.get<ResultsPayload>(`/session/${sessionId}/results`, { params });
  },
  getSessionAnalytics: (sessionId: string) => {
    return apiClient.get<ISessionAnalytics>(`/session/${sessionId}/analytics`);
  },
  getSessionByQuizAndHost: ({ hostId, quizId }: IGetSessionByQuizHostParams) => {
    return apiClient.get(`/session/${hostId}/${quizId}`);
  },
  getUserQuizHistoryForQuiz: (userId: string, quizId: string) => {
    return apiClient.get(`/session/${userId}/quiz-history/${quizId}`);
  },


};