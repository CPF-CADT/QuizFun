import React, { useEffect, useState, useMemo } from 'react';
import type { GameState } from '../../context/GameContext';
import { Trophy, Crown } from 'lucide-react';

interface QuestionViewProps {
    gameState: GameState;
    onSubmitAnswer: (index: number) => void;
    onNextQuestion: () => void;
    userSeleted?: number | null;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ gameState, onSubmitAnswer, onNextQuestion, userSeleted }) => {
    const { question, yourUserId, participants, currentQuestionIndex, totalQuestions, questionStartTime, settings } = gameState;
    const [timeLeft, setTimeLeft] = useState(question?.timeLimit || 0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [questionAnimation, setQuestionAnimation] = useState('animate-fade-in-up');
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAnswerLocked = useMemo(() => {
        if (settings.allowAnswerChange) return false;
        return !!me?.hasAnswered || isSubmitting;
    }, [settings.allowAnswerChange, me?.hasAnswered, isSubmitting]);

    useEffect(() => {
        setQuestionAnimation('animate-fade-in-up');
        setSelectedOption(userSeleted ?? null);
        setIsSubmitting(false);
        const timer = setTimeout(() => setQuestionAnimation(''), 500);
        return () => clearTimeout(timer);
    }, [currentQuestionIndex, userSeleted]);

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

    const handlePlayerAnswer = (index: number) => {
        if (isHost || isAnswerLocked) return;
        if (settings.allowAnswerChange && index === selectedOption) return;
        
        setSelectedOption(index);
        onSubmitAnswer(index);
        
        if (!settings.allowAnswerChange) {
            setIsSubmitting(true);
        }
    };

    const getAnswerButtonClass = (index: number) => {
        const base = "relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-500 transform border-2 shadow-lg group hover:shadow-2xl";
        const colors = [
            "from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500",
            "from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500",
            "from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500",
            "from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500"
        ];
        if (isHost) return `${base} bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed`;
        const isSelected = index === selectedOption;
        if (isAnswerLocked) {
            return isSelected
                ? `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 animate-pulse-glow scale-105 cursor-not-allowed`
                : `${base} bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed`;
        }
        if (settings.allowAnswerChange && isSelected) {
            return `${base} bg-gray-500 text-gray-200 opacity-50 cursor-not-allowed`;
        }
        if (isSelected) {
            return `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 animate-selected scale-105`;
        }
        return `${base} bg-gradient-to-br ${colors[index % 4]} cursor-pointer hover:scale-105 hover:-rotate-1 animate-option-appear`;
    };

    const sortedPlayers = useMemo(() => 
        [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score), 
        [participants]
    );

    if (!question || !me) {
        return (
            <div className="text-2xl font-bold">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading next question...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-screen flex flex-col">
            <header className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10 animate-slide-down">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-300">
                    <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
                    <span className="font-bold text-lg counter-animation">{me.score.toLocaleString()}</span>
                </div>
                <div className="text-center font-bold text-xl animate-fade-in">
                    Question {currentQuestionIndex + 1} / {totalQuestions}
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full border-4 ${timeLeft > 10 ? 'border-green-400' : timeLeft > 5 ? 'border-yellow-400' : 'border-red-400'} transition-colors duration-300`}></div>
                    <div className={`absolute inset-0 rounded-full border-4 border-transparent ${timeLeft > 10 ? 'border-t-green-400' : timeLeft > 5 ? 'border-t-yellow-400' : 'border-t-red-400'} animate-spin-slow`}></div>
                    <span className={`text-4xl font-bold z-10 ${timeLeft > 5 ? 'text-white' : 'text-red-400 animate-pulse-fast'} transition-all duration-300`}>{timeLeft}</span>
                </div>
            </header>

            <main className={`flex-1 flex p-8 gap-8 ${isHost ? 'flex-row items-start' : 'flex-col items-center justify-center'}`}>
                <div className="flex flex-col items-center justify-center space-y-6 flex-1">
                    <h1 className={`text-3xl md:text-5xl font-bold text-center ${questionAnimation} question-glow`}>{question.questionText}</h1>
                    
                    {/* --- NEW: IMAGE DISPLAY --- */}
                    {question.imageUrl && (
                        <div className="w-full max-w-lg h-64 my-4 rounded-lg shadow-lg overflow-hidden animate-fade-in-up">
                            <img src={question.imageUrl} alt="Question visual" className="w-full h-full object-contain" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                        {question.options.map((answer, index) => (
                            <button 
                                key={index} 
                                onClick={() => handlePlayerAnswer(index)} 
                                className={getAnswerButtonClass(index)}
                                style={{ animationDelay: `${index * 150}ms` }}
                                disabled={isHost || isAnswerLocked || (settings.allowAnswerChange && selectedOption === index)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <div className="flex items-center space-x-4 relative z-10">
                                    <div className={`w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${index === selectedOption ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-xl font-semibold flex-1">{answer.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {isHost && !settings.autoNext && (<button onClick={onNextQuestion} className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 animate-fade-in-up">Next Question</button>)}
                    {!isHost && isAnswerLocked && (
                        <div className="flex items-center gap-3 animate-pulse-glow">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                            <p className="text-lg">Answer submitted! Waiting for results...</p>
                        </div>
                    )}
                </div>
                {isHost && (
                    <div className="w-full md:w-1/3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 self-stretch animate-slide-in-right">
                        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                            <Crown className="w-6 h-6 text-yellow-400" /> Live Leaderboard
                        </h2>
                        <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {sortedPlayers.map((p, i) => (
                                <li key={p.user_id} className="flex justify-between items-center bg-white/10 p-3 rounded-lg text-lg hover:bg-white/20 transition-all duration-300 animate-slide-in-left" style={{animationDelay: `${i * 100}ms`}}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xl font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'}`}>#{i + 1}</span>
                                        <span className="font-semibold">{p.user_name}</span>
                                    </div>
                                    <span className="font-bold text-yellow-300">{p.score.toLocaleString()} pts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
            <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slide-in-right { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slide-in-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); } }
                @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                @keyframes option-appear { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes selected { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1.02); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
                .animate-slide-down { animation: slide-down 0.5s ease-out; }
                .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
                .animate-slide-in-left { animation: slide-in-left 0.4s ease-out forwards; opacity: 0; }
                .animate-pulse-glow { animation: pulse-glow 2s infinite; }
                .animate-pulse-fast { animation: pulse-fast 0.5s infinite; }
                .animate-option-appear { animation: option-appear 0.5s ease-out forwards; opacity: 0; }
                .animate-selected { animation: selected 0.3s ease-out; }
                .animate-spin-slow { animation: spin-slow 15s linear infinite; }
                .question-glow { text-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
                .counter-animation { transition: all 0.3s ease; }
                .counter-animation:hover { transform: scale(1.1); }
            `}</style>
        </div>
    );
};