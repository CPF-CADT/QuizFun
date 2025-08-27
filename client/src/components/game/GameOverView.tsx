import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, Trophy, Crown, Star, Zap } from 'lucide-react';
import { FeedbackModal } from '../ui/FeedbackModal'; 
import { gameApi, type IFeedbackRequest } from '../../service/gameApi'; 

interface GameOverViewProps {
    onFetchResults: () => void;
    onViewMyPerformance: () => void;
    isHost: boolean;
    sessionId: string | null;
    userId: string | null;
}

export const GameOverView: React.FC<GameOverViewProps> = ({ 
    onFetchResults, 
    onViewMyPerformance, 
    isHost,
    sessionId,
    userId 
}) => {
    const [showFireworks, setShowFireworks] = useState(true);
    // This state now controls the feedback modal visibility
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowFireworks(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    // This function now handles closing the modal and showing the performance
    const proceedToResults = useCallback(() => {
        setFeedbackModalOpen(false);
        onViewMyPerformance();
    }, [onViewMyPerformance]);
    
    // This function handles submitting the feedback to your API
    const handleFeedbackSubmit = useCallback(async (rating: number, comment: string) => {
        if (!sessionId) {
            console.error("Cannot submit feedback: Session ID is missing.");
            proceedToResults(); 
            return;
        }

        const feedbackData: IFeedbackRequest = {
            rating,
            comment: comment || undefined,
        };

        try {
            await gameApi.addFeedback(sessionId, feedbackData);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
        } finally {
            // Always proceed to results, even if feedback fails
            proceedToResults();
        }
    }, [sessionId, userId, proceedToResults]);
    
    const handleBackToHome = () => {
        sessionStorage.removeItem("quizSessionId");
        sessionStorage.removeItem("quizRoomId");
        sessionStorage.removeItem("quizUserId");
    };

    return (
        <>
            <div className="relative">
                {showFireworks && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="absolute animate-firework" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>
                                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="w-full max-w-lg p-12 bg-gradient-to-br from-gray-900/80 via-purple-900/60 to-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 text-white text-center flex flex-col items-center gap-8 relative z-10">
                    <div className="animate-bounce-in">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-text-glow">
                            🎉 GAME OVER! 🎉
                        </h1>
                        <div className="flex justify-center gap-4 text-4xl">
                            <span className="animate-bounce" style={{animationDelay: '0ms'}}>🏆</span>
                            <span className="animate-bounce" style={{animationDelay: '200ms'}}>🎊</span>
                            <span className="animate-bounce" style={{animationDelay: '400ms'}}>✨</span>
                            <span className="animate-bounce" style={{animationDelay: '600ms'}}>🎈</span>
                        </div>
                    </div>

                    <p className="text-xl text-gray-300 mb-6 animate-fade-in-delayed">What an amazing game! Time to see the results! 🚀</p>

                    <div className="w-full animate-scale-in">
                        {isHost ? (
                            <button onClick={onFetchResults} className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-500 font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl text-xl transform hover:scale-105 animate-pulse-button">
                                <div className="flex items-center justify-center gap-3">
                                    <Trophy className="w-6 h-6 animate-bounce" />
                                    View All Player Results
                                    <Crown className="w-6 h-6 animate-spin" />
                                </div>
                            </button>
                        ) : (
                            // **This is the corrected button onClick handler**
                            <button onClick={() => setFeedbackModalOpen(true)} className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-500 font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl text-xl transform hover:scale-105 animate-pulse-button">
                                <div className="flex items-center justify-center gap-3">
                                    <Star className="w-6 h-6 animate-bounce" />
                                    View My Results
                                    <Zap className="w-6 h-6 animate-pulse" />
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="animate-slide-up">
                        <Link to="/dashboard" onClick={handleBackToHome} className="text-indigo-400 hover:text-indigo-300 transition-all duration-300 font-medium flex items-center gap-2 hover:scale-110 p-3 rounded-xl hover:bg-white/10">
                            <Home size={20} />
                            <span className="text-lg">Back to Home</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* The FeedbackModal is now active for non-host players */}
            {!isHost && (
                <FeedbackModal
                    isOpen={isFeedbackModalOpen}
                    onClose={proceedToResults}
                    onSubmit={handleFeedbackSubmit}
                />
            )}

            <style>{`
                @keyframes firework { 0% { transform: scale(0) rotate(0deg); opacity: 1; } 50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; } 100% { transform: scale(0) rotate(360deg); opacity: 0; } }
                @keyframes bounce-in { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
                @keyframes text-glow { 0%, 100% { text-shadow: 0 0 20px rgba(251, 146, 60, 0.5); } 50% { text-shadow: 0 0 40px rgba(251, 146, 60, 0.8); } }
                @keyframes scale-in { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes slide-up { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                @keyframes pulse-button { 0%, 100% { box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3); } 50% { box-shadow: 0 8px 40px rgba(139, 92, 246, 0.6); } }
                .animate-firework { animation: firework 1s ease-out infinite; }
                .animate-bounce-in { animation: bounce-in 1s ease-out; }
                .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
                .animate-fade-in-delayed { animation: fade-in-up 0.8s ease-out 0.5s both; }
                .animate-scale-in { animation: scale-in 0.6s ease-out 1s both; }
                .animate-slide-up { animation: slide-up 0.5s ease-out 1.5s both; }
                .animate-pulse-button { animation: pulse-button 2s infinite; }
            `}</style>
        </>
    );
};