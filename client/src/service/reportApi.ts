import { apiClient } from './api'; // Your central axios instance
import type { AxiosResponse } from 'axios';

export type Dificulty = 'Hard' | 'Medium' | 'Easy';

export interface IReportQuizListItem {
    _id: string;
    title: string;
    dificulty: Dificulty;
    createdAt: Date;
}

export interface IFeedback {
    rating: number; // e.g., 1-5
    comment?: string;
}

export interface IQuizAnalytics {
    quizId: string;
    quizTitle: string;
    totalSessions: number;
    totalUniquePlayers: number;
    averageQuizScore: number;
    
    playerPerformance: {
        averageCompletionRate: number;
        correctnessDistribution: {
            below50Percent: number;
            between50And70Percent: number;
            above70Percent: number;
        }
    };

    recommendations: {
        feedback: IFeedback[];
    };
}

export interface IActivitySession {
  _id: string;
  quizTitle: string;
  quizzId:string;
  endedAt: string;
  role: 'host' | 'player';
  playerCount?: number;
  averageScore?: number;
  playerResult?: {
    finalScore: number;
    finalRank: number;
  };
}


export const reportApi = {

    getMyQuizzesForReport: (): Promise<AxiosResponse<IReportQuizListItem[]>> => {
        return apiClient.get('/reports/my-quizzes');
    },

    getQuizAnalytics: (quizId: string): Promise<AxiosResponse<IQuizAnalytics>> => {
        return apiClient.get(`/reports/quiz/${quizId}`);
    },
    getUserActivityFeed: (): Promise<AxiosResponse<IActivitySession[]>> => {
        return apiClient.get<IActivitySession[]>('/reports/activity-feed');
    },

};