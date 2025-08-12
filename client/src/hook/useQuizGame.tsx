import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// --- TYPE DEFINITIONS ---
// These types define the shape of the data used throughout the client application.
// They are designed to match the new, more robust backend schema.

export type ParticipantRole = 'host' | 'player';
export type GameStateValue = 'lobby' | 'question' | 'results' | 'end';

export interface Participant {
    user_id: string;
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole;
    hasAnswered: boolean; // True if the player has submitted an answer for the current question
}

export interface QuestionOption {
    text: string;
}

export interface PlayerQuestion {
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: QuestionOption[];
    // The index of the correct answer, provided only in the 'results' state
    correctAnswerIndex?: number;
    // The player's own answer details for the 'results' state
    yourAnswer?: {
        optionIndex: number;
        wasCorrect: boolean;
    };
}

export interface GameState {
    roomId: number | null;
    gameState: GameStateValue;
    participants: Participant[];
    currentQuestionIndex: number;
    totalQuestions: number;
    question: PlayerQuestion | null;
    // We now identify the user by a persistent user_id
    yourUserId: string | null;
    error?: string;
}

// --- CONSTANTS ---
const SERVER_URL = 'http://localhost:3000'; // Your backend server URL

// --- INITIAL STATE ---
const initialState: GameState = {
    roomId: null,
    gameState: 'lobby',
    participants: [],
    currentQuestionIndex: -1,
    totalQuestions: 0,
    question: null,
    yourUserId: null,
    error: undefined,
};

/**
 * A custom React hook to manage the state and communication for the quiz game.
 */
export const useQuizGame = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>(initialState);

    // Effect for initializing and managing the socket connection
    useEffect(() => {
        // Attempt to retrieve user session from sessionStorage for reconnection
        const storedRoomId = sessionStorage.getItem('quizRoomId');
        const storedUserId = sessionStorage.getItem('quizUserId');
        
        // Connect to the server
        const newSocket = io(SERVER_URL, {
            // The query is used by the backend to identify the user upon connection,
            // which is essential for the reconnection logic.
            query: {
                roomId: storedRoomId,
                userId: storedUserId,
            }
        });
        setSocket(newSocket);

        // --- Socket Event Listeners ---

        // 'game-update' is the primary event for receiving state changes from the server
        newSocket.on('game-update', (newState: GameState) => {
            console.log('Received game-update:', newState);
            setGameState(newState);
            // Persist session info to allow for reconnection on page refresh
            if (newState.roomId && newState.yourUserId) {
                sessionStorage.setItem('quizRoomId', newState.roomId.toString());
                sessionStorage.setItem('quizUserId', newState.yourUserId);
            }
        });

        // 'error-message' handles any errors sent from the server
        newSocket.on('error-message', (message: string) => {
            // In a real app, you might use a toast notification library here
            alert(`Error: ${message}`);
            // Reset state if a critical error occurs (e.g., room not found)
            setGameState(initialState);
            sessionStorage.removeItem('quizRoomId');
            sessionStorage.removeItem('quizUserId');
        });

        // Cleanup function to run when the component unmounts
        return () => {
            newSocket.off('game-update');
            newSocket.off('error-message');
            newSocket.disconnect();
        };
    }, []); // This effect runs only once on component mount

    // --- Game Action Emitters ---
    // These functions are wrapped in useCallback to prevent unnecessary re-renders.

    const createRoom = useCallback((data: { quizId: string; hostName: string; userId: string }) => {
        socket?.emit('create-room', data);
    }, [socket]);

    const joinRoom = useCallback((data: { roomId: number; username: string; userId: string }) => {
        socket?.emit('join-room', data);
    }, [socket]);

    const startGame = useCallback((roomId: number) => {
        socket?.emit('start-game', roomId);
    }, [socket]);

    const submitAnswer = useCallback((data: { roomId: number; userId: string; optionIndex: number }) => {
        // This event can be emitted multiple times if the user changes their answer.
        // The backend will handle overwriting the previous selection.
        socket?.emit('submit-answer', data);
    }, [socket]);

    const requestNextQuestion = useCallback((roomId: number) => {
        socket?.emit('request-next-question', roomId);
    }, [socket]);

    // Function to reset the game state and clear session storage
    const resetGame = useCallback(() => {
        sessionStorage.removeItem('quizRoomId');
        sessionStorage.removeItem('quizUserId');
        setGameState(initialState);
        // Optionally, you can force a reconnect to get a fresh start
        socket?.disconnect();
        socket?.connect();
    }, [socket]);

    return {
        gameState,
        createRoom,
        joinRoom,
        startGame,
        submitAnswer,
        requestNextQuestion,
        resetGame,
    };
};
