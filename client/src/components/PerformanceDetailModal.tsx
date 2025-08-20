import React, { useEffect, useState, useMemo } from 'react';
import { gameApi } from '../service/gameApi';
import type { IGameHistory } from '../service/gameApi';

// Props for the modal: controls visibility and knows which player to show
interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  playerIdentifier: { userId: string } | { guestName: string } | null;
}


// --- HELPER COMPONENTS & ICONS ---

const CheckIcon = () => <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${value}%` }}
        />
    </div>
);


// --- MAIN MODAL COMPONENT ---

export const PerformanceDetailModal: React.FC<PerformanceModalProps> = ({ isOpen, onClose, sessionId, playerIdentifier }) => {
  const [performance, setPerformance] = useState<IGameHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [player, setPlayer] = useState<{ username?: string, userId?: string }>({});

  useEffect(() => {
    if (!isOpen || !playerIdentifier) {
      if(!isOpen) {
        setPerformance([]); // Clear data when closing
        setExpandedQuestionId(null);
      }
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;
        if ('userId' in playerIdentifier) {
          response = await gameApi.getUserPerformanceInSession(playerIdentifier.userId, sessionId);
        } else {
          response = await gameApi.getGuestPerformanceInSession(sessionId, playerIdentifier.guestName);
        }
        
        const performanceData = Array.isArray(response.data) ? response.data : response.data.performance;
        setPerformance(performanceData || []);
        
        if (response.data.username) {
          setPlayer({ username: response.data.username, userId: response.data.userId });
        } else if ('guestName' in playerIdentifier) {
            setPlayer({ username: playerIdentifier.guestName });
        } else {
            setPlayer({ userId: playerIdentifier.userId });
        }

      } catch (err) {
        setError('Failed to load performance details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, playerIdentifier, sessionId]);

  const summary = useMemo(() => {
    if (!performance || !performance.length) return { score: 0, correct: 0, total: 0, avgTime: "0.00", accuracy: 0 };

    const totalScore = performance.reduce((sum, item) => sum + item.finalScoreGained, 0);
    const correctAnswers = performance.filter(item => item.wasUltimatelyCorrect).length;
    const totalTime = performance.reduce((sum, item) => sum + (item.attempts.at(-1)?.answerTimeMs || 0), 0);
    const totalQuestions = performance.length;
    
    return {
        score: totalScore,
        correct: correctAnswers,
        total: totalQuestions,
        avgTime: totalQuestions > 0 ? (totalTime / totalQuestions / 1000).toFixed(2) : "0.00",
        accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
    };
  }, [performance]);

  const handleToggleQuestion = (questionId: string) => {
    setExpandedQuestionId(prevId => (prevId === questionId ? null : questionId));
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-7xl h-[90vh] bg-slate-900 border border-purple-800 rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h1 className="text-3xl font-bold">Performance Review</h1>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {loading && <p className="animate-pulse text-center text-lg">Loading Details...</p>}
          {error && <p className="text-red-400 text-center text-lg">{error}</p>}
          
          {!loading && !error && performance.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6 self-start">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <p className="text-gray-400 mb-6 text-lg">
                        For: <span className="font-bold text-white">{player.username || '...'}</span>
                    </p>
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
          )}
          {!loading && !error && performance.length === 0 && (
                <p className="text-gray-400 text-center text-lg">No performance data found for this player in this session.</p>
           )}
        </main>
      </div>
    </div>
  );
};