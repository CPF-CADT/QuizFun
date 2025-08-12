import { IQuestion } from "../../model/Quiz"; // Assuming this is your Mongoose schema type

// --- TYPE DEFINITIONS ---
// These types define the data structures for managing game state on the server.

export type ParticipantRole = 'host' | 'player';
export type GameState = 'lobby' | 'question' | 'results' | 'end';

export interface Participant {
    socket_id: string;      // The current socket ID, which can change on reconnection
    user_id: string;        // The persistent unique identifier for the user
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole;
    hasAnswered: boolean;   // Tracks if a player has submitted an answer for the current question
}

export interface SessionData {
    quizId: string;
    hostId: string;         // The user_id of the host
    participants: Participant[];
    questions?: IQuestion[];
    currentQuestionIndex: number;
    // Maps user_id to their chosen option index for the current question
    answers: Map<string, number>; 
    questionTimer?: NodeJS.Timeout;
    gameState: GameState;
}

/**
 * Manages all active game sessions in memory.
 * This class is a singleton, meaning only one instance is used across the application.
 */
class Manager {
    // A Map to store all active game sessions, with the room ID as the key.
    private sessions: Map<number, SessionData> = new Map();

    /**
     * Creates and adds a new game session.
     * @param roomId The unique ID for the new room.
     * @param data Initial data for the session.
     */
    public addSession(roomId: number, data: Pick<SessionData, 'quizId' | 'hostId'>) {
        const session: SessionData = {
            ...data,
            participants: [],
            currentQuestionIndex: -1,
            answers: new Map(),
            gameState: 'lobby', // Initial state is always the lobby
        };
        this.sessions.set(roomId, session);
        console.log(`[GameSession] Room ${roomId} created.`);
    }

    /**
     * Retrieves a session by its room ID.
     * @param roomId The ID of the room to retrieve.
     * @returns The session data, or undefined if not found.
     */
    public getSession(roomId: number): SessionData | undefined {
        return this.sessions.get(roomId);
    }

    /**
     * Removes a session from the manager, clearing any active timers.
     * @param roomId The ID of the room to remove.
     */
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

    /**
     * Finds a user's session information based on their socket ID.
     * This is primarily used during disconnect events.
     * @param socketId The socket ID of the user.
     * @returns An object with the roomId and session data, or undefined if not found.
     */
    public findSessionBySocketId(socketId: string): { roomId: number, session: SessionData } | undefined {
        for (const [roomId, session] of this.sessions.entries()) {
            if (session.participants.some(p => p.socket_id === socketId)) {
                return { roomId, session };
            }
        }
        return undefined;
    }
}

// Export a singleton instance so the entire application uses the same game manager.
export const GameSessionManager = new Manager();
