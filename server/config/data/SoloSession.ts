// src/config/data/SoloSession.ts 

import redisClient from '../redis'; 
import { IQuiz } from '../../model/Quiz'; 

const SOLO_SESSION_TTL =  20 * 60; // 2 hours

export interface SoloGameState {
    sessionId: string;
    userId?: string;
    guestNickname?: string;
    quiz: IQuiz;
    currentQuestionIndex: number;
    questionStartTime: number; 
    score: number;
    answers: {
        questionId: string;
        optionId: string;
        isCorrect: boolean;
        scoreGained: number;
    }[];
}

class SoloSessionManager {
    private getCacheKey(sessionId: string): string {
        return `solo-session:${sessionId}`;
    }

    async addSession(sessionId: string, gameState: SoloGameState): Promise<void> {
        const key = this.getCacheKey(sessionId);
        await redisClient.set(key, JSON.stringify(gameState), {
            EX: SOLO_SESSION_TTL,
        });
        console.log(`[SoloCache] Started and cached session ${sessionId}`);
    }

    async getSession(sessionId: string): Promise<SoloGameState | null> {
        const key = this.getCacheKey(sessionId);
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }
    async updateSession(sessionId: string, updatedState: SoloGameState): Promise<void> {
        const key = this.getCacheKey(sessionId);
        // Use SET with KEEPTTL to update without changing the expiration time
        await redisClient.set(key, JSON.stringify(updatedState), {
            KEEPTTL: true,
        });
    }

    async removeSession(sessionId: string): Promise<void> {
        const key = this.getCacheKey(sessionId);
        await redisClient.del(key);
        console.log(`[SoloCache] Removed session ${sessionId}`);
    }
}

export const soloSessionManager = new SoloSessionManager();