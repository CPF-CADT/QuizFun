// src/components/game/PerformanceView.tsx

import React, { useState } from 'react';
import type { IGameHistory } from '../../service/gameApi';
import { QuestionReportModal } from './QuestionReportModal'; // Make sure path is correct
import { Flag } from 'lucide-react'; // Import the Flag icon
import { useLocation } from 'react-router-dom';

// --- HELPER COMPONENTS & ICONS ---
const CheckIcon = () => <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%` }} />
    </div>
);

// --- PROPS DEFINITION ---
interface PerformanceViewProps {
    player: { username?: string };
    performance: IGameHistory[];
    summary: {
        score: number;
        correct: number;
        total: number;
        avgTime: string;
        accuracy: number;
    };
    defaultQuizzId?:string,
}

// --- MAIN VIEW COMPONENT ---
export const PerformanceView: React.FC<PerformanceViewProps> = ({ player, performance, summary ,defaultQuizzId}) => {
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    
    // --- NEW STATE & HANDLERS FOR REPORT MODAL ---
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [reportingQuestion, setReportingQuestion] = useState<{ id: string; text: string } | null>(null);

    const handleOpenReportModal = (questionId: string, questionText: string) => {
        setReportingQuestion({ id: questionId, text: questionText });
        setReportModalOpen(true);
    };

    const handleCloseReportModal = () => {
        setReportModalOpen(false);
        setReportingQuestion(null);
    };

    const handleToggleQuestion = (questionId: string) => {
        setExpandedQuestionId(prevId => (prevId === questionId ? null : questionId));
    };

    if (performance.length === 0) {
        return <p className="text-gray-400 text-center text-lg">No performance data found for this player.</p>;
    }
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const quizzId = searchParams.get('quizzId');

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column: Summary --- */}
                <div className="lg:col-span-1 space-y-6 self-start">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 mb-6 text-lg">
                            For: <span className="font-bold text-white">{player.username || '...'}</span>
                        </p>
                        <div className="space-y-5">
                            <div className="flex justify-between items-baseline"><span className="font-semibold text-gray-300">Accuracy</span><span className="text-2xl font-bold text-yellow-400">{summary.accuracy.toFixed(0)}%</span></div>
                            <ProgressBar value={summary.accuracy} />
                            <div className="flex justify-between items-baseline pt-2"><span className="font-semibold text-gray-300">Total Score</span><span className="text-2xl font-bold text-indigo-400">{summary.score.toLocaleString()}</span></div>
                            <div className="flex justify-between items-baseline"><span className="font-semibold text-gray-300">Correct Answers</span><span className="text-2xl font-bold text-green-400">{summary.correct} / {summary.total}</span></div>
                            <div className="flex justify-between items-baseline"><span className="font-semibold text-gray-300">Average Time</span><span className="text-2xl font-bold text-cyan-400">{summary.avgTime}s</span></div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-semibold px-2">Question Breakdown</h2>
                    {performance.map((item, index) => (
                        <div key={item.questionId} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                            <button onClick={() => handleToggleQuestion(item.questionId)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10">
                                <div className="flex items-center gap-4">
                                    {item.wasUltimatelyCorrect ? <CheckIcon /> : <XIcon />}
                                    <span className="font-medium text-base sm:text-lg">Q{index + 1}: {item.questionText || "Question text not available"}</span>
                                </div>
                                <span className={`text-gray-400 text-lg transform transition-transform duration-300 ${expandedQuestionId === item.questionId ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {expandedQuestionId === item.questionId && (
                                <div className="p-5 border-t border-white/10 bg-black/20 animate-fade-in">
                                    <h4 className="font-semibold mb-3 text-gray-300">Your Attempts:</h4>
                                    <ul className="space-y-2">
                                        {item.attempts.map((attempt, attemptIndex) => (
                                            <li key={attemptIndex} className={`flex items-center justify-between p-3 rounded-lg ${attempt.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-mono text-xs ${attempt.isCorrect ? 'text-green-400' : 'text-red-400'}`}>#{attemptIndex + 1}</span>
                                                    <span>{attempt.selectedOptionText || 'Unknown Option'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <ClockIcon />
                                                    <span>{(attempt.answerTimeMs / 1000).toFixed(2)}s</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* --- NEW REPORT BUTTON --- */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => handleOpenReportModal(item.questionId, item.questionText || '')}
                                            className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-400 border border-red-400/40 rounded-lg hover:bg-red-400/20 transition-colors"
                                        >
                                            <Flag size={14} /> Report Issue
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {reportingQuestion && (
                <QuestionReportModal
                    isOpen={isReportModalOpen}
                    onClose={handleCloseReportModal}
                    quizId={(quizzId)??defaultQuizzId??'no quizzId'}
                    question={reportingQuestion}
                />
            )}
        </>
    );
};