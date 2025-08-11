import { Server, Socket } from "socket.io";
import { GameSessionManager, Participant, SessionData, GameState } from "../../config/data/GameSession";
import { IQuestion } from "../../model/Quiz";

// Define a specific type for the question data sent to players
interface PlayerQuestion {
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: { text: string }[];
    correctAnswerIndex?: number; // Optional, only sent during the 'results' phase
}

// Define the shape of the state object sent to players
interface PlayerState {
    roomId: number;
    gameState: GameState;
    participants: Participant[];
    currentQuestionIndex: number;
    totalQuestions: number;
    error?: string;
    question: PlayerQuestion | null;
    yourSocketId: string;
}

// Define the shape of the state object sent to the host
interface HostState extends Omit<PlayerState, 'question'> {
    question: IQuestion | null;
}


/**
 * Sanitizes and sends the current game state to all participants in a room.
 * Hosts receive the full state, while players receive a version with sensitive data removed.
 */
export function broadcastGameState(io: Server, roomId: number, errorMessage?: string) {
    const room = GameSessionManager.getSession(roomId);
    if (!room) return;

    // Create a base state object
    const baseState = {
        roomId: roomId,
        gameState: room.gameState,
        participants: room.participants,
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions: room.questions?.length || 0,
        error: errorMessage,
    };

    // --- Prepare Host State (Full data) ---
    const hostState: Omit<HostState, 'yourSocketId'> = {
        ...baseState,
        question: room.questions ? room.questions[room.currentQuestionIndex] : null,
    };

    // --- Prepare Player State (Sanitized data) ---
    const playerState: Omit<PlayerState, 'yourSocketId'> = { ...baseState, question: null };
    if (room.questions && room.currentQuestionIndex >= 0) {
        const currentQuestion = room.questions[room.currentQuestionIndex];
        
        // Players get the question text and options, but not the answer
        const sanitizedQuestion: PlayerQuestion = {
            questionText: currentQuestion.questionText,
            point: currentQuestion.point,
            timeLimit: currentQuestion.timeLimit,
            imageUrl: currentQuestion.imageUrl,
            options: currentQuestion.options.map(opt => ({ text: opt.text })), // Remove isCorrect flag
        };

        // In the results phase, add the correct answer index
        if (room.gameState === 'results') {
            sanitizedQuestion.correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
        }

        playerState.question = sanitizedQuestion;
    }

    // Broadcast the appropriate state to each participant
    room.participants.forEach(p => {
        const stateToSend = p.role === 'host' ? { ...hostState, yourSocketId: p.socket_id } : { ...playerState, yourSocketId: p.socket_id };
        io.to(p.socket_id).emit('game-update', stateToSend);
    });

    // Start a server-side timer for the question round
    if (room.gameState === 'question' && !room.questionTimer && room.questions) {
        const timeLimit = room.questions[room.currentQuestionIndex].timeLimit;
        room.questionTimer = setTimeout(() => {
            endRound(io, roomId);
        }, timeLimit * 1000);
    }
}

// --- Disconnect Handler ---
export function handleDisconnect(socket: Socket,io: Server) {
    const sessionInfo = GameSessionManager.getSessionBySocketId(socket.id);
    if (sessionInfo) {
        const { roomId, session } = sessionInfo;
        const disconnectedUser = session.participants.find(p => p.socket_id === socket.id);

        if (disconnectedUser) {
            console.log(`User ${disconnectedUser.user_name} (${socket.id}) disconnected from room ${roomId}.`);
            if (disconnectedUser.role === 'host') {
                console.log(`Host disconnected. Ending game in room ${roomId}.`);
                broadcastGameState(io, roomId, "The host has disconnected. The game has ended.");
                GameSessionManager.removeSession(roomId);
            } else {
                disconnectedUser.isOnline = false;
                broadcastGameState(io, roomId);
            }
        }
    }
}

// Dummy endRound function to avoid circular dependency errors in this file's context
function endRound(io: Server, roomId: number) {
    // This uses require() to lazily import and break the circular dependency between game.ts and shared.ts
    const { endRound: actualEndRound } = require('./game');
    actualEndRound(io, roomId);
}
