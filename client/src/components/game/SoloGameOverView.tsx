// src/components/game/SoloGameOverView.tsx

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, Trophy, BarChart2 } from 'lucide-react';
import { FeedbackModal } from '../ui/FeedbackModal';
import { gameApi, type IFeedbackRequest } from '../../service/gameApi';
import { useAuth } from '../../context/AuthContext';

interface SoloGameOverViewProps {
    finalScore: number;
    sessionId: string;
    onViewResults: () => void;
}

export const SoloGameOverView: React.FC<SoloGameOverViewProps> = ({ finalScore, sessionId, onViewResults }) => {
    const { isAuthenticated } = useAuth();
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

    // This function proceeds to the results view after feedback is handled
    const proceedToResults = useCallback(() => {
        setFeedbackModalOpen(false);
        onViewResults(); // Call the original function to show performance details
    }, [onViewResults]);

    // Handler to submit feedback to the API
    const handleFeedbackSubmit = useCallback(async (rating: number, comment: string) => {
        const feedbackData: IFeedbackRequest = {
            rating,
            comment: comment || undefined,
        };
        try {
            await gameApi.addFeedback(sessionId, feedbackData);
        } catch (error) {
            console.error("Failed to submit solo feedback:", error);
        } finally {
            proceedToResults(); // Always proceed, even if API call fails
        }
    }, [sessionId, proceedToResults]);

    const handleExit = () => {
        const quizId = Object.keys(sessionStorage).find(key => sessionStorage.getItem(key) === sessionId)?.split('_')[1];
        if (quizId) {
             sessionStorage.removeItem(`soloSession_${quizId}`);
        }
    };

    return (
        <>
            <div className="w-full max-w-md p-8 sm:p-12 bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 text-white text-center flex flex-col items-center gap-6">
                <div className="animate-bounce-in">
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        🎉 GAME OVER! 🎉
                    </h1>
                    <p className="text-lg text-gray-300">You completed the quiz!</p>
                </div>

                <div className="bg-black/30 p-6 rounded-xl w-full">
                    <p className="text-gray-400 text-sm">YOUR FINAL SCORE</p>
                    <p className="text-5xl font-bold text-yellow-400 flex items-center justify-center gap-3">
                        <Trophy /> {finalScore.toLocaleString()}
                    </p>
                </div>

                {/* This button now opens the feedback modal first */}
                <button
                    onClick={() => setFeedbackModalOpen(true)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                    <BarChart2 size={20} />
                    View My Performance
                </button>

                <Link to={isAuthenticated ? "/dashboard" : "/"} onClick={handleExit} className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center gap-2">
                    <Home size={18} />
                    <span>Back to Home</span>
                </Link>
            </div>

            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={proceedToResults} // If the user closes the modal, skip feedback and show results
                onSubmit={handleFeedbackSubmit}
            />
        </>
    );
};