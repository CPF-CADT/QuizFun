import React, { useEffect, useState, useMemo } from 'react';
import type { GameState } from '../../context/GameContext';
import { Crown, CheckCircle, XCircle, Award, Star } from 'lucide-react';

interface ResultsViewProps {
    gameState: GameState;
    onNextQuestion: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ gameState, onNextQuestion }) => {
    const { question, participants, yourUserId, answerCounts } = gameState;
    const [revealed, setRevealed] = useState(false);
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    
    const sortedPlayers = useMemo(() => 
        [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score), 
        [participants]
    );

    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), 300);
        return () => clearTimeout(timer);
    }, []);

    if (!question) return null;

    const getResultStyle = (index: number) => {
        const base = "p-4 rounded-xl transition-all duration-700 border-2 flex flex-col shadow-lg";
        const isCorrect = index === question.correctAnswerIndex;
        const isMyAnswer = !isHost && question.yourAnswer?.optionIndex === index;

        if (isCorrect) {
            return `${base} bg-green-500/30 border-green-300 ring-4 ring-green-300/50 animate-glow`;
        }
        if (isMyAnswer && !question.yourAnswer?.wasCorrect) {
            return `${base} bg-red-500/30 border-red-400 animate-shake`;
        }
        return `${base} bg-gray-700/50 border-gray-600`;
    };

    return (
        <div className="w-full max-w-5xl p-4 sm:p-8 bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-500/50 text-white text-center flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => <div key={i} className="absolute bg-white/10 rounded-full animate-star-fall" style={{
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                }}/>)}
            </div>

            <div className="mb-6 animate-fade-in-down">
                <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Results Are In!</h1>
                <p className="text-md sm:text-lg text-white/80">{question.questionText}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {question.options.map((opt, index) => {
                    const isCorrect = index === question.correctAnswerIndex;
                    const count = answerCounts?.[index] || 0;
                    const totalAnswers = Object.values(answerCounts || {}).reduce((sum, c) => sum + c, 0);
                    const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;

                    return (
                        <div key={index} className={`${getResultStyle(index)} ${revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{transitionDelay: `${index * 150}ms`}}>
                            <div className="flex items-center justify-between text-md sm:text-lg">
                                <div className="flex items-center gap-3">
                                    {isCorrect ? <CheckCircle className="w-6 h-6 text-green-300"/> : <XCircle className="w-6 h-6 text-red-400/70"/>}
                                    <span className="font-semibold">{opt.text}</span>
                                </div>
                                <span className="font-bold text-xl">{count}</span>
                            </div>
                            <div className="mt-3 bg-black/40 rounded-full h-2.5 w-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isCorrect ? 'bg-gradient-to-r from-green-300 to-teal-300' : 'bg-gray-500'}`}
                                     style={{ width: revealed ? `${percentage}%` : '0%' }}>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="animate-fade-in-up" style={{animationDelay: '800ms'}}>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 flex items-center justify-center gap-3">
                    <Award className="w-8 h-8 text-yellow-300" /> Leaderboard
                </h2>
                <ul className="space-y-2 max-h-48 overflow-y-auto p-2 bg-black/30 rounded-xl">
                    {sortedPlayers.map((p, i) => (
                        <li key={p.user_id} className={`flex items-center justify-between p-3 rounded-lg text-lg transition-all duration-500 ${i === 0 ? 'bg-yellow-500/20 border-2 border-yellow-400 transform scale-105' : 'bg-gray-700/50'}`}>
                            <div className="flex items-center gap-4">
                                <span className={`font-bold w-8 text-center text-xl ${i === 0 ? 'text-yellow-300' : ''}`}>{i + 1}</span>
                                <span className={`font-semibold truncate ${i === 0 ? 'text-2xl font-bold text-yellow-200' : ''}`}>{p.user_name}</span>
                                {i === 0 && <Crown className="w-7 h-7 text-yellow-300 animate-bounce" />}
                            </div>
                            <span className="font-bold text-xl">{p.score} pts</span>
                        </li>
                    ))}
                </ul>
            </div>

            {isHost && (
                <button onClick={onNextQuestion} className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-xl">
                    Next Question <Star className="inline-block ml-2 animate-spin-slow"/>
                </button>
            )}

            <style>{`
                @keyframes glow { 0%, 100% { box-shadow: 0 0 15px rgba(52, 211, 153, 0.4); } 50% { box-shadow: 0 0 30px rgba(52, 211, 153, 0.7); } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
                @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes star-fall { from { transform: translateY(-10vh) scale(0); } to { transform: translateY(110vh) scale(1); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-glow { animation: glow 2s infinite; }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                .animate-fade-in-down { animation: fade-in-down 0.6s ease-out; }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
                .animate-spin-slow { animation: spin-slow 5s linear infinite; }
            `}</style>
        </div>
    );
};