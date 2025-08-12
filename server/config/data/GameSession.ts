import { IQuestion } from "../../model/Quiz";

// --- TYPE DEFINITIONS ---

export type ParticipantRole = 'host' | 'player';
export type GameState = 'lobby' | 'question' | 'results' | 'end';

export interface GameSettings {
    autoNext: boolean;
    allowAnswerChange: boolean;
}

export interface Participant {
    socket_id: string;
    user_id: string;
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole;
    hasAnswered: boolean;
}

export interface SessionData {
    quizId: string;
    hostId: string;
    participants: Participant[];
    questions?: IQuestion[];
    currentQuestionIndex: number;
    answers: Map<string, number>;
    questionTimer?: NodeJS.Timeout;
    autoNextTimer?: NodeJS.Timeout;
    gameState: GameState;
    isFinalResults: boolean;
    settings: GameSettings;
    answerCounts: number[];
    questionStartTime?: number;
}

/**
 * Manages all active game sessions in memory.
 */
class Manager {
    private sessions: Map<number, SessionData> = new Map();

    public addSession(roomId: number, data: Pick<SessionData, 'quizId' | 'hostId' | 'settings'>) {
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
        console.log(`[GameSession] Room ${roomId} created with settings:`, data.settings);
    }

    public getSession(roomId: number): SessionData | undefined {
        return this.sessions.get(roomId);
    }

    public removeSession(roomId: number) {
        const room = this.getSession(roomId);
        if (room) {
            if (room.questionTimer) clearTimeout(room.questionTimer);
            if (room.autoNextTimer) clearTimeout(room.autoNextTimer);
            this.sessions.delete(roomId);
            console.log(`[GameSession] Room ${roomId} removed.`);
        }
    }

    public findSessionBySocketId(socketId: string): { roomId: number, session: SessionData } | undefined {
        for (const [roomId, session] of this.sessions.entries()) {
            if (session.participants.some(p => p.socket_id === socketId)) {
                return { roomId, session };
            }
        }
        return undefined;
    }
}

export const GameSessionManager = new Manager();
