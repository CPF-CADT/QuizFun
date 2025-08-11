import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type ParticipantRole = 'host' | 'player';
export type GameStateValue = 'lobby' | 'question' | 'results' | 'end';

export interface Participant {
    socket_id: string;
    user_id: string;
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole;
    answered: boolean;
}

export interface Question {
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: { text: string; isCorrect?: boolean }[];
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
    question: Question | null;
    yourSocketId: string | null;
    error?: string;
}

const SERVER_URL = 'http://localhost:3000'; 

const initialState: GameState = {
    roomId: null,
    gameState: 'lobby',
    participants: [],
    currentQuestionIndex: -1,
    totalQuestions: 0,
    question: null,
    yourSocketId: null,
    error: undefined,
};

export const useQuizGame = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>(initialState);

    useEffect(() => {
        const newSocket = io(SERVER_URL);
        setSocket(newSocket);

        newSocket.on('game-update', (newState: GameState) => {
            console.log('Received game-update:', newState);
            setGameState(newState);
            if (newState.yourSocketId) {
                sessionStorage.setItem('socketId', newState.yourSocketId);
            }
        });

        newSocket.on('error-message', (message: string) => {
            alert(`Error: ${message}`);
        });

        return () => {
            newSocket.off('game-update');
            newSocket.off('error-message');
            newSocket.disconnect();
        };
    }, []); 

    const createRoom = useCallback((data: { quizId: string; hostId: string; hostName: string }) => {
        socket?.emit('create-room', data);
    }, [socket]);

    const joinRoom = useCallback((data: { roomId: number; username: string; user_id: string }) => {
        socket?.emit('join-room', data);
    }, [socket]);

    const startGame = useCallback((roomId: number) => {
        socket?.emit('start-game', roomId);
    }, [socket]);

    const rejoinGame = useCallback((data: { roomId: number, oldSocketId: string }) => {
        socket?.emit('rejoin-game', data);
    }, [socket]);

    const submitAnswer = useCallback((data: { roomId: number; optionIndex: number }) => {
        socket?.emit('submit-answer', data);
    }, [socket]);

    const requestNextQuestion = useCallback((roomId: number) => {
        socket?.emit('request-next-question', roomId);
    }, [socket]);

    const resetGame = useCallback(() => {
        setGameState(initialState);
    }, []);

    return {
        gameState,
        createRoom,
        joinRoom,
        startGame,
        rejoinGame,
        submitAnswer,
        requestNextQuestion,
        resetGame,
    };
};
