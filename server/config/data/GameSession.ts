import { Types } from "mongoose";
import { IQuestion } from "../../model/Quiz";
import { promises } from "dns";
import Redis from "ioredis";
const redis = new Redis()

export type ParticipantRole = 'host' | 'player';
export type GameState = 'lobby' | 'question' | 'results' | 'end';

export interface GameSettings {
    autoNext: boolean;
    allowAnswerChange: boolean;
}

export interface Participant {
    socket_id: string;
    user_id?: string; 
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole;
    hasAnswered: boolean;
}

export interface PlayerAnswer {
    optionIndex: number;
    remainingTime: number;
    isCorrect: boolean;
}

export interface SessionData {
    sessionId: string;
    quizId: string;
    hostId: string;
    participants: Participant[];
    questions?: IQuestion[];
    currentQuestionIndex: number;
    answers: Map<string, PlayerAnswer[]>;
    questionTimer?: NodeJS.Timeout;
    autoNextTimer?: NodeJS.Timeout;
    gameState: GameState;
    isFinalResults: boolean;
    settings: GameSettings;
    answerCounts: number[];
    questionStartTime?: number;
}

export interface SanitizedQuestionOption {
    text: string;
}

export interface SanitizedQuestion {
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: SanitizedQuestionOption[];
}

// The question structure when results are shown, including answer details.
export interface ResultsQuestion extends SanitizedQuestion {
    correctAnswerIndex: number;
    yourAnswer?: {
        optionIndex: number;
        wasCorrect: boolean;
    };
}

export interface GameStatePayload {
    sessionId: string;
    roomId: number;
    gameState: GameState;
    participants: Participant[];
    currentQuestionIndex: number;
    totalQuestions: number;
    isFinalResults: boolean;
    settings: GameSettings;
    questionStartTime?: number;
    answerCounts: number[];
    error?: string;
    question: SanitizedQuestion | ResultsQuestion | null;
    yourUserId?: string;
}

class Manager {
    private sessions: Map<number, SessionData> = new Map();

    public async addSession(
        roomId: number,
        data: Pick<SessionData, 'quizId' | 'hostId' | 'settings' | 'sessionId'>
    ):Promise<void> {
        const session: SessionData = {
            ...data,
            participants: [],
            currentQuestionIndex: -1,
            answers: new Map(),
            gameState: 'lobby',
            isFinalResults: false,
            answerCounts: [],
        };
        this.sessions.set(roomId, session);
        await redis.set(`session= ${roomId}`,JSON.stringify(session));
        console.log(`[GameSession] In-memory session created for room ${roomId} (SessionID: ${data.sessionId}).`);
    }



    public  async getSession(roomId: number): Promise<SessionData | undefined > {
        const local = this.sessions.get(roomId);
        if(local) return local;
        const redisData = await redis.get(`room session${roomId}`);
        if(redisData){
            return JSON.parse(redisData) as SessionData;
        }
        return undefined;
    }

    public async removeSession(roomId: number): Promise<void> {
        const room = this.getSession(roomId);
        if (room) {
            if ((await room)?.questionTimer) clearTimeout((await room)?.questionTimer);
            if ((await room)?.autoNextTimer) clearTimeout((await room)?.autoNextTimer);
            this.sessions.delete(roomId);
            await redis.del(`sessionId:${roomId}`)
            console.log(`[GameSession] Room ${roomId} removed.`);
        }
    }

    public findSessionBySocketId(
        socketId: string
    ): { roomId: number; session: SessionData } | undefined {
        for (const [roomId, session] of this.sessions.entries()) {
            if (session.participants.some(p => p.socket_id === socketId)) {
                return { roomId, session };
            }
        }
        return undefined;
    }
}

export const GameSessionManager = new Manager();