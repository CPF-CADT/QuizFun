// src/service/soloGameApi.ts (NEW FILE)

import { apiClient } from './api';


export interface ISoloQuestion {
    _id: string;
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: { _id: string; text: string }[];
}

export interface ISoloGameState {
    sessionId: string;
    totalQuestions: number;
    question: ISoloQuestion;
}

export interface ISoloRestoredState {
    sessionId: string;
    score: number;
    currentQuestionIndex: number;
    totalQuestions: number;
    question: ISoloQuestion;
    remainingTimeMs: number;
    timeLimit?:number;
}

export interface ISoloAnswerPayload {
    questionId: string;
    optionId: string;
    answerTimeMs: number;
}

export interface ISoloAnswerResponse {
    wasCorrect: boolean;
    scoreGained: number;
    correctOptionId: string;
    isGameOver: boolean;
    nextQuestion: ISoloQuestion | null;
    totalScore: number;
    
}


export const soloGameApi = {
    start: async (quizId: string, guestNickname?: string): Promise<ISoloGameState> => {
        const response = await apiClient.post('/solo/start', { quizId, guestNickname });
        return response.data;
    },
    getGameState: async (sessionId: string): Promise<ISoloRestoredState> => {
        const response = await apiClient.get(`/solo/${sessionId}/state`);
        return response.data;
    },

    submitAnswer: async (sessionId: string, payload: ISoloAnswerPayload): Promise<ISoloAnswerResponse> => {
        const response = await apiClient.post(`/solo/${sessionId}/answer`, payload);
        return response.data;
    },

    finish: async (sessionId: string): Promise<{ message: string; finalScore: number }> => {
        const response = await apiClient.post(`/solo/${sessionId}/finish`);
        return response.data;
    },
};