import { IQuestion } from "../../model/Quiz";

// Describes the role of a participant in the game
export type ParticipantRole = 'host' | 'player';

// Describes a single player or the host in the game
export interface Participant {
    socket_id: string;
    user_id: string;
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole; // Added role
    answered: boolean; // Added to track if player has answered the current question
}

// Describes the different states the game can be in
export type GameState = 'lobby' | 'question' | 'results' | 'end';

// Describes the entire state of a single game room
export interface SessionData {
    quizId: string;
    hostId: string;
    host_socket_id: string;
    participants: Participant[];
    questions?: IQuestion[];
    currentQuestionIndex: number;
    answers: Map<string, number>; // Maps socket_id to optionIndex
    questionTimer?: NodeJS.Timeout;
    gameState: GameState; // Added game state
}

class Manager {
    // Use a Map to store all active game sessions, with the room ID as the key.
    private sessions: Map<number, SessionData> = new Map();

    public addSession(roomId: number, data: Omit<SessionData, 'answers' | 'currentQuestionIndex' | 'participants' | 'gameState'>) {
        const session: SessionData = {
            ...data,
            participants: [],
            currentQuestionIndex: -1,
            answers: new Map(),
            gameState: 'lobby', // Initial state is the lobby
        };
        this.sessions.set(roomId, session);
        console.log(`[GameSession] Room ${roomId} created.`);
    }

    public getSession(roomId: number): SessionData | undefined {
        return this.sessions.get(roomId);
    }

    public removeSession(roomId: number) {
        const room = this.getSession(roomId);
        if (room) {
            if (room.questionTimer) {
                clearTimeout(room.questionTimer);
            }
            this.sessions.delete(roomId);
            console.log(`[GameSession] Room ${roomId} removed.`);
        }
    }

    public getSessionBySocketId(socketId: string): { roomId: number, session: SessionData } | undefined {
        for (const [roomId, session] of this.sessions.entries()) {
            if (session.participants.some(p => p.socket_id === socketId)) {
                return { roomId, session };
            }
        }
        return undefined;
    }
}

// Export a singleton instance so the whole app uses the same manager
export const GameSessionManager = new Manager();
