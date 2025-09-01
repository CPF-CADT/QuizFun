import { IQuestion } from "../../model/Quiz";
import redisClient from "../redis";

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
    teamId?: string; 
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
        data: Pick<SessionData, 'quizId' | 'hostId' | 'settings' | 'sessionId' | 'teamId'>
    ): Promise<void> {
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
        await redisClient.set(`session:${roomId}`, JSON.stringify(session));
        console.log(`[GameSession] In-memory session created for room ${roomId} (SessionID: ${data.sessionId}).`);
    }

    public async getSession(roomId: number): Promise<SessionData | undefined > {
        const local = this.sessions.get(roomId);
        if (local) return local;
        
        const redisData = await redisClient.get(`session=${roomId}`); 
        if (redisData) {
            const parsedData = JSON.parse(redisData) as SessionData;
            parsedData.answers = new Map(Object.entries(parsedData.answers));
            return parsedData;
        }
        return undefined;
    }

    public async removeSession(roomId: number): Promise<void> {
        const room = await this.getSession(roomId);
        if (room) {
            if (room.questionTimer) clearTimeout(room.questionTimer);
            if (room.autoNextTimer) clearTimeout(room.autoNextTimer);
            this.sessions.delete(roomId);
            await redisClient.del(`session=${roomId}`); // Note: Fixed key to match
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
    public getAllSessions(): { roomId: number; session: SessionData }[] {
    return Array.from(this.sessions.entries(), ([roomId, session]) => ({
        roomId,
        session,
    }));
}
}

export const GameSessionManager = new Manager();
