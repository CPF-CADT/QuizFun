import React, { useState } from 'react';
import { usePerformanceData, type PlayerIdentifier } from '../hook/usePerformanceData';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TargetIcon = () => <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const StarIcon = () => <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.29 2.29a1 1 0 00.71.29h3a1 1 0 011 1v3a1 1 0 00.29.71L21 11m-3 2l-2.29 2.29a1 1 0 00-.29.71v3a1 1 0 01-1 1h-3a1 1 0 00-.71.29L9 21m-4-5l2.29-2.29a1 1 0 00.29-.71V10a1 1 0 011-1h3a1 1 0 00.71-.29L13 7" /></svg>;
const CheckCircleIcon = () => <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TimerIcon = () => <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${value}%` }}
        />
    </div>
);

const SummaryCard: React.FC<{ player: any; summary: any }> = ({ player, summary }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
        <p className="text-gray-400 mb-6 text-lg">
            Showing results for: <span className="font-bold text-white">{player.username || '...'}</span>
        </p>
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <TargetIcon />
                <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Accuracy</span>
                        <span className="text-2xl font-bold text-yellow-400">{summary.accuracy.toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={summary.accuracy} />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <StarIcon />
                <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Total Score</span>
                        <span className="text-2xl font-bold text-indigo-400">{summary.score.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <CheckCircleIcon />
                 <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Correct Answers</span>
                        <span className="text-2xl font-bold text-green-400">{summary.correct} / {summary.total}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <TimerIcon />
                <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-300">Average Time</span>
                        <span className="text-2xl font-bold text-cyan-400">{summary.avgTime}s</span>
                    </div>
                </div>
            </div>
        </div>
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
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold px-2 text-white">Question Breakdown</h2>
            {performance.map((item, index) => (
                <div key={item.questionId} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                    <button onClick={() => handleToggleQuestion(item.questionId)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10">
                        <div className="flex items-center gap-4">
                           {item.wasUltimatelyCorrect ? <CheckIcon /> : <XIcon />}
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
                                           <ClockIcon />
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
            <div className="w-full max-w-7xl h-[90vh] bg-slate-900 text-gray-200 border border-purple-800 rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-white">Performance Review</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><CloseIcon /></button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {loading && <p className="animate-pulse text-center text-lg">Loading Details...</p>}
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
        </div>
    );
};