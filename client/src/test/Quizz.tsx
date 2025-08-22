import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
// --- TYPE DEFINITIONS ---
// These types should align perfectly with your backend API responses.
export type ParticipantRole = 'host' | 'player';
export type GameStateValue = 'lobby' | 'question' | 'results' | 'end' | 'connecting';

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
    sessionId: string | null; // The unique DB identifier for the session
    roomId: number | null;    // The short, numeric join code
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
    finalResults: ResultsPayload | null;
}

// --- CONSTANTS & INITIAL STATE ---

const SERVER_URL = 'http://localhost:3000';
const generateGuestId = () => `guest_${Math.random().toString(36).substring(2, 10)}`;

const initialState: GameState = {
    sessionId: null, // ⭐️ Initialize sessionId
    roomId: null,
    gameState: 'connecting',
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

    // Centralized ID and Socket management
    useEffect(() => {
        const newSocket = io(SERVER_URL, {
            autoConnect: true,
            reconnection: true,
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected with ID:', newSocket.id);
            // On fresh connect, try to rejoin if session data exists
            const storedRoomId = sessionStorage.getItem('quizRoomId');
            const storedUserId = sessionStorage.getItem('quizUserId');
            // ⭐️ Also check for sessionId for better reconnection logic if needed
            // const storedSessionId = sessionStorage.getItem('quizSessionId');

            if (storedRoomId && storedUserId) {
                newSocket.emit('rejoin-game', { 
                    roomId: parseInt(storedRoomId), 
                    userId: storedUserId,
                });
            }
        });

        newSocket.on('game-update', (newState: Partial<GameState>) => {
            console.log('Received game-update:', newState);
            setGameState(prev => ({ ...prev, ...newState, error: undefined }));
            
            // Store all relevant info for reconnection
            if (newState.sessionId) {
                sessionStorage.setItem('quizSessionId', newState.sessionId);
            }
            if (newState.roomId) {
                sessionStorage.setItem('quizRoomId', newState.roomId.toString());
            }
            if (newState.yourUserId) {
                sessionStorage.setItem('quizUserId', newState.yourUserId);
            }
        });

        newSocket.on('error-message', (message: string) => {
            console.error(`Received error: ${message}`);
            alert(`Error: ${message}`);
            setGameState(prev => ({...prev, error: message, roomId: null, gameState: 'lobby' }));
            // Clear all session data on critical error
            sessionStorage.removeItem('quizRoomId');
            sessionStorage.removeItem('quizUserId');
            sessionStorage.removeItem('quizSessionId');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    /**
     * ⭐️ UPDATED: Fetches results using the unique string `sessionId`.
     */
    const fetchFinalResults = useCallback(async (sessionId: string) => {
        const userId = sessionStorage.getItem('quizUserId');
        
        if (!userId) {
            alert("Could not identify user to fetch results.");
            return;
        }
        if (!sessionId) {
            alert("Session ID is missing, cannot fetch results.");
            return;
        }

        try {
            const response = await fetch(`${SERVER_URL}/api/session/${sessionId}/results?userId=${userId}`);
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const data: ResultsPayload = await response.json();
            setGameState(prev => ({ ...prev, finalResults: data }));
        } catch (error) {
            console.error("Failed to fetch final results:", error);
            alert("Error: Could not load game results.");
        }
    }, []);

    const createRoom = useCallback((data: { quizId: string; hostName: string; userId: string; settings: GameSettings }) => {
        socket?.emit('create-room', data);
    }, [socket]);

    const joinRoom = useCallback((data: { roomId: number; username: string; userId: string }) => {
        socket?.emit('join-room', data);
    }, [socket]);
    
    const startGame = useCallback((roomId: number) => socket?.emit('start-game', roomId), [socket]);
    const submitAnswer = useCallback((data: { roomId: number; userId: string; optionIndex: number }) => socket?.emit('submit-answer', data), [socket]);
    const requestNextQuestion = useCallback((roomId: number) => socket?.emit('request-next-question', roomId), [socket]);
    
    const playAgain = useCallback((roomId: number) => {
        // Reset only the game-specific state, keep user info
        setGameState(prev => ({ 
            ...initialState, 
            yourUserId: prev.yourUserId, 
            sessionId: null, // A new session will be created
            gameState: 'lobby' 
        }));
        socket?.emit('play-again', roomId);
    }, [socket]);

    const endGame = useCallback(() => {
        const currentRoomId = gameState.roomId;
        if(socket && currentRoomId) {
            socket.emit('end-game', currentRoomId); // Inform server if needed
        }
        // Clear all session data
        sessionStorage.removeItem('quizRoomId');
        sessionStorage.removeItem('quizUserId');
        sessionStorage.removeItem('quizSessionId');
        setGameState({...initialState, gameState: 'lobby'}); // Reset to initial state
    }, [socket, gameState.roomId]);

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

// --- Sub-Components for Different Game Views ---

const LobbyView: React.FC<{ gameState: GameState; onStartGame: () => void; }> = ({ gameState, onStartGame }) => {
    // ... (No changes needed in this component)
    const { participants, yourUserId, roomId } = gameState;
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const hasPlayers = participants.some(p => p.role === 'player');

    return (
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl text-white">
            <h1 className="text-3xl font-bold text-center mb-2">Game Lobby</h1>
            <p className="text-center text-indigo-400 font-mono mb-6">Room ID: {roomId}</p>
            <h2 className="text-xl font-semibold mb-4">Players ({participants.length})</h2>
            <ul className="space-y-3 h-48 overflow-y-auto mb-6">
                {participants.map(p => (
                    <li key={p.user_id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                        <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 ${p.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            <span className="font-medium">{p.user_name}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.role === 'host' ? 'bg-yellow-500 text-gray-900' : 'bg-blue-500 text-white'}`}>
                            {p.role === 'host' ? 'Host' : 'Player'}
                        </span>
                    </li>
                ))}
            </ul>
            {isHost && (
                <button
                    onClick={onStartGame}
                    disabled={!hasPlayers}
                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    {hasPlayers ? 'Start Game' : 'Waiting for players...'}
                </button>
            )}
            {!isHost && <p className="text-center text-gray-400 animate-pulse">Waiting for the host to start the game...</p>}
        </div>
    );
};

const QuestionTimer: React.FC<{ startTime: number; timeLimit: number }> = ({ startTime, timeLimit }) => {
    // ... (No changes needed in this component)
    const [remaining, setRemaining] = useState(timeLimit);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const newRemaining = Math.max(0, timeLimit - elapsed);
            setRemaining(newRemaining);
        }, 100);

        return () => clearInterval(interval);
    }, [startTime, timeLimit]);

    return (
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-indigo-500">
            {Math.ceil(remaining)}
        </div>
    );
};

const QuestionView: React.FC<{ gameState: GameState; onSubmitAnswer: (index: number) => void; }> = ({ gameState, onSubmitAnswer }) => {
    // ... (No changes needed in this component)
    const { question, participants, yourUserId, settings, questionStartTime } = gameState;
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const answerLocked = !!me?.hasAnswered && !settings.allowAnswerChange;

    const handleOptionClick = (index: number) => {
        if (isHost || answerLocked) return;
        setSelectedOption(index);
        onSubmitAnswer(index);
    };

    if (!question) return <div className="text-center text-xl text-white">Loading question...</div>;

    return (
        <div className="w-full max-w-3xl p-8 bg-gray-800 rounded-lg shadow-xl text-white">
            <div className="flex justify-between items-start mb-4">
                <span className="font-bold text-lg">Question {gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}</span>
                {questionStartTime && <QuestionTimer startTime={questionStartTime} timeLimit={question.timeLimit} />}
                {!isHost && <span className="font-bold text-lg">Score: {me?.score}</span>}
            </div>
            <h1 className="text-3xl font-bold mb-6 text-center">{question.questionText}</h1>

            {answerLocked && !isHost && (
                <p className="text-center text-2xl text-green-400 animate-pulse my-4">Answer locked! Waiting for results...</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt, index) => (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(index)}
                        disabled={isHost || answerLocked}
                        className={`p-4 rounded-lg text-lg text-left transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                            ${isHost ? 'bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-500'}
                            ${selectedOption === index ? 'ring-4 ring-yellow-400' : ''}
                        `}
                    >
                        {opt.text}
                    </button>
                ))}
            </div>
            {isHost && <p className="text-center text-gray-400 mt-6 animate-pulse">Players are answering...</p>}
        </div>
    );
};

const ResultsView: React.FC<{ gameState: GameState; onNextQuestion: () => void; }> = ({ gameState, onNextQuestion }) => {
    // ... (No changes needed in this component)
    const { question, participants, yourUserId, settings, answerCounts } = gameState;
    const [timer, setTimer] = useState(5);

    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const sortedPlayers = useMemo(() =>
        [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score),
        [participants]
    );

    useEffect(() => {
        if (settings.autoNext) {
            setTimer(5);
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        if(isHost) onNextQuestion();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState.currentQuestionIndex, settings.autoNext, isHost, onNextQuestion]);

    if (!question) return null;

    const { correctAnswerIndex, yourAnswer } = question;
    const totalAnswers = answerCounts?.reduce((sum, count) => sum + count, 0) || 0;

    return (
        <div className="w-full max-w-3xl p-8 bg-gray-800 rounded-lg shadow-xl text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Round Over!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {question.options.map((opt, index) => {
                    let style = 'bg-gray-700';
                    if (index === correctAnswerIndex) style = 'bg-green-500 ring-4 ring-white';
                    else if (index === yourAnswer?.optionIndex && !yourAnswer?.wasCorrect) style = 'bg-red-500';
                    const count = answerCounts?.[index] || 0;
                    const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;

                    return (
                        <div key={index} className={`p-4 rounded-lg text-lg text-left relative overflow-hidden ${style}`}>
                            <div className="absolute top-0 left-0 h-full bg-black opacity-20" style={{ width: `${percentage}%` }}></div>
                            <div className="relative flex justify-between">
                                <span>{opt.text}</span>
                                <span className="font-bold">{count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <h2 className="text-2xl font-semibold mb-3">Leaderboard</h2>
            <ul className="space-y-2 mb-8">
                {sortedPlayers.map((p, i) => (
                    <li key={p.user_id} className="flex justify-between bg-gray-700 p-3 rounded-md text-lg">
                        <span>#{i + 1} {p.user_name}</span>
                        <span className="font-bold">{p.score} pts</span>
                    </li>
                ))}
            </ul>
            {isHost && (
                <button onClick={onNextQuestion} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    {settings.autoNext ? `Next Question (${timer}s)` : 'Next Question'}
                </button>
            )}
            {!isHost && settings.autoNext && <p className="text-center text-gray-400 animate-pulse">Next question in {timer}s...</p>}
            {!isHost && !settings.autoNext && <p className="text-center text-gray-400 animate-pulse">Waiting for host...</p>}
        </div>
    );
};

/**
 * ⭐️ UPDATED: GameOverView now shows role-specific button text.
 */
const GameOverView: React.FC<{ onFetchResults: () => void; onPlayAgain: () => void; isHost: boolean; }> = ({ onFetchResults, onPlayAgain, isHost }) => (
    <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl text-white text-center">
        <h1 className="text-5xl font-bold mb-6">🎉 Game Over! 🎉</h1>
        <p className="text-gray-300 mb-8">Great game! Click below to see how everyone did.</p>
        <div className="space-y-4">
            <button onClick={onFetchResults} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors text-lg">
                {isHost ? 'View Final Results' : 'View My Results'}
            </button>
            {isHost && (
                <button onClick={onPlayAgain} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
                    Play Again
                </button>
            )}
        </div>
    </div>
);

const StatBar: React.FC<{ label: string; value: number; max: number; unit: string; color: string }> = ({ label, value, max, unit, color }) => (
    // ... (No changes needed in this component)
    <div>
        <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <span className="text-lg font-bold text-white">{value.toFixed(0)}{unit}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
            <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }}></div>
        </div>
    </div>
);

const AnswerCard: React.FC<{ answer: DetailedAnswer }> = ({ answer }) => (
    // ... (No changes needed in this component)
    <div className={`p-3 rounded-lg border-l-4 ${answer.isUltimatelyCorrect ? 'bg-green-900/40 border-green-500' : 'bg-red-900/40 border-red-500'}`}>
        <p className="font-semibold text-white truncate">Q: {answer.questionId?.questionText || 'Question text not available'}</p>
    </div>
);

const ParticipantDetailView: React.FC<{ result: FinalResultData }> = ({ result }) => (
    // ... (No changes needed in this component)
    <div className="space-y-6">
        <div>
            <h2 className="text-4xl font-extrabold text-white text-center">{result.name}</h2>
            <p className="text-center text-indigo-400 text-2xl font-bold">{result.score} Points</p>
        </div>
        <div className="bg-gray-700/50 p-6 rounded-xl space-y-5">
            <StatBar label="Correct Answers" value={result.percentage} max={100} unit="%" color="bg-green-500" />
            <StatBar label="Avg. Correct Answer Time" value={result.averageTime} max={10} unit="s" color="bg-blue-500" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-3">Answer Breakdown</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {result.detailedAnswers?.map(ans => <AnswerCard key={ans._id} answer={ans} />)}
            </div>
        </div>
    </div>
);

/**
 * ⭐️ UPDATED: GameResultDetails now correctly handles the different views for host and player.
 */
const GameResultDetails: React.FC<{ payload: ResultsPayload; onExit: () => void; onPlayAgain: () => void; isHost: boolean; }> = ({ payload, onExit, onPlayAgain, isHost }) => {
    const { viewType, results } = payload;
    
    // For hosts, start with no selection. For players, auto-select their own result.
    const [selectedParticipant, setSelectedParticipant] = useState<FinalResultData | null>(
        viewType !== 'host' ? results[0] : null
    );

    const sortedResults = useMemo(() => [...results].sort((a,b) => b.score - a.score), [results]);

    // HOST VIEW: Show the full leaderboard first.
    if (viewType === 'host' && !selectedParticipant) {
        return (
            <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl text-white">
                <h1 className="text-3xl font-bold text-center mb-6">Game Results & Ranking</h1>
                <ul className="space-y-3 mb-6">
                    {sortedResults.map((p, index) => (
                        <li key={p.participantId || p.name} onClick={() => setSelectedParticipant(p)}
                            className="flex items-center justify-between bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                            <div className="flex items-center space-x-4">
                                <span className={`text-xl font-bold w-8 text-center ${index === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>#{index + 1}</span>
                                <span className="text-lg font-medium text-white">{p.name}</span>
                            </div>
                            <span className="text-xl font-bold text-indigo-400">{p.score} pts</span>
                        </li>
                    ))}
                </ul>
                <div className="flex space-x-4">
                    <button onClick={onPlayAgain} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
                        Play Again
                    </button>
                    <button onClick={onExit} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors">
                        End Game
                    </button>
                </div>
            </div>
        );
    }

    // DETAIL VIEW: Shown to players immediately, or to hosts after they select a player.
    if (selectedParticipant) {
        return (
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl text-white">
                {viewType === 'host' && (
                    <button onClick={() => setSelectedParticipant(null)} className="text-indigo-400 hover:text-indigo-300 mb-4 font-semibold">&larr; Back to Ranking</button>
                )}
                <ParticipantDetailView result={selectedParticipant} />
                <div className="flex space-x-4 mt-6">
                    {isHost ? (
                        <button onClick={onPlayAgain} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
                            Play Again
                        </button>
                    ) : (
                        <p className="text-center w-full text-gray-400">Waiting for host...</p>
                    )}
                    <button onClick={onExit} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors">
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    return <div className="text-white text-xl">Loading results...</div>;
};


// --- Main Game Component ---
const QuizGame: React.FC<{
    gameState: GameState;
    startGame: (roomId: number) => void;
    submitAnswer: (data: { roomId: number; userId: string; optionIndex: number }) => void;
    requestNextQuestion: (roomId: number) => void;
    playAgain: (roomId: number) => void;
    endGame: () => void;
    fetchFinalResults: (sessionId: string) => void; // ⭐️ Changed to accept string
}> = ({ gameState, startGame, submitAnswer, requestNextQuestion, playAgain, endGame, fetchFinalResults }) => {

    const me = gameState.participants.find(p => p.user_id === gameState.yourUserId);
    const isHost = me?.role === 'host';
    
    const handleStartGame = useCallback(() => { if (gameState.roomId) startGame(gameState.roomId); }, [gameState.roomId, startGame]);
    const handleSubmitAnswer = useCallback((optionIndex: number) => { if (gameState.roomId && gameState.yourUserId) submitAnswer({ roomId: gameState.roomId, userId: gameState.yourUserId, optionIndex }); }, [gameState.roomId, gameState.yourUserId, submitAnswer]);
    const handleNextQuestion = useCallback(() => { if (gameState.roomId) requestNextQuestion(gameState.roomId); }, [gameState.roomId, requestNextQuestion]);
    const handlePlayAgain = useCallback(() => { if (gameState.roomId) playAgain(gameState.roomId); }, [gameState.roomId, playAgain]);
    
    /**
     * ⭐️ UPDATED: Uses the unique `sessionId` from the game state.
     */
    const handleFetchResults = useCallback(() => {
        if (gameState.sessionId) {
            fetchFinalResults(gameState.sessionId);
        } else {
            console.error("Cannot fetch results: Session ID is missing from game state.");
            alert("Error: Could not fetch results because the session ID is missing.");
        }
    }, [gameState.sessionId, fetchFinalResults]);

    if (gameState.finalResults) {
        return <GameResultDetails payload={gameState.finalResults} onExit={endGame} onPlayAgain={handlePlayAgain} isHost={isHost} />;
    }

    switch (gameState.gameState) {
        case 'lobby': return <LobbyView gameState={gameState} onStartGame={handleStartGame} />;
        case 'question': return <QuestionView gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
        case 'results': return <ResultsView gameState={gameState} onNextQuestion={handleNextQuestion} />;
        case 'end': return <GameOverView isHost={isHost} onFetchResults={handleFetchResults} onPlayAgain={handlePlayAgain} />;
        default: return <div className="text-white text-2xl">Connecting...</div>;
    }
};

// --- Game Entry Point ---
const Game: React.FC = () => {
    const { gameState, createRoom, joinRoom, startGame, submitAnswer, requestNextQuestion, playAgain, endGame, fetchFinalResults } = useQuizGame();
    const [view, setView] = useState<'menu' | 'join' | 'create'>('menu');
    const [isConnecting, setIsConnecting] = useState(false);
    const {user,isAuthenticated} = useAuth();
    const [hostName, setHostName] = useState('');
    const [quizId, setQuizId] = useState('');
    const [username, setUsername] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [settings, setSettings] = useState<GameSettings>({ autoNext: true, allowAnswerChange: true });
    
    useEffect(() => {
        if (gameState.error) {
            setIsConnecting(false);
            setView('menu');
        }
        if (gameState.roomId) {
            setIsConnecting(false);
        }
    }, [gameState.error, gameState.roomId]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(user?._id)
        if (quizId && user?._id) {
            setIsConnecting(true);
            console.log('creaete form')
            sessionStorage.removeItem('quizUserId'); // Clear any old guest ID
            createRoom({ quizId, hostName:user.name, userId: user._id, settings });
        }
    };

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!isAuthenticated){
          if (username && joinRoomId) {
              setIsConnecting(true);
              const guestId = generateGuestId();
              joinRoom({ roomId: parseInt(joinRoomId), username, userId: guestId });
          }
        }else{
          if (joinRoomId && user?._id) {
              setIsConnecting(true);
              joinRoom({ roomId: parseInt(joinRoomId), username:user.name, userId: user._id });
          }
        }
    };

    if (gameState.roomId && gameState.gameState !== 'connecting') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <QuizGame 
                    gameState={gameState} 
                    startGame={startGame} 
                    submitAnswer={submitAnswer} 
                    requestNextQuestion={requestNextQuestion} 
                    playAgain={playAgain}
                    endGame={endGame} 
                    fetchFinalResults={fetchFinalResults}
                />
            </div>
        );
    }
    
    if (isConnecting) {
        return (
             <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="text-white text-2xl animate-pulse">Connecting...</div>
            </div>
        );
    }

    // --- Menu and Form Views ---
    const renderMenu = () => (
        <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-xl text-white text-center">
            <h1 className="text-4xl font-bold mb-8">Quiz Game</h1>
            <div className="space-y-4">
                <button onClick={() => setView('create')} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors">Create Game</button>
                <button onClick={() => setView('join')} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-500 transition-colors">Join Game</button>
            </div>
        </div>
    );

    const renderCreateForm = () => (
        <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-xl text-white">
            <h1 className="text-3xl font-bold text-center mb-6">Create a Game</h1>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {
                (!isAuthenticated) && 
                  <input type="text" placeholder="Enter your name (Host)" value={hostName} onChange={(e) => setHostName(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              }
                <input type="text" placeholder="Enter Quiz ID" value={quizId} onChange={(e) => setQuizId(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                
                <div className="space-y-3 pt-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" checked={settings.autoNext} onChange={e => setSettings(s => ({...s, autoNext: e.target.checked}))} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
                        <span>Auto-advance to next question</span>
                    </label>
                     <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" checked={settings.allowAnswerChange} onChange={e => setSettings(s => ({...s, allowAnswerChange: e.target.checked}))} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
                        <span>Allow players to change answer</span>
                    </label>
                </div>

                <button type="submit" className="w-full bg-indigo-600 font-bold py-3 px-4 rounded-md hover:bg-indigo-700 !mt-6">Create</button>
                <button type="button" onClick={() => setView('menu')} className="w-full bg-gray-600 font-bold py-2 px-4 rounded-md hover:bg-gray-500 mt-2">Back</button>
            </form>
        </div>
    );

    const renderJoinForm = () => (
        <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-xl text-white">
            <h1 className="text-3xl font-bold text-center mb-6">Join a Game</h1>
            <form onSubmit={handleJoinSubmit} className="space-y-4">
                {!isAuthenticated &&
                  <input type="text" placeholder="Enter your name" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                }
                <input type="text" placeholder="Enter Room ID" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <button type="submit" className="w-full bg-green-600 font-bold py-2 px-4 rounded-md hover:bg-green-700">Join</button>
                <button type="button" onClick={() => setView('menu')} className="w-full bg-gray-600 font-bold py-2 px-4 rounded-md hover:bg-gray-500 mt-2">Back</button>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            {view === 'menu' && renderMenu()}
            {view === 'create' && renderCreateForm()}
            {view === 'join' && renderJoinForm()}
        </div>
    );
};

export default Game;
