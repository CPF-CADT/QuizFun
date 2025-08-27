import React, { useEffect, useState, useMemo } from 'react';
import type { GameState } from '../../context/GameContext';

const Trophy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zm-5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6zM5 14a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd"></path>
    </svg>
);

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
        if(userSeleted===undefined) return;
        setSelectedOption(userSeleted);
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

    if (!question || !me) {
        return <div className="text-2xl font-bold animate-pulse text-center mt-10">Loading next question...</div>;
    }

    const handlePlayerAnswer = (index: number) => {
        if (isHost || isAnswerLocked) return;
        if (settings.allowAnswerChange && index === selectedOption) return;
        setSelectedOption(index);
        onSubmitAnswer(index);
        if (!settings.allowAnswerChange) setIsSubmitting(true);
    };

    const getAnswerButtonClass = (index: number) => {
        const base = "relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform border-2 shadow-lg";
        const colors = ["from-purple-500 to-purple-600", "from-emerald-500 to-emerald-600", "from-orange-500 to-orange-600", "from-rose-500 to-rose-600"];

        if (isHost) return `${base} bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed`;

        const isSelected = index === selectedOption;

        if (isAnswerLocked) {
            return isSelected
                ? `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 scale-105 cursor-not-allowed`
                : `${base} bg-gray-200 text-gray-400 opacity-70 cursor-not-allowed`;
        }

        if (settings.allowAnswerChange && isSelected) {
            return `${base} bg-gray-200 text-gray-700 opacity-70 cursor-not-allowed`;
        }

        if (isSelected) {
            return `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 scale-105`;
        }

        return `${base} bg-gradient-to-br ${colors[index % 4]} cursor-pointer hover:scale-105`;
    };

    const sortedPlayers = useMemo(() => [...participants].filter(p => p.role === 'player').sort((a,b)=>b.score-a.score), [participants]);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-purple-200 p-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-5xl flex justify-between items-center p-4 bg-white/70 backdrop-blur-md rounded-2xl mb-6 shadow-md border border-purple-200">
                <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-lg">{me.score.toLocaleString()}</span>
                </div>
                <div className="font-bold text-xl text-center">Question {currentQuestionIndex + 1} / {totalQuestions}</div>
                <div className="relative w-20 h-20 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${timeLeft > 5 ? 'text-purple-800' : 'text-red-400 animate-ping'}`}>{timeLeft}</span>
                </div>
            </div>

            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
                {/* Question + Answers */}
                <div className="flex-1 flex flex-col items-center space-y-6">
                    <h1 className="text-2xl md:text-4xl font-bold text-center">{question.questionText}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {question.options.map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handlePlayerAnswer(index)}
                                className={getAnswerButtonClass(index)}
                                disabled={isHost || isAnswerLocked || (settings.allowAnswerChange && selectedOption === index)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">{String.fromCharCode(65 + index)}</div>
                                    <span className="text-lg font-semibold flex-1">{answer.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {isHost && !settings.autoNext && (
                        <button onClick={onNextQuestion} className="mt-4 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-md transition-all">Next Question</button>
                    )}
                    {!isHost && isAnswerLocked && <p className="text-lg animate-pulse">Answer submitted! Waiting for results...</p>}
                </div>

                {/* Leaderboard */}
                {isHost && (
                    <div className="md:w-1/3 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-md border border-purple-200">
                        <h2 className="text-xl font-bold text-center mb-4">Live Leaderboard</h2>
                        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {sortedPlayers.map((p,i) => (
                                <li key={p.user_id} className="flex justify-between items-center bg-purple-50 p-2 rounded-lg shadow-sm">
                                    <span className="font-semibold">#{i+1} {p.user_name}</span>
                                    <span className="font-bold text-yellow-400">{p.score.toLocaleString()} pts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
