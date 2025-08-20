import React, { useEffect, useState, useMemo } from 'react';
import type { GameState } from '../../context/GameContext';

const Trophy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zm-5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6zM5 14a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
);

interface QuestionViewProps {
    gameState: GameState;
    onSubmitAnswer: (index: number) => void;
    onNextQuestion: () => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ gameState, onSubmitAnswer, onNextQuestion }) => {
    const { question, yourUserId, participants, currentQuestionIndex, totalQuestions, questionStartTime, settings } = gameState;
    const [timeLeft, setTimeLeft] = useState(question?.timeLimit || 0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const isAnswerLocked = !settings.allowAnswerChange && !!me?.hasAnswered;

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
        if (isHost || isAnswerLocked) return;
        if (settings.allowAnswerChange && index === selectedOption) return;
        setSelectedOption(index);
        onSubmitAnswer(index);
    };

    const getAnswerButtonClass = (index: number) => {
    const base = "relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform border-2 shadow-lg";
    const colors = ["from-purple-500 to-purple-600", "from-emerald-500 to-emerald-600", "from-orange-500 to-orange-600", "from-rose-500 to-rose-600"];

    if (isHost) return `${base} bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed`;

    const isSelected = index === selectedOption;

    if (!settings.allowAnswerChange && !!me?.hasAnswered) {
        return isSelected
            ? `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 scale-105 cursor-not-allowed`
            : `${base} bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed`;
    }

    if (settings.allowAnswerChange && isSelected) {
        return `${base} bg-gray-500 text-gray-200 opacity-50 cursor-not-allowed`;
    }

    if (isSelected) {
        return `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 scale-105`;
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

    return (
        <div className="w-full h-full min-h-screen flex flex-col">
            {renderHeader()}
            <main className={`flex-1 flex p-8 gap-8 ${isHost ? 'flex-row items-start' : 'flex-col items-center justify-center'}`}>
                <div className="flex flex-col items-center justify-center space-y-8 flex-1">
                    <h1 className="text-3xl md:text-5xl font-bold text-center">{question.questionText}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                        {question.options.map((answer, index) => (
                            <button key={index} onClick={() => handlePlayerAnswer(index)} className={getAnswerButtonClass(index)} disabled={isHost || isAnswerLocked }>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">{String.fromCharCode(65 + index)}</div>
                                    <span className="text-xl font-semibold flex-1">{answer.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {isHost && !settings.autoNext && (<button onClick={onNextQuestion} className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Next Question</button>)}
                    {!isHost && isAnswerLocked  && <p className="text-lg animate-pulse">Answer submitted! Waiting for results...</p>}
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