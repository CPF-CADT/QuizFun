import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameApi } from '../service/gameApi';
import type { IGameHistory } from '../service/gameApi';

const CheckIcon = () => <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${value}%` }}
            />
    </div>
);


const PerformanceDetailPage: React.FC = () => {
    // --- (Data fetching and summary calculation logic is unchanged) ---
    
    const { sessionId, userId, guestName } = useParams<{ sessionId: string; userId?: string; guestName?: string; }>();
    const navigate = useNavigate();
    const [performance, setPerformance] = React.useState<IGameHistory[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [expandedQuestionId, setExpandedQuestionId] = React.useState<string | null>(null);
    const [player,setPlayer] = React.useState<{username?:string,userId?:string}>({})
    React.useEffect(() => {
        if (!sessionId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                let response;
                if (userId) {
                    response = await gameApi.getUserPerformanceInSession(userId, sessionId); 
                } else if (guestName) {
                    response = await gameApi.getGuestPerformanceInSession(sessionId, guestName);
                } else {
                    throw new Error("No user or guest identifier found in URL.");
                }
                setPerformance(response.data.performance);
                if(response.data.userId && response.data.username){
                    setPlayer({username:response.data.username,userId:response.data.userId})
                }
            } catch (err) {
                setError('Failed to load performance details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionId, userId, guestName]);
    
    const summary = React.useMemo(() => {
        if (!performance.length) return { score: 0, correct: 0, total: 0, avgTime: 0, accuracy: 0 };

        const totalScore = performance.reduce((sum, item) => sum + item.finalScoreGained, 0);
        const correctAnswers = performance.filter(item => item.wasUltimatelyCorrect).length;
        const totalTime = performance.reduce((sum, item) => sum + (item.attempts.at(-1)?.answerTimeMs || 0), 0);
        
        return {
            score: totalScore,
            correct: correctAnswers,
            total: performance.length,
            avgTime: (totalTime / performance.length / 1000).toFixed(2),
            accuracy: (correctAnswers / performance.length) * 100 || 0,
        };
    }, [performance]);

    const handleToggleQuestion = (questionId: string) => {
        setExpandedQuestionId(prevId => (prevId === questionId ? null : questionId));
    };

    // --- Loading and Error states are now full-screen ---
    if (loading) return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
             <div className="text-2xl font-bold animate-pulse">Loading Performance Details...</div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
            <div className="text-2xl font-bold text-red-400">{error}</div>
        </div>
    );

    // --- NEW: Full-screen layout with a two-column design ---
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- Left Column: Summary & Controls --- */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 self-start">
                    <button onClick={() => navigate('/')} className="w-full text-left bg-white/5 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3">
                        <span className="text-xl">&larr;</span> Back 
                    </button>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h1 className="text-3xl font-bold mb-1">Performance Review</h1>
                        <p className="text-gray-400 mb-6">For {player.username || `User ${player.username}`}</p>

                        <div className="space-y-5">
                            <div className="flex justify-between items-baseline">
                                <span className="font-semibold text-gray-300">Accuracy</span>
                                <span className="text-2xl font-bold text-yellow-400">{summary.accuracy.toFixed(0)}%</span>
                            </div>
                            <ProgressBar value={summary.accuracy} />
                            
                             <div className="flex justify-between items-baseline pt-2">
                                <span className="font-semibold text-gray-300">Total Score</span>
                                <span className="text-2xl font-bold text-indigo-400">{summary.score.toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between items-baseline">
                                <span className="font-semibold text-gray-300">Correct Answers</span>
                                <span className="text-2xl font-bold text-green-400">{summary.correct} / {summary.total}</span>
                            </div>
                             <div className="flex justify-between items-baseline">
                                <span className="font-semibold text-gray-300">Average Time</span>
                                <span className="text-2xl font-bold text-cyan-400">{summary.avgTime}s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Question Details --- */}
                <div className="lg:col-span-2 space-y-4">
                     <h2 className="text-2xl font-semibold px-2">Question Breakdown</h2>
                    {performance.map((item, index) => (
                        <div key={item.questionId} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
                            <button onClick={() => handleToggleQuestion(item.questionId)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10">
                                <div className="flex items-center gap-4">
                                    {item.wasUltimatelyCorrect ? <CheckIcon /> : <XIcon />}
                                    <span className="font-medium text-base sm:text-lg">
                                        Q{index + 1}: {item.questionText || "Question text not available"}
                                    </span>
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
                                                    <span className={`font-mono text-xs ${attempt.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                        #{attemptIndex + 1}
                                                    </span>
                                                    <span>{attempt.selectedOptionText || 'Unknown Option'}</span>
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
            </div>
        </div>
    );
};

export default PerformanceDetailPage;