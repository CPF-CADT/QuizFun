import { apiClient } from './api';
import type { AxiosResponse } from 'axios';

export type Dificulty = 'Hard' | 'Medium' | 'Easy';

export interface IReportQuizListItem {
    _id: string;
    title: string;
    dificulty: Dificulty;
    createdAt: Date;
}

export interface IFeedback {
    rating: number;
    comment?: string;
}

export interface IFeedbackResponse {
    feedbacks: IFeedback[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface IQuizAnalytics {
    quizId: string;
    quizTitle: string;
    totalSessions: number;
    totalUniquePlayers: number;
    averageQuizScore: number;
    playerPerformance: {
        passOrFail: {
            passed: number;
            failed: number;
        };
        scoreDistribution: {
            '0-49%': number;
            '50-69%': number;
            '70-89%': number;
            '90-100%': number;
        };
        fastResponses: number; 
    };
    engagementMetrics: {
        uniquePlayers: number;
        totalSessions: number;
        averageCompletionRate: number;
    };
}


export interface IActivitySession {
    _id: string;
    quizTitle: string;
    quizzId: string;
    endedAt: string;
    role: 'host' | 'player';
    playerCount?: number;
    averageScore?: number;
    playerResult?: {
        finalScore: number;
        finalRank: number;
    };
}

export interface IActivityFeedResponse {
    activities: IActivitySession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ILeaderboardPlayer {
  _id: string | object;   
  rank: number;                   
  isGuest: boolean;              
  name: string;                   
  profileUrl?: string;

  totalGamesPlayed: number;      
  totalScore: number;            
  averageScore: number;           
  averageAccuracy: number;     
}

export interface ILeaderboardResponse {
  leaderboard: ILeaderboardPlayer[];
  userRank?: ILeaderboardPlayer | null;
}

export const reportApi = {
    getMyQuizzesForReport: (): Promise<AxiosResponse<IReportQuizListItem[]>> => {
        return apiClient.get('/reports/my-quizzes');
    },

    getQuizAnalytics: (quizId: string): Promise<AxiosResponse<IQuizAnalytics>> => {
        return apiClient.get(`/reports/quiz/${quizId}`);
    },

    getUserActivityFeed: (page: number = 1, limit: number = 10, roleFilter: 'all' | 'host' | 'player' = 'all'): Promise<AxiosResponse<IActivityFeedResponse>> => {
        return apiClient.get<IActivityFeedResponse>(`/reports/activity-feed?page=${page}&limit=${limit}&roleFilter=${roleFilter}`);
    },
    
    getQuizFeedback: (quizId: string, page: number = 1, limit: number = 5): Promise<AxiosResponse<IFeedbackResponse>> => {
        return apiClient.get(`/reports/quiz/${quizId}/feedback?page=${page}&limit=${limit}`);
    },

    getLeaderboard: (limit: number = 10): Promise<AxiosResponse<ILeaderboardResponse>> => {
        return apiClient.get<ILeaderboardResponse>(`/reports/leaderboard?limit=${limit}`);
    },
};