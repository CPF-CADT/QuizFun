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


export const reportApi = {

    getMyQuizzesForReport: (): Promise<AxiosResponse<IReportQuizListItem[]>> => {
        return apiClient.get('/reports/my-quizzes');
    },

    getQuizAnalytics: (quizId: string): Promise<AxiosResponse<IQuizAnalytics>> => {
        return apiClient.get(`/reports/quiz/${quizId}`);
    },
};