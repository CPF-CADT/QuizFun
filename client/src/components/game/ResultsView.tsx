import React, { useEffect, useState, useMemo } from 'react';
import type { GameState } from '../../context/GameContext';
import { Crown, Star, Zap, Target, Award } from 'lucide-react';

interface ResultsViewProps {
    gameState: GameState;
    onNextQuestion: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ gameState, onNextQuestion }) => {
    const { question, participants, yourUserId, answerCounts } = gameState;
    const [showResults, setShowResults] = useState(false);
    const [revealedOptions, setRevealedOptions] = useState<number[]>([]);
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    
    const sortedPlayers = useMemo(() => 
        [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score), 
        [participants]
    );

    useEffect(() => {
        const timer = setTimeout(() => setShowResults(true), 500);
        if (question?.options) {
            question.options.forEach((_, index) => {
                setTimeout(() => {
                    setRevealedOptions(prev => [...prev, index]);
                }, 1000 + (index * 800));
            });
        }
        return () => clearTimeout(timer);
    }, [question]);

    if (!question) return null;

    const getResultStyle = (index: number, revealed: boolean) => {
        const baseStyle = "p-6 rounded-xl text-lg text-left relative overflow-hidden transition-all duration-1000 transform border-2";
        if (!revealed) {
            return `${baseStyle} bg-gray-800 border-gray-600 scale-95 opacity-50`;
        }
        if (index === question.correctAnswerIndex) {
            return `${baseStyle} bg-green-500 border-green-300 ring-4 ring-green-300 animate-correct-answer scale-105`;
        }
        if (!isHost && question.yourAnswer && index === question.yourAnswer.optionIndex && !question.yourAnswer.wasCorrect) {
            return `${baseStyle} bg-red-500 border-red-300 animate-wrong-answer`;
        }
        return `${baseStyle} bg-gray-700 border-gray-500 hover:bg-gray-600`;
    };

    return (
        <div className="w-full max-w-4xl p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white text-center">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse-glow">Round Results! 🎯</h1>
                <div className="flex justify-center items-center gap-4 text-xl">
                    <Target className="w-6 h-6 text-blue-400" />
                    <span>Let's see how everyone did!</span>
                    <Target className="w-6 h-6 text-blue-400" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {question.options.map((opt, index) => {
                    const revealed = revealedOptions.includes(index);
                    const isCorrect = index === question.correctAnswerIndex;
                    return (
                        <div key={index} className={getResultStyle(index, revealed)} style={{ animationDelay: `${index * 200}ms` }}>
                            {revealed && isCorrect && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                                    <div className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                                    <div className="absolute bottom-6 right-2 w-2 h-2 bg-green-200 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                                </div>
                            )}
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${revealed && isCorrect ? 'bg-yellow-400 text-green-800 animate-bounce' : 'bg-white/20'} transition-all duration-500`}>
                                        {revealed && isCorrect ? '✓' : String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="font-semibold">{opt.text}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {revealed && (
                                        <div className="animate-count-up bg-black/30 px-4 py-2 rounded-full">
                                            <span className="font-bold text-2xl">{answerCounts?.[index] || 0}</span>
                                        </div>
                                    )}
                                    {revealed && isCorrect && (<Crown className="w-6 h-6 text-yellow-400 animate-spin" />)}
                                </div>
                            </div>
                            {revealed && (
                                <div className="mt-3 bg-black/20 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full ${isCorrect ? 'bg-yellow-400' : 'bg-blue-400'} rounded-full animate-progress-bar`}
                                        style={{
                                            width: `${Math.min(100, ((answerCounts?.[index] || 0) / Math.max(1, participants.length)) * 100)}%`,
                                            animationDelay: '0.5s'
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {showResults && (
                <div className="animate-fade-in-up mb-8" style={{animationDelay: '2s'}}>
                    <h2 className="text-3xl font-semibold mb-6 flex items-center justify-center gap-3">
                        <Award className="w-8 h-8 text-yellow-400" /> Current Rankings
                    </h2>
                    <ul className="space-y-3 max-h-64 overflow-y-auto p-4 bg-black/20 rounded-xl">
                        {sortedPlayers.map((p, i) => (
                            <li key={p.user_id} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg text-lg hover:bg-gray-600/50 transition-all duration-300 animate-slide-in-left" style={{animationDelay: `${2.5 + (i * 0.1)}s`}}>
                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-xl ${i === 0 ? 'bg-yellow-400 text-yellow-900 animate-winner' : i === 1 ? 'bg-gray-300 text-gray-800' : i === 2 ? 'bg-orange-400 text-orange-900' : 'bg-gray-600 text-white'}`}>
                                        {i + 1}
                                    </div>
                                    <span className="font-semibold">{p.user_name}</span>
                                    {i === 0 && <Crown className="w-5 h-5 text-yellow-400 animate-bounce" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-2xl">{p.score}</span>
                                    <span className="text-sm opacity-80">pts</span>
                                    {i < 3 && <Zap className="w-4 h-4 text-yellow-400" />}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {isHost && showResults && (
                <button onClick={onNextQuestion} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up shadow-lg hover:shadow-2xl" style={{animationDelay: '3s'}}>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-xl">Next Question</span>
                        <Star className="w-6 h-6 animate-spin" />
                    </div>
                </button>
            )}
            <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slide-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes correct-answer { 0% { transform: scale(1); } 50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(34, 197, 94, 0.6); } 100% { transform: scale(1.05); } }
                @keyframes wrong-answer { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                @keyframes progress-bar { from { width: 0%; } }
                @keyframes count-up { from { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); } to { transform: scale(1); opacity: 1; } }
                @keyframes winner { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
                .animate-slide-in-left { animation: slide-in-left 0.5s ease-out forwards; opacity: 0; }
                .animate-correct-answer { animation: correct-answer 1s ease-out; }
                .animate-wrong-answer { animation: wrong-answer 0.5s ease-in-out; }
                .animate-progress-bar { animation: progress-bar 1.5s ease-out forwards; }
                .animate-count-up { animation: count-up 0.8s ease-out; }
                .animate-winner { animation: winner 2s infinite; }
                .animate-pulse-glow { animation: pulse-glow 2s infinite; }
            `}</style>
        </div>
    );
};