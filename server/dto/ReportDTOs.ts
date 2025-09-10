// FILE: src/dto/ReportDTOs.ts

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

/**
 * NEW: Interface for the paginated feedback API response.
 */
export interface IFeedbackResponse {
    feedbacks: IFeedback[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * MODIFIED: This interface no longer includes the 'recommendations' or 'feedback' fields.
 */
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