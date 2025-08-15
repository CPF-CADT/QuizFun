import { Types } from "mongoose";
import { IQuestion } from "../../model/Quiz";

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

    public addSession(
        roomId: number,
        data: Pick<SessionData, 'quizId' | 'hostId' | 'settings' | 'sessionId'>
    ): void {
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
        console.log(`[GameSession] In-memory session created for room ${roomId} (SessionID: ${data.sessionId}).`);
    }


    public getSession(roomId: number): SessionData | undefined {
        return this.sessions.get(roomId);
    }

    public removeSession(roomId: number): void {
        const room = this.getSession(roomId);
        if (room) {
            if (room.questionTimer) clearTimeout(room.questionTimer);
            if (room.autoNextTimer) clearTimeout(room.autoNextTimer);
            this.sessions.delete(roomId);
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