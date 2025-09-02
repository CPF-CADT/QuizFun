// FILE: src/service/reportApi.ts

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
        averageCompletionRate: number;
        correctnessDistribution: {
            below50Percent: number;
            between50And70Percent: number;
            above70Percent: number;
        }
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
};