// src/components/game/SoloResultsView.tsx (REDEFINED)

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import type { ISoloQuestion } from '../../service/soloGameApi';

interface SoloResultsViewProps {
    question: ISoloQuestion;
    lastResult: {
        wasCorrect: boolean;
        correctOptionId: string;
        scoreGained: number; // Pass the score gained for this question
    };
    currentScore: number; // Pass the total score
}

export const SoloResultsView: React.FC<SoloResultsViewProps> = ({ question, lastResult, currentScore }) => {
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), 100); // Quick reveal animation
        return () => clearTimeout(timer);
    }, []);

    const getResultStyle = (optionId: string) => {
        const base = "p-4 rounded-xl transition-all duration-500 border-2 flex items-center justify-between shadow-lg text-left";
        const isCorrectAnswer = optionId === lastResult.correctOptionId;

        if (isCorrectAnswer) {
            return `${base} bg-green-500/30 border-green-300 ring-4 ring-green-300/50`;
        }
        // This assumes we don't know the player's incorrect choice, just the correct one
        return `${base} bg-gray-700/50 border-gray-600 opacity-70`;
    };
    
    return (
        <div className="w-full max-w-4xl p-6 sm:p-8 bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-500/50 text-white text-center flex flex-col">
            {/* --- Main Feedback Header --- */}
            <div className={`transition-all duration-500 ${revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 flex items-center justify-center gap-3">
                    {lastResult.wasCorrect ? (
                        <>
                            <CheckCircle className="w-12 h-12 text-green-400" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">Correct!</span>
                        </>
                    ) : (
                         <>
                            <XCircle className="w-12 h-12 text-red-400" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">Incorrect</span>
                        </>
                    )}
                </h1>
                
                {/* --- Score Gained Animation --- */}
                {lastResult.scoreGained > 0 && (
                    <p className="text-2xl font-bold text-yellow-300 animate-bounce">
                        + {lastResult.scoreGained.toLocaleString()}
                    </p>
                )}
            </div>

            <div className="my-6 border-t border-white/10" />
            
            {/* --- Answer Options Breakdown --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt, index) => (
                    <div 
                        key={opt._id} 
                        className={`${getResultStyle(opt._id)} ${revealed ? 'opacity-100' : 'opacity-0'}`}
                        style={{transitionDelay: `${index * 150}ms`}}
                    >
                        <span className="font-semibold text-lg">{opt.text}</span>
                        {opt._id === lastResult.correctOptionId && <Star className="w-6 h-6 text-yellow-300" />}
                    </div>
                ))}
            </div>

            <p className="mt-8 text-xl text-gray-300">
                Total Score: <span className="font-bold text-2xl text-white">{currentScore.toLocaleString()}</span>
            </p>

             <style>{`
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-20px) scale(1.1); }
                    60% { transform: translateY(-10px); }
                }
                .animate-bounce { animation: bounce 1.5s ease-out; }
            `}</style>
        </div>
    );
};