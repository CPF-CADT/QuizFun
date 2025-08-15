import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// --- TYPE DEFINITIONS ---
// These types should align perfectly with your backend API responses.

export type ParticipantRole = 'host' | 'player';
export type GameStateValue = 'lobby' | 'question' | 'results' | 'end';

export interface GameSettings {
    autoNext: boolean;
    allowAnswerChange: boolean;
}

export interface Participant {
    user_id: string;
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole;
    hasAnswered: boolean;
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
    correctAnswerIndex?: number;
    yourAnswer?: {
        optionIndex: number;
        wasCorrect: boolean;
    };
}

// Represents the detailed answer for one question in the results view
export interface DetailedAnswer {
    _id: string;
    isUltimatelyCorrect: boolean;
    questionId: {
        questionText: string;
    };
    // You might need to adjust this based on what your backend sends
    attempts: {
        selectedOptionText?: string;
    }[];
}

// Represents the aggregated results for one participant
export interface FinalResultData {
    participantId?: string;
    name: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    averageTime: number;
    detailedAnswers?: DetailedAnswer[];
}

// The full payload from the /results API endpoint
export interface ResultsPayload {
    viewType: 'host' | 'player' | 'guest';
    results: FinalResultData[];
}

export interface GameState {
    roomId: number | null;
    gameState: GameStateValue;
    participants: Participant[];
    currentQuestionIndex: number;
    totalQuestions: number;
    question: PlayerQuestion | null;
    yourUserId: string | null;
    settings: GameSettings;
    answerCounts?: number[];
    questionStartTime?: number;
    error?: string;
    finalResults: ResultsPayload | null; // Holds the data for the final results screen
}

// --- CONSTANTS & INITIAL STATE ---

const SERVER_URL = 'http://localhost:3000'; // IMPORTANT: Make sure this is your server URL

const initialState: GameState = {
    roomId: null,
    gameState: 'lobby',
    participants: [],
    currentQuestionIndex: -1,
    totalQuestions: 0,
    question: null,
    yourUserId: null,
    settings: { autoNext: true, allowAnswerChange: true },
    error: undefined,
    finalResults: null,
};

/**
 * A custom React hook to manage the state and communication for the quiz game.
 */
export const useQuizGame = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>(initialState);

    useEffect(() => {
        const storedRoomId = sessionStorage.getItem('quizRoomId');
        const storedUserId = localStorage.getItem('quizUserId'); // Persistent for registered users

        const newSocket = io(SERVER_URL, {
            query: { roomId: storedRoomId, userId: storedUserId }
        });
        setSocket(newSocket);

        newSocket.on('game-update', (newState: Partial<GameState>) => {
            console.log('Received game-update:', newState);
            setGameState(prev => ({ ...prev, ...newState }));
            if (newState.roomId && newState.yourUserId) {
                sessionStorage.setItem('quizRoomId', newState.roomId.toString());
                localStorage.setItem('quizUserId', newState.yourUserId);
            }
        });

        newSocket.on('error-message', (message: string) => {
            alert(`Error: ${message}`);
            // Reset logic can be improved here
            sessionStorage.removeItem('quizRoomId');
            sessionStorage.removeItem('quizGuestName');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const fetchFinalResults = useCallback(async (sessionId: number) => {
        const userId = localStorage.getItem('quizUserId');
        const guestName = sessionStorage.getItem('quizGuestName');

        let queryParams = '';
        if (userId && !guestName) { // Assumes a registered user won't have a guestName stored
            queryParams = `?userId=${userId}`;
        } else if (guestName) {
            queryParams = `?guestName=${guestName}`;
        } else {
            alert("Could not identify user to fetch results.");
            return;
        }

        try {
            const response = await fetch(`${SERVER_URL}/api/session/${sessionId}/results${queryParams}`);
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const data: ResultsPayload = await response.json();
            setGameState(prev => ({ ...prev, finalResults: data }));
        } catch (error) {
            console.error("Failed to fetch final results:", error);
            alert("Error: Could not load game results.");
        }
    }, []);

    const createRoom = useCallback((data: { quizId: string; hostName: string; userId: string; settings: GameSettings }) => {
        sessionStorage.removeItem('quizGuestName'); // A host is never a guest
        socket?.emit('create-room', data);
    }, [socket]);

    const joinRoom = useCallback((data: { roomId: number; username: string; userId: string }) => {
        // Assume guest IDs are short random strings, real user IDs are longer (e.g., MongoDB ObjectIds)
        if (data.userId.length < 24) {
            sessionStorage.setItem('quizGuestName', data.username);
        } else {
            sessionStorage.removeItem('quizGuestName');
        }
        socket?.emit('join-room', data);
    }, [socket]);
    
    const startGame = useCallback((roomId: number) => socket?.emit('start-game', roomId), [socket]);
    const submitAnswer = useCallback((data: { roomId: number; userId: string; optionIndex: number }) => socket?.emit('submit-answer', data), [socket]);
    const requestNextQuestion = useCallback((roomId: number) => socket?.emit('request-next-question', roomId), [socket]);
    const playAgain = useCallback((roomId: number) => {
        setGameState(prev => ({ ...prev, finalResults: null, gameState: 'lobby' })); // Reset results view
        socket?.emit('play-again', roomId);
    }, [socket]);

    const endGame = useCallback(() => {
        sessionStorage.removeItem('quizRoomId');
        sessionStorage.removeItem('quizGuestName');
        setGameState(initialState);
        socket?.disconnect();
        setTimeout(() => socket?.connect(), 100); // Reconnect after a short delay
    }, [socket]);

    return {
        gameState,
        createRoom,
        joinRoom,
        startGame,
        submitAnswer,
        requestNextQuestion,
        playAgain,
        endGame,
        fetchFinalResults,
    };
};