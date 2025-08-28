// QuestionView.tsx

import React, { useEffect, useState, useMemo } from 'react';
import type { GameState } from '../../context/GameContext';
import { Trophy, Zap } from 'lucide-react';

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
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAnswerLocked = useMemo(() => {
        if (settings.allowAnswerChange) return false;
        return !!me?.hasAnswered || isSubmitting;
    }, [settings.allowAnswerChange, me?.hasAnswered, isSubmitting]);

    useEffect(() => {
        setSelectedOption(userSeleted ?? null);
        setIsSubmitting(false);
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
        setSelectedOption(index);
        onSubmitAnswer(index);
        if (!settings.allowAnswerChange) {
            setIsSubmitting(true);
        }
    };

    const getAnswerButtonClass = (index: number) => {
        const base = "w-full text-left p-4 rounded-xl transition-all duration-300 transform border-2 shadow-lg group";
        const colors = [
            "border-purple-400 bg-purple-500/30 hover:bg-purple-500/50 hover:shadow-purple-400/50",
            "border-emerald-400 bg-emerald-500/30 hover:bg-emerald-500/50 hover:shadow-emerald-400/50",
            "border-orange-400 bg-orange-500/30 hover:bg-orange-500/50 hover:shadow-orange-400/50",
            "border-rose-400 bg-rose-500/30 hover:bg-rose-500/50 hover:shadow-rose-400/50"
        ];

        if (isHost) return `${base} bg-gray-800/50 border-gray-700 cursor-not-allowed`;
        
        const isSelected = index === selectedOption;
        if (isAnswerLocked) {
            return isSelected
                ? `${base} bg-blue-500/60 border-blue-300 scale-105 shadow-blue-300/60 cursor-not-allowed animate-pulse`
                : `${base} bg-gray-800/40 border-gray-700 opacity-40 cursor-not-allowed`;
        }
        if (isSelected) {
            return `${base} bg-blue-500/60 border-blue-300 scale-105 shadow-blue-300/60`;
        }
        return `${base} ${colors[index % 4]} cursor-pointer hover:scale-105 hover:-rotate-1`;
    };

    if (!question || !me) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-screen flex flex-col p-4 bg-grid-pattern">
            <header className="flex items-center justify-between p-3 sm:p-4 bg-black/30 backdrop-blur-sm rounded-xl mb-4 border border-white/10 shadow-lg">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 transition-transform hover:scale-105">
                    <Trophy className="w-5 h-5 text-yellow-300 animate-pulse" />
                    <span className="font-bold text-lg text-white shadow-text">{me.score.toLocaleString()}</span>
                </div>
                <div className="text-center font-bold text-lg text-white/90 shadow-text">
                    {currentQuestionIndex + 1} / {totalQuestions}
                </div>
                <div className={`relative w-20 h-20 flex items-center justify-center font-bold text-3xl ${timeLeft <= 5 ? 'text-red-400 animate-pulse-fast' : 'text-white'}`}>
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle
                            className={`${timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-yellow-400' : 'text-red-400'}`}
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={(2 * Math.PI * 45) * (1 - timeLeft / (question.timeLimit || 1))}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                        />
                    </svg>
                    {timeLeft}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center animate-fade-in-up">
                <div className="w-full max-w-3xl bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-white question-glow">{question.questionText}</h1>
                    
                    {question.imageUrl && (
                        <div className="w-full max-w-lg mx-auto h-48 sm:h-64 my-4 rounded-lg overflow-hidden shadow-lg border-2 border-white/10">
                            <img src={question.imageUrl} alt="Question" className="w-full h-full object-contain" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {question.options.map((answer, index) => (
                            <button 
                                key={index} 
                                onClick={() => handlePlayerAnswer(index)} 
                                className={getAnswerButtonClass(index)}
                                disabled={isHost || isAnswerLocked}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 flex items-center justify-center text-xl font-bold text-white shape-${['diamond', 'triangle', 'circle', 'square'][index % 4]}`}>
                                       <Zap size={20}/>
                                    </div>
                                    <span className="text-base sm:text-lg font-semibold flex-1 text-white/95">{answer.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                {isHost && !settings.autoNext && (
                    <button onClick={onNextQuestion} className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform">
                        Next Question
                    </button>
                )}
                {!isHost && isAnswerLocked && (
                    <p className="mt-6 text-lg animate-pulse text-blue-300">Answer Locked In! Good luck!</p>
                )}
            </main>
            <style>{`
                .bg-grid-pattern {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 2rem 2rem;
                }
                .shadow-text {
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }
                .question-glow {
                    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
                }
                .animate-pulse-fast {
                    animation: pulse 0.8s infinite;
                }
                .shape-diamond { background-color: #a855f7; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
                .shape-triangle { background-color: #10b981; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
                .shape-circle { background-color: #f97316; border-radius: 50%; }
                .shape-square { background-color: #f43f5e; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};