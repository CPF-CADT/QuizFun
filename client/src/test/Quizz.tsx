import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuizGame, type GameState, type GameSettings } from '../hook/useQuizGame';

const generateGuestId = () => `guest_${Math.random().toString(36).substring(2, 10)}`;

// --- Sub-Components for Different Game Views ---

const LobbyView: React.FC<{ gameState: GameState; onStartGame: () => void; }> = ({ gameState, onStartGame }) => {
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
    const { question, participants, yourUserId, settings, questionStartTime } = gameState;
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    // The answer is locked if the player has answered AND the game settings disallow changing answers.
    const answerLocked = me?.hasAnswered && !settings.allowAnswerChange;

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
                        // Disable buttons if the user is a host or if their answer is locked
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
            const interval = setInterval(() => setTimer(prev => Math.max(0, prev - 1)), 1000);
            return () => clearInterval(interval);
        }
    }, [gameState.currentQuestionIndex, settings.autoNext]);

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

const FinalScoreView: React.FC<{ gameState: GameState; onPlayAgain: () => void; onEndGame: () => void; }> = ({ gameState, onPlayAgain, onEndGame }) => {
    const { participants, yourUserId } = gameState;
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const sortedPlayers = useMemo(() =>
        [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score),
        [gameState.participants]
    );

    return (
        <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl text-white text-center">
            <h1 className="text-5xl font-bold mb-4">Final Leaderboard</h1>
            <ul className="space-y-2 mb-8">
                {sortedPlayers.map((p, index) => (
                    <li key={p.user_id} className={`flex justify-between p-4 rounded-md text-xl font-bold ${index === 0 ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700'}`}>
                        <span>🏆 #{index + 1} {p.user_name}</span>
                        <span>{p.score} pts</span>
                    </li>
                ))}
            </ul>
            {isHost ? (
                <div className="flex space-x-4">
                    <button onClick={onPlayAgain} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
                        Play Again
                    </button>
                    <button onClick={onEndGame} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors">
                        End Game
                    </button>
                </div>
            ) : (
                 <p className="text-center text-gray-400 animate-pulse">Game Over! Waiting for host...</p>
            )}
        </div>
    );
};

// --- Main Game Component ---

interface QuizGameProps {
    gameState: GameState;
    startGame: (roomId: number) => void;
    submitAnswer: (data: { roomId: number; userId: string; optionIndex: number }) => void;
    requestNextQuestion: (roomId: number) => void;
    playAgain: (roomId: number) => void;
    endGame: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ gameState, startGame, submitAnswer, requestNextQuestion, playAgain, endGame }) => {
    const handleStartGame = useCallback(() => {
        if (gameState.roomId) startGame(gameState.roomId);
    }, [gameState.roomId, startGame]);

    const handleSubmitAnswer = useCallback((optionIndex: number) => {
        if (gameState.roomId && gameState.yourUserId) {
            submitAnswer({ roomId: gameState.roomId, userId: gameState.yourUserId, optionIndex });
        }
    }, [gameState.roomId, gameState.yourUserId, submitAnswer]);

    const handleNextQuestion = useCallback(() => {
        if (gameState.roomId) requestNextQuestion(gameState.roomId);
    }, [gameState.roomId, requestNextQuestion]);

    const handlePlayAgain = useCallback(() => {
        if (gameState.roomId) playAgain(gameState.roomId);
    }, [gameState.roomId, playAgain]);

    switch (gameState.gameState) {
        case 'lobby':
            return <LobbyView gameState={gameState} onStartGame={handleStartGame} />;
        case 'question':
            return <QuestionView gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
        case 'results':
            return <ResultsView gameState={gameState} onNextQuestion={handleNextQuestion} />;
        case 'end':
            return <FinalScoreView gameState={gameState} onPlayAgain={handlePlayAgain} onEndGame={endGame} />;
        default:
            return <div className="text-white text-2xl">Connecting...</div>;
    }
};

// --- Game Entry Point ---

const Game: React.FC = () => {
    const { gameState, createRoom, joinRoom, startGame, submitAnswer, requestNextQuestion, playAgain, endGame } = useQuizGame();
    const [view, setView] = useState<'menu' | 'join' | 'create'>('menu');
    const [isConnecting, setIsConnecting] = useState(false);
    
    const [hostName, setHostName] = useState('');
    const [quizId, setQuizId] = useState('');
    const [username, setUsername] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [settings, setSettings] = useState<GameSettings>({ autoNext: true, allowAnswerChange: true });
    
    const [userId] = useState(() => {
        let id = localStorage.getItem('quizUserId');
        if (!id) {
            id = generateGuestId();
            localStorage.setItem('quizUserId', id);
        }
        return id;
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hostName && quizId && userId) {
            setIsConnecting(true);
            createRoom({ quizId, hostName, userId, settings });
        }
    };

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username && joinRoomId && userId) {
            setIsConnecting(true);
            joinRoom({ roomId: parseInt(joinRoomId), username, userId });
        }
    };

    if (gameState.roomId) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <QuizGame 
                    gameState={gameState} 
                    startGame={startGame} 
                    submitAnswer={submitAnswer} 
                    requestNextQuestion={requestNextQuestion} 
                    playAgain={playAgain}
                    endGame={endGame} 
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
                <input type="text" placeholder="Enter your name (Host)" value={hostName} onChange={(e) => setHostName(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
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
                <input type="text" placeholder="Enter your name" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
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
