import React, { useState, useEffect } from 'react';
import { usePerformanceData, type PlayerIdentifier } from '../hook/usePerformanceData';
import { X, Check, Clock, Target, Star, CheckCircle, Award } from 'lucide-react';

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        // Animate the progress bar on component mount
        const timer = setTimeout(() => setWidth(value), 100);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${width}%` }}
            />
        </div>
    );
};

const SummaryCard: React.FC<{ player: any; summary: any }> = ({ player, summary }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full animate-fade-in-up">
        <p className="text-gray-400 mb-6 text-lg">
            Showing results for: <span className="font-bold text-white">{player.username || '...'}</span>
        </p>
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Target className="w-6 h-6 text-yellow-400" />
                <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Accuracy</span>
                        <span className="text-2xl font-bold text-yellow-400">{summary.accuracy.toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={summary.accuracy} />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Star className="w-6 h-6 text-indigo-400" />
                <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Total Score</span>
                        <span className="text-2xl font-bold text-indigo-400">{summary.score.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Correct Answers</span>
                        <span className="text-2xl font-bold text-green-400">{summary.correct} / {summary.total}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-cyan-400" />
                <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Average Time</span>
                        <span className="text-2xl font-bold text-cyan-400">{summary.avgTime}s</span>
                    </div>
                </div>
            </div>
        </div>
        {summary.accuracy > 80 && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-400 animate-bounce" />
                <div>
                    <h4 className="font-bold text-yellow-300">Excellent Accuracy!</h4>
                    <p className="text-sm text-yellow-400/80">You're a quiz master!</p>
                </div>
            </div>
        )}
    </div>
);

const QuestionBreakdown: React.FC<{ performance: any[] }> = ({ performance }) => {
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

    const handleToggleQuestion = (questionId: string) => {
        setExpandedQuestionId(prevId => (prevId === questionId ? null : questionId));
    };

    if (performance.length === 0) {
        return <p className="text-gray-400 text-center text-lg">No performance data found for this player.</p>;
    }

    return (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-semibold px-2 text-white">Question Breakdown</h2>
            {performance.map((item, index) => (
                <div key={item.questionId} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                    <button onClick={() => handleToggleQuestion(item.questionId)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            {item.wasUltimatelyCorrect ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                            <span className="font-medium text-base sm:text-lg text-gray-100">
                                Q{index + 1}: {item.questionText || "Question text not available"}
                            </span>
                        </div>
                        <span className={`text-gray-400 text-lg transform transition-transform duration-300 ${expandedQuestionId === item.questionId ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedQuestionId === item.questionId && (
                        <div className="p-5 border-t border-white/10 bg-black/20 animate-fade-in">
                            <h4 className="font-semibold mb-3 text-gray-300">Your Attempts:</h4>
                            <ul className="space-y-2">
                                {item.attempts.map((attempt: any, attemptIndex: number) => (
                                    <li key={attemptIndex} className={`flex items-center justify-between p-3 rounded-lg ${attempt.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono text-xs ${attempt.isCorrect ? 'text-green-400' : 'text-red-400'}`}>#{attemptIndex + 1}</span>
                                            <span className="text-gray-200">{attempt.selectedOptionText || 'Unknown Option'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <Clock className="w-4 h-4" />
                                            <span>{(attempt.answerTimeMs / 1000).toFixed(2)}s</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

interface PerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    playerIdentifier: PlayerIdentifier | null;
}

export const PerformanceDetailModal: React.FC<PerformanceModalProps> = ({ isOpen, onClose, sessionId, playerIdentifier }) => {
    const { loading, error, player, performance, summary } = usePerformanceData(sessionId, playerIdentifier);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-7xl h-[90vh] bg-slate-900 text-gray-200 border border-purple-800 rounded-2xl shadow-2xl flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-white">Performance Review</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><X /></button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {loading && (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-center text-lg">{error}</p>}
                    
                    {!loading && !error && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <SummaryCard player={player} summary={summary} />
                            </div>
                            <div className="lg:col-span-2">
                                <QuestionBreakdown performance={performance} />
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};