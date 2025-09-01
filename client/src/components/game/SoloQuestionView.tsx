// src/components/game/SoloQuestionView.tsx (REWRITTEN)

import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import type { ISoloQuestion } from '../../service/soloGameApi';

interface SoloQuestionViewProps {
    question: ISoloQuestion;
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
    sessionId: string;
    onSubmitAnswer: (optionIndex: number, answerTimeMs: number) => void;
}

export const SoloQuestionView: React.FC<SoloQuestionViewProps> = ({ question, currentQuestionIndex, totalQuestions, score, sessionId, onSubmitAnswer }) => {
    const [timeLeft, setTimeLeft] = useState(question.timeLimit);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // --- FIX: Robust timer logic with localStorage ---
    useEffect(() => {
        const timerKey = `solo_timer_${sessionId}_q_${question._id}`;
        
        // Check if an end time is already stored for this question (for page refreshes)
        const questionEndTime = localStorage.getItem(timerKey) 
            ? parseInt(localStorage.getItem(timerKey)!, 10)
            : Date.now() + question.timeLimit * 1000;

        // If it's a new question, store its end time
        if (!localStorage.getItem(timerKey)) {
            localStorage.setItem(timerKey, questionEndTime.toString());
        }

        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((questionEndTime - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                localStorage.removeItem(timerKey); // Clean up storage
                if (selectedOption === null) { // Only submit if no answer was chosen
                    onSubmitAnswer(-1, question.timeLimit * 1000); 
                }
            }
        }, 250);

        return () => clearInterval(interval);
    }, [question, sessionId, onSubmitAnswer, selectedOption]);

    const handlePlayerAnswer = (index: number) => {
        if (selectedOption !== null) return; // Lock answer after one click
        setSelectedOption(index);

        const timerKey = `solo_timer_${sessionId}_q_${question._id}`;
        const questionEndTime = parseInt(localStorage.getItem(timerKey)!, 10);
        const answerTimeMs = Date.now() - (questionEndTime - question.timeLimit * 1000);

        localStorage.removeItem(timerKey); // Clean up storage
        onSubmitAnswer(index, answerTimeMs);
    };

    // UI Styles and Layout (No changes needed here)
    const getAnswerButtonClass = (index: number) => {
        const base = "w-full text-left p-4 rounded-xl transition-all duration-300 transform border-2 shadow-lg";
        const colors = ["border-purple-400 bg-purple-500/30", "border-emerald-400 bg-emerald-500/30", "border-orange-400 bg-orange-500/30", "border-rose-400 bg-rose-500/30"];
        if (selectedOption !== null) {
            return index === selectedOption ? `${base} bg-blue-500/60 border-blue-300 scale-105` : `${base} bg-gray-700 opacity-50 cursor-not-allowed`;
        }
        return `${base} ${colors[index % 4]} hover:scale-105 cursor-pointer`;
    };

    return (
        <div className="w-full h-full min-h-screen flex flex-col">
            <header className="flex items-center justify-between p-6 bg-black/20">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-lg">{score.toLocaleString()}</span>
                </div>
                <div className="text-center font-bold text-xl">Question {currentQuestionIndex + 1} / {totalQuestions}</div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${timeLeft > 5 ? 'text-white' : 'text-red-400 animate-ping'}`}>{timeLeft}</span>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-8">
                <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">{question.questionText}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                    {question.options.map((answer, index) => (
                        <button key={index} onClick={() => handlePlayerAnswer(index)} className={getAnswerButtonClass(index)} disabled={selectedOption !== null}>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">{String.fromCharCode(65 + index)}</div>
                                <span className="text-xl font-semibold flex-1">{answer.text}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};