import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  useQuizGame,
  type GameState,
  type ResultsPayload,
  type Participant,
  type GameSettings,
} from '../context/GameContext';

const FaCrown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 1L6.6 6.4L1 7.2l4.5 4.4L4.2 18L10 15.2L15.8 18l-1.3-6.4L19 7.2l-5.6-.8L10 1z"></path></svg>
);
const Trophy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zm-5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6zM5 14a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
);

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between text-left">
        <span className="text-white font-medium">{label}</span>
        <button
            type="button"
            className={`${enabled ? 'bg-green-500' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            onClick={() => onChange(!enabled)}
        >
            <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
        </button>
    </div>
);


// --- VIEW 1: LOBBY (WITH NEW FEATURES) ---
const LobbyView: React.FC<{ gameState: GameState; onStartGame: (roomId: number) => void; onSettingsChange: (settings: GameSettings) => void; }> = ({ gameState, onStartGame, onSettingsChange }) => {
    const { roomId, participants, yourUserId, settings } = gameState;
    const shareableLink = `${window.location.origin}/join?joinRoomCode=${roomId}`;
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareableLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    return (
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-white/20 text-center">
            <h1 className="text-4xl font-bold mb-2">Game Lobby</h1>
            <p className="text-white/80 text-lg">Get your friends to join!</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-black/20 p-4 rounded-xl">
                <div className="text-center md:text-left">
                    <p className="font-semibold mb-2">Join with Game PIN:</p>
                    <p className="text-5xl font-bold tracking-widest text-yellow-300">{roomId}</p>
                </div>
                <div className="flex justify-center items-center bg-white p-2 rounded-lg">
                    <QRCodeSVG value={shareableLink} size={160} level="H" />
                </div>
            </div>

            <div className="mt-4">
                 <p className="font-semibold text-sm mb-2 text-left text-white/80">Or share this link:</p>
                 <div className="flex gap-2">
                    <input type="text" readOnly value={shareableLink} className="w-full bg-white/10 p-2 rounded text-sm text-center md:text-left text-white/90" onClick={(e) => (e.target as HTMLInputElement).select()} />
                    <button onClick={handleCopy} className="bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors w-28">
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                 </div>
            </div>

            <div className="mt-8 bg-white/10 p-4 rounded-xl max-h-64 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Players ({participants.length})</h2>
                <ul className="space-y-3 text-left">
                   {participants.map((player) => (
                       <li key={player.user_id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                           <span>{player.user_name}</span>
                           {player.role === 'host' && <span className="text-xs font-bold text-yellow-300 flex items-center gap-1"><FaCrown className="w-4 h-4" /> HOST</span>}
                       </li>
                   ))}
                </ul>
            </div>
            
            {isHost && (
                <div className="mt-6 bg-white/10 p-4 rounded-xl space-y-4">
                    <h3 className="text-xl font-semibold">Game Settings</h3>
                    <ToggleSwitch 
                        label="Auto-Advance to Next Round" 
                        enabled={settings.autoNext} 
                        onChange={(enabled) => onSettingsChange({ ...settings, autoNext: enabled })}
                    />
                     <ToggleSwitch 
                        label="Allow Players to Change Answer" 
                        enabled={settings.allowAnswerChange} 
                        onChange={(enabled) => onSettingsChange({ ...settings, allowAnswerChange: enabled })}
                    />
                </div>
            )}

            <div className="mt-8">
                {isHost ? (
                    <button onClick={() => roomId && onStartGame(roomId)} disabled={participants.length < 2} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold py-4 rounded-xl transition-colors">
                        {participants.length < 2 ? 'Waiting for at least 1 player...' : `Start Game (${participants.length} players)`}
                    </button>
                ) : (
                   <p className="text-lg animate-pulse">Waiting for host to start...</p>
                )}
            </div>
        </div>
    );
};

// --- VIEW 2: QUESTION ---
const QuestionView: React.FC<{ gameState: GameState; onSubmitAnswer: (index: number) => void; onNextQuestion: () => void; }> = ({ gameState, onSubmitAnswer, onNextQuestion }) => {
    const { question, yourUserId, participants, currentQuestionIndex, totalQuestions, questionStartTime, settings } = gameState;
    const [timeLeft, setTimeLeft] = useState(question?.timeLimit || 0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const answerLockedByServer = !!me?.hasAnswered && !settings.allowAnswerChange;

    useEffect(() => {
        setSelectedOption(null);
    }, [currentQuestionIndex]);
    
    useEffect(() => {
        if (!questionStartTime || !question?.timeLimit) {
            setTimeLeft(question?.timeLimit || 0);
            return;
        }
        const updateTimer = () => {
            const elapsed = (Date.now() - questionStartTime) / 1000;
            const remaining = Math.max(0, question.timeLimit - elapsed);
            setTimeLeft(Math.ceil(remaining));
        };
        updateTimer();
        const interval = setInterval(updateTimer, 500);
        return () => clearInterval(interval);
    }, [questionStartTime, question?.timeLimit, currentQuestionIndex]);

    if (!question || !me) {
        return <div className="text-2xl font-bold animate-pulse">Loading next question...</div>;
    }

    const handlePlayerAnswer = (index: number) => {
        if (isHost || answerLockedByServer) return;
        setSelectedOption(index);
        onSubmitAnswer(index);
    };

    const getAnswerButtonClass = (index: number) => {
        const base = "relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform border-2 shadow-lg";
        const colors = ["from-purple-500 to-purple-600", "from-emerald-500 to-emerald-600", "from-orange-500 to-orange-600", "from-rose-500 to-rose-600"];
        
        if (isHost) return `${base} bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed`;

        const isSelected = index === selectedOption;
        if (answerLockedByServer || isSelected) {
            return isSelected 
                ? `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 scale-105 cursor-not-allowed`
                : `${base} bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed`;
        }

        return `${base} bg-gradient-to-br ${colors[index % 4]} cursor-pointer hover:scale-105`;
    };

    const renderHeader = () => (
        <header className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-lg">{me.score.toLocaleString()}</span>
            </div>
            <div className="text-center font-bold text-xl">Question {currentQuestionIndex + 1} / {totalQuestions}</div>
            <div className="relative w-24 h-24 flex items-center justify-center">
                <span className={`text-4xl font-bold ${timeLeft > 5 ? 'text-white' : 'text-red-400 animate-ping'}`}>{timeLeft}</span>
            </div>
        </header>
    );

    const sortedPlayers = useMemo(() => [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score), [participants]);
    const isAnswerSubmitted = selectedOption !== null || answerLockedByServer;

    return (
        <div className="w-full h-full min-h-screen flex flex-col">
            {renderHeader()}
            <main className={`flex-1 flex p-8 gap-8 ${isHost ? 'flex-row items-start' : 'flex-col items-center justify-center'}`}>
                <div className="flex flex-col items-center justify-center space-y-8 flex-1">
                    <h1 className="text-3xl md:text-5xl font-bold text-center">{question.questionText}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                        {question.options.map((answer, index) => (
                            <button key={index} onClick={() => handlePlayerAnswer(index)} className={getAnswerButtonClass(index)} disabled={isHost || isAnswerSubmitted}>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">{String.fromCharCode(65 + index)}</div>
                                    <span className="text-xl font-semibold flex-1">{answer.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {isHost && !settings.autoNext && (<button onClick={onNextQuestion} className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Next Question</button>)}
                    {!isHost && isAnswerSubmitted && <p className="text-lg animate-pulse">Answer submitted! Waiting for results...</p>}
                </div>
                {isHost && (
                    <div className="w-full md:w-1/3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 self-stretch">
                        <h2 className="text-2xl font-bold mb-4 text-center">Live Leaderboard</h2>
                        <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {sortedPlayers.map((p, i) => (
                                <li key={p.user_id} className="flex justify-between items-center bg-white/10 p-3 rounded-lg text-lg">
                                    <span className="font-semibold">#{i + 1} {p.user_name}</span>
                                    <span className="font-bold text-yellow-300">{p.score.toLocaleString()} pts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- VIEW 3: RESULTS ---
const ResultsView: React.FC<{ gameState: GameState; onNextQuestion: () => void; }> = ({ gameState, onNextQuestion }) => {
    const { question, participants, yourUserId, answerCounts } = gameState;
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const sortedPlayers = useMemo(() => [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score), [participants]);

    if (!question) return null;

    const getResultStyle = (index: number) => {
        if (index === question.correctAnswerIndex) return 'bg-green-500 ring-4 ring-white';
        if (!isHost && question.yourAnswer && index === question.yourAnswer.optionIndex && !question.yourAnswer.wasCorrect) return 'bg-red-500';
        return 'bg-gray-700';
    };

    return (
        <div className="w-full max-w-3xl p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Round Over!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {question.options.map((opt, index) => (
                    <div key={index} className={`p-4 rounded-lg text-lg text-left relative ${getResultStyle(index)}`}>
                        <span>{opt.text}</span>
                        <span className="font-bold float-right bg-black/30 px-2 rounded">{answerCounts?.[index] || 0}</span>
                    </div>
                ))}
            </div>
            <h2 className="text-2xl font-semibold mb-3">Leaderboard</h2>
            <ul className="space-y-2 mb-8 max-h-48 overflow-y-auto p-2 bg-black/20 rounded-lg">
                {sortedPlayers.map((p, i) => (
                    <li key={p.user_id} className="flex justify-between bg-gray-700 p-3 rounded-md text-lg">
                        <span>#{i + 1} {p.user_name}</span>
                        <span className="font-bold">{p.score} pts</span>
                    </li>
                ))}
            </ul>
            {isHost && (
                <button onClick={onNextQuestion} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700">Next Question</button>
            )}
        </div>
    );
};

// --- VIEW 4: GAME OVER ---
const GameOverView: React.FC<{ onFetchResults: () => void; isHost: boolean; }> = ({ onFetchResults, isHost }) => (
    <div className="w-full max-w-md p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white text-center">
        <h1 className="text-5xl font-bold mb-6">🎉 Game Over! 🎉</h1>
        <button onClick={onFetchResults} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700">
            {isHost ? 'View Final Results' : 'View My Results'}
        </button>
    </div>
);

// --- VIEW 5: FINAL RESULTS ---
const GameResultDetails: React.FC<{ payload: ResultsPayload; onExit: () => void; }> = ({ payload, onExit }) => {
    const { results } = payload;
    const sortedResults = useMemo(() => [...results].sort((a,b) => b.score - a.score), [results]);

    return (
        <div className="w-full max-w-2xl p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white">
            <h1 className="text-3xl font-bold text-center mb-6">Final Rankings</h1>
            <ul className="space-y-3 mb-6 max-h-96 overflow-y-auto p-2 bg-black/20 rounded-lg">
                {sortedResults.map((p, index) => (
                    <li key={p.participantId || p.name} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                            <span className={`text-xl font-bold w-8 text-center ${index === 0 ? 'text-yellow-300' : 'text-gray-400'}`}>#{index + 1}</span>
                            <span className="text-lg font-medium">{p.name}</span>
                        </div>
                        <span className="text-xl font-bold text-indigo-400">{p.score} pts</span>
                    </li>
                ))}
            </ul>
            <button onClick={onExit} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700">Exit</button>
        </div>
    );
};

// --- MAIN GAME PAGE (CONTROLLER) ---
const GamePage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { gameState, startGame, submitAnswer, requestNextQuestion, endGame, fetchFinalResults, updateSettings } = useQuizGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (!gameState || (!gameState.sessionId && !gameState.roomId)) {
            const timer = setTimeout(() => {
                if (!gameState || !gameState.sessionId) {
                    console.log("No active session found, redirecting.");
                    navigate('/join');
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [sessionId, gameState, navigate]);

    if (!gameState || (!gameState.sessionId && !gameState.roomId)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
                <div className="text-2xl font-bold animate-pulse">Initializing Game...</div>
            </div>
        );
    }
    
    const me = gameState.participants.find((p: Participant) => p.user_id === gameState.yourUserId);

    const renderGameState = () => {
        if (gameState.finalResults) {
            return <GameResultDetails payload={gameState.finalResults} onExit={endGame} />;
        }

        switch (gameState.gameState) {
            case 'lobby':
                return <LobbyView gameState={gameState} onStartGame={startGame} onSettingsChange={updateSettings} />;
            case 'question':
                return <QuestionView 
                    gameState={gameState} 
                    onSubmitAnswer={(optionIndex) => submitAnswer({ roomId: gameState.roomId, userId: gameState.yourUserId, optionIndex })} 
                    onNextQuestion={() => requestNextQuestion(gameState.roomId)} 
                />;
            case 'results':
                return <ResultsView gameState={gameState} onNextQuestion={() => requestNextQuestion(gameState.roomId)} />;
            case 'end':
                return <GameOverView isHost={me?.role === 'host'} onFetchResults={() => fetchFinalResults(gameState.sessionId)} />;
            default:
                return <div className="text-2xl font-bold animate-pulse">Connecting...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
            {renderGameState()}
        </div>
    );
};

export default GamePage;