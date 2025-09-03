import React, { useState, useCallback } from 'react';
import { Home } from 'lucide-react';
import { FeedbackModal } from '../ui/FeedbackModal'; 
import { gameApi, type IFeedbackRequest } from '../../service/gameApi'; 

interface GameOverViewProps {
    // onFetchResults: () => void;
    onViewMyPerformance: () => void;
    isHost: boolean;
    sessionId: string | null;
    userId: string | null;
    onExit: () => void; // ✅ onExit prop is used for cleanup
}

export const GameOverView: React.FC<GameOverViewProps> = ({ 
    // onFetchResults, 
    onViewMyPerformance, 
    isHost,
    sessionId,
    userId,
    onExit 
}) => {
    // const [showFireworks, setShowFireworks] = useState(true);
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

    // useEffect(() => {
    //     if (isHost) {
    //         onFetchResults();
    //     }
    //     const timer = setTimeout(() => setShowFireworks(false), 3000);
    //     return () => clearTimeout(timer);
    // }, [isHost, onFetchResults]);

    const proceedToResults = useCallback(() => {
        setFeedbackModalOpen(false);
        onViewMyPerformance();
    }, [onViewMyPerformance]);
    
    const handleFeedbackSubmit = useCallback(async (rating: number, comment: string) => {
        if (!sessionId) {
            proceedToResults(); 
            return;
        }
        const feedbackData: IFeedbackRequest = { rating, comment: comment || undefined };
        try {
            await gameApi.addFeedback(sessionId, feedbackData);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
        } finally {
            proceedToResults();
        }
    }, [sessionId, userId, proceedToResults]);
    
    return (
        <>
            <div className="relative w-full min-h-screen flex items-center justify-center p-4">
                {/* Fireworks Animation */}
                {/* {showFireworks && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="absolute animate-firework" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s` }}>
                                <div className="w-3 h-3 bg-gradient-to-r from-yellow-300 to-red-400 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                )} */}

                <div className="w-full max-w-md p-6 md:p-12 bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 text-white text-center flex flex-col items-center gap-6 relative z-10">
                    <div className="animate-bounce-in">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                            🎉 GAME OVER! 🎉
                        </h1>
                        <div className="flex justify-center gap-3 text-3xl">
                            <span className="animate-bounce" style={{animationDelay: '0ms'}}>🏆</span>
                            <span className="animate-bounce" style={{animationDelay: '150ms'}}>🎊</span>
                            <span className="animate-bounce" style={{animationDelay: '300ms'}}>✨</span>
                        </div>
                    </div>

                    <p className="text-lg text-gray-300 animate-fade-in-delayed">Great game! Let's see how you did. 🚀</p>

                    <div className="w-full animate-scale-in">
                        {isHost ? (
                            <div className="text-center p-4">
                                <p className="text-xl font-semibold animate-pulse">Fetching final results...</p>
                            </div>
                        ) : (
                            <button onClick={() => setFeedbackModalOpen(true)} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-bold py-3 px-6 rounded-xl shadow-lg text-lg transform hover:scale-105">
                                View My Results
                            </button>
                        )}
                    </div>
                    
                    {/* ✅ FIXED: The onClick handler now calls onExit to clean up the session */}
                    <div className="animate-slide-up">
                        <button onClick={onExit} className="text-indigo-400 hover:text-indigo-300 transition-all duration-300 font-medium flex items-center gap-2 p-2 rounded-lg hover:bg-white/10">
                            <Home size={18} />
                            <span>Back to Home</span>
                        </button>
                    </div>
                </div>
            </div>

            {!isHost && (
                <FeedbackModal
                    isOpen={isFeedbackModalOpen}
                    onClose={proceedToResults}
                    onSubmit={handleFeedbackSubmit}
                />
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes firework { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
                @keyframes bounce-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .animate-firework { animation: firework 1.2s ease-out infinite; }
                .animate-bounce-in { animation: bounce-in 0.8s ease-out; }
                .animate-fade-in-delayed { animation: fade-in-up 0.8s ease-out 0.5s both; }
                .animate-scale-in { animation: scale-in 0.6s ease-out 1s both; }
                .animate-slide-up { animation: slide-up 0.5s ease-out 1.5s both; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </>
    );
};