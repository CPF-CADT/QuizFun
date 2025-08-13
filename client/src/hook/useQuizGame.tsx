import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// --- TYPE DEFINITIONS ---

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

export interface GameState {
    roomId: number | null;
    gameState: GameStateValue;
    participants: Participant[];
    currentQuestionIndex: number;
    totalQuestions: number;
    question: PlayerQuestion | null;
    yourUserId: string | null;
    isFinalResults: boolean;
    settings: GameSettings;
    // An array where the index corresponds to the option index, and the value is the count of players who chose it.
    answerCounts?: number[];
    // The server timestamp when the current question was sent. Used for the countdown timer.
    questionStartTime?: number;
    error?: string;
}

// --- CONSTANTS ---
const SERVER_URL = 'http://localhost:3000';

// --- INITIAL STATE ---
const initialState: GameState = {
    roomId: null,
    gameState: 'lobby',
    participants: [],
    currentQuestionIndex: -1,
    totalQuestions: 0,
    question: null,
    yourUserId: null,
    isFinalResults: false,
    settings: {
        autoNext: true,
        allowAnswerChange: true,
    },
    error: undefined,
};

/**
 * A custom React hook to manage the state and communication for the quiz game.
 */
export const useQuizGame = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>(initialState);

    useEffect(() => {
        const storedRoomId = sessionStorage.getItem('quizRoomId');
        const storedUserId = sessionStorage.getItem('quizUserId');
        
        const newSocket = io(SERVER_URL, {
            query: { roomId: storedRoomId, userId: storedUserId }
        });
        setSocket(newSocket);

        newSocket.on('game-update', (newState: GameState) => {
            console.log('Received game-update:', newState);
            setGameState(newState);
            if (newState.roomId && newState.yourUserId) {
                sessionStorage.setItem('quizRoomId', newState.roomId.toString());
                sessionStorage.setItem('quizUserId', newState.yourUserId);
            }
        });

        newSocket.on('error-message', (message: string) => {
            alert(`Error: ${message}`);
            setGameState(initialState);
            sessionStorage.removeItem('quizRoomId');
            sessionStorage.removeItem('quizUserId');
        });

        return () => {
            newSocket.off('game-update');
            newSocket.off('error-message');
            newSocket.disconnect();
        };
    }, []);

    // --- Game Action Emitters ---

    const createRoom = useCallback((data: { quizId: string; hostName: string; userId: string; settings: GameSettings }) => {
        socket?.emit('create-room', data);
    }, [socket]);

    const joinRoom = useCallback((data: { roomId: number; username: string; userId: string }) => {
        socket?.emit('join-room', data);
    }, [socket]);

    const startGame = useCallback((roomId: number) => {
        socket?.emit('start-game', roomId);
    }, [socket]);

    const submitAnswer = useCallback((data: { roomId: number; userId: string; optionIndex: number }) => {
        socket?.emit('submit-answer', data);
    }, [socket]);

    const requestNextQuestion = useCallback((roomId: number) => {
        socket?.emit('request-next-question', roomId);
    }, [socket]);

    const playAgain = useCallback((roomId: number) => {
        socket?.emit('play-again', roomId);
    }, [socket]);

    const endGame = useCallback(() => {
        sessionStorage.removeItem('quizRoomId');
        sessionStorage.removeItem('quizUserId');
        setGameState(initialState);
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
        playAgain,
        endGame,
    };
};
    