// DTO for the quiz selection list
export interface IReportQuizListItem {
    _id: string;
    title: string;
    dificulty: 'Hard' | 'Medium' | 'Easy';
    createdAt: Date;
}

// DTO for anonymous feedback
export interface IFeedback {
    rating: number;
    comment?: string;
}

// Main DTO for the API response
export interface IQuizAnalytics {
    quizId: string;
    quizTitle: string;
    totalSessions: number;
    totalUniquePlayers: number;
    averageQuizScore: number; // Average of final scores from GameSession
    
    playerPerformance: {
        averageCompletionRate: number; // Average of (correct answers / total answers) per player
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