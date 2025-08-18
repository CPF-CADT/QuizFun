export interface FinalResultData {
    participantId?: string;
    name: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    averageTime: number;
    detailedAnswers?: DetailedAnswer[];
}

export interface DetailedAnswer {
    _id: string;
    isUltimatelyCorrect: boolean;
    questionId: {
        questionText: string;
    };
    attempts: {
        selectedOptionText: string; // You'll need to add this to your backend history saving
    }[];
}
