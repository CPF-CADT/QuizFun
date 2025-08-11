import React, { useState, useMemo, useCallback } from 'react';
import { useQuizGame, type GameState, type Participant } from '../hook/useQuizGame'; 

const LobbyView: React.FC<{ gameState: GameState; onStartGame: () => void; }> = ({ gameState, onStartGame }) => {
    const { participants, yourSocketId, roomId } = gameState;
    const me = participants.find(p => p.socket_id === yourSocketId);
    const isHost = me?.role === 'host';
    const hasPlayers = participants.some(p => p.role === 'player');

    return (
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl text-white">
            <h1 className="text-3xl font-bold text-center mb-2">Game Lobby</h1>
            <p className="text-center text-indigo-400 font-mono mb-6">Room ID: {roomId}</p>
            <h2 className="text-xl font-semibold mb-4">Players ({participants.length})</h2>
            <ul className="space-y-3 h-48 overflow-y-auto mb-6">
                {participants.map(p => (
                    <li key={p.socket_id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
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

const QuestionView: React.FC<{ gameState: GameState; onSubmitAnswer: (index: number) => void; }> = ({ gameState, onSubmitAnswer }) => {
    const { question, participants, yourSocketId } = gameState;
    const me = participants.find(p => p.socket_id === yourSocketId);
    const isHost = me?.role === 'host';

    if (!question) return <div className="text-center text-xl">Loading question...</div>;

    return (
        <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl text-white">
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Question {gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}</span>
                {!isHost && <span className="font-bold">Score: {me?.score}</span>}
            </div>
            <h1 className="text-2xl font-bold mb-6 text-center">{question.questionText}</h1>
            
            {me?.answered && !isHost ? (
                <p className="text-center text-2xl text-green-400 animate-pulse">Answer submitted! Waiting for others...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((opt, index) => (
                        <button 
                            key={index} 
                            onClick={() => !isHost && onSubmitAnswer(index)}
                            disabled={isHost}
                            className={`p-4 rounded-lg text-lg text-left transition-colors ${isHost ? 'bg-gray-700 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                        >
                            {opt.text}
                        </button>
                    ))}
                </div>
            )}
            {isHost && <p className="text-center text-gray-400 mt-6 animate-pulse">Players are answering...</p>}
        </div>
    );
};

const ResultsView: React.FC<{ gameState: GameState; onNextQuestion: () => void; }> = ({ gameState, onNextQuestion }) => {
    const { question, participants, yourSocketId } = gameState;
    const me = participants.find(p => p.socket_id === yourSocketId);
    const isHost = me?.role === 'host';
    const sortedPlayers = useMemo(() => 
        [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score),
        [participants]
    );

    if (!question) return null;

    const { correctAnswerIndex, yourAnswer } = question;

    return (
        <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Round Over!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {question.options.map((opt, index) => {
                    let style = 'bg-gray-700'; // Default style
                    if (index === correctAnswerIndex) {
                        style = 'bg-green-500 ring-4 ring-white'; // Correct answer
                    } else if (index === yourAnswer?.optionIndex && !yourAnswer?.wasCorrect) {
                        style = 'bg-red-500'; // Player's incorrect answer
                    }
                    return (
                        <div key={index} className={`p-4 rounded-lg text-lg text-left ${style}`}>
                            {opt.text}
                        </div>
                    );
                })}
            </div>

            <h2 className="text-2xl font-semibold mb-3">Leaderboard</h2>
            <ul className="space-y-2 mb-8">
                {sortedPlayers.map((p, index) => (
                    <li key={p.socket_id} className="flex justify-between bg-gray-700 p-3 rounded-md text-lg">
                        <span>#{index + 1} {p.user_name}</span>
                        <span className="font-bold">{p.score} pts</span>
                    </li>
                ))}
            </ul>

            {isHost && (
                <button onClick={onNextQuestion} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    Next Question
                </button>
            )}
            {!isHost && <p className="text-center text-gray-400 animate-pulse">Waiting for the host to continue...</p>}
        </div>
    );
};

const FinalScoreView: React.FC<{ gameState: GameState; onPlayAgain: () => void; }> = ({ gameState, onPlayAgain }) => {
     const sortedPlayers = useMemo(() => 
        [...gameState.participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score),
        [gameState.participants]
    );

    return (
        <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl text-white text-center">
            <h1 className="text-5xl font-bold mb-4">Game Over!</h1>
            <h2 className="text-3xl font-semibold mb-6">Final Scores</h2>
             <ul className="space-y-2 mb-8">
                {sortedPlayers.map((p, index) => (
                    <li key={p.socket_id} className={`flex justify-between p-4 rounded-md text-xl font-bold ${index === 0 ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700'}`}>
                        <span>🏆 #{index + 1} {p.user_name}</span>
                        <span>{p.score} pts</span>
                    </li>
                ))}
            </ul>
            <button onClick={onPlayAgain} className="inline-block mt-4 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors">
                Play Again
            </button>
        </div>
    );
};

interface QuizGameProps {
    gameState: GameState;
    startGame: (roomId: number) => void;
    submitAnswer: (data: { roomId: number; optionIndex: number }) => void;
    requestNextQuestion: (roomId: number) => void;
    resetGame: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ gameState, startGame, submitAnswer, requestNextQuestion, resetGame }) => {
    const handleStartGame = useCallback(() => {
        if (gameState.roomId) startGame(gameState.roomId);
    }, [gameState.roomId, startGame]);

    const handleSubmitAnswer = useCallback((optionIndex: number) => {
        if (gameState.roomId) submitAnswer({ roomId: gameState.roomId, optionIndex });
    }, [gameState.roomId, submitAnswer]);

    const handleNextQuestion = useCallback(() => {
        if (gameState.roomId) requestNextQuestion(gameState.roomId);
    }, [gameState.roomId, requestNextQuestion]);

    switch (gameState.gameState) {
        case 'lobby':
            return <LobbyView gameState={gameState} onStartGame={handleStartGame} />;
        case 'question':
            return <QuestionView gameState={gameState} onSubmitAnswer={handleSubmitAnswer} />;
        case 'results':
            return <ResultsView gameState={gameState} onNextQuestion={handleNextQuestion} />;
        case 'end':
            return <FinalScoreView gameState={gameState} onPlayAgain={resetGame} />;
        default:
            return <div className="text-white text-2xl">Connecting...</div>;
    }
};

const App: React.FC = () => {
    const { gameState, createRoom, joinRoom, startGame, submitAnswer, requestNextQuestion, resetGame } = useQuizGame();
    const [view, setView] = useState<'menu' | 'join' | 'create'>('menu');
    const [isConnecting, setIsConnecting] = useState(false);
    const [hostName, setHostName] = useState('');
    const [quizId, setQuizId] = useState('');
    const [username, setUsername] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hostName && quizId) {
            setIsConnecting(true);
            createRoom({ quizId, hostId: 'user' + Math.random().toString(16).slice(2), hostName });
        }
    };
    
    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username && joinRoomId) {
            setIsConnecting(true);
            joinRoom({ roomId: parseInt(joinRoomId), username, user_id: 'user' + Math.random().toString(16).slice(2) });
        }
    };

    if (gameState.roomId) {
        return <QuizGame gameState={gameState} startGame={startGame} submitAnswer={submitAnswer} requestNextQuestion={requestNextQuestion} resetGame={resetGame} />;
    }

    if (isConnecting) {
        return <div className="text-white text-2xl animate-pulse">Connecting...</div>;
    }
    
    if (view === 'create') {
        return (
             <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-xl text-white">
                <h1 className="text-3xl font-bold text-center mb-6">Create a Game</h1>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <input type="text" placeholder="Enter your name (Host)" value={hostName} onChange={(e) => setHostName(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    <input type="text" placeholder="Enter Quiz ID" value={quizId} onChange={(e) => setQuizId(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    <button type="submit" className="w-full bg-indigo-600 font-bold py-2 px-4 rounded-md hover:bg-indigo-700">Create</button>
                    <button type="button" onClick={() => setView('menu')} className="w-full bg-gray-600 font-bold py-2 px-4 rounded-md hover:bg-gray-500 mt-2">Back</button>
                </form>
            </div>
        )
    }

    if (view === 'join') {
        return (
             <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-xl text-white">
                <h1 className="text-3xl font-bold text-center mb-6">Join a Game</h1>
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                    <input type="text" placeholder="Enter your name" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    <input type="text" placeholder="Enter Room ID" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    <button type="submit" className="w-full bg-green-600 font-bold py-2 px-4 rounded-md hover:bg-green-700">Join</button>
                    <button type="button" onClick={() => setView('menu')} className="w-full bg-gray-600 font-bold py-2 px-4 rounded-md hover:bg-gray-500 mt-2">Back</button>
                </form>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-xl text-white text-center">
            <h1 className="text-4xl font-bold mb-8">Quiz Game</h1>
            <div className="space-y-4">
                <button onClick={() => setView('create')} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors">Create Game</button>
                <button onClick={() => setView('join')} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-500 transition-colors">Join Game</button>
            </div>
        </div>
    );
};

export default App;
