import { Home } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FeedbackModal } from '../ui/FeedbackModal'; 
import { gameApi } from '../../service/gameApi';
import type { IFeedbackRequest } from '../../service/gameApi'; 
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
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const proceedToResults = useCallback(() => {
    setFeedbackModalOpen(false);
    onViewMyPerformance();
  }, [onViewMyPerformance]);
  
  const handleFeedbackSubmit = useCallback(async (rating: number, comment: string) => {
    if (!sessionId || !userId) {
      console.error("Cannot submit feedback: Session ID or User ID is missing.");
      proceedToResults(); 
      return;
    }

    const feedbackData: IFeedbackRequest = {
      userId,
      rating,
      comment: comment || undefined,
    };

    try {
      await gameApi.addFeedback(sessionId, feedbackData);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
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
      <div className="w-full max-w-md p-10 bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 text-white text-center flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">🎉 Game Over! 🎉</h1>
        <p className="text-gray-300 mb-6">Thanks for playing! Check your results below.</p>

        {isHost ? (
          <button 
            onClick={onFetchResults} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold py-3 px-6 rounded-xl shadow-lg"
          >
            View All Player Results
          </button>
        ) : (
          <button 
            onClick={() => setFeedbackModalOpen(true)} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold py-3 px-6 rounded-xl shadow-lg"
          >
            View My Results
          </button>
        )}

        <Link to='/dashboard'
            onClick={handleBackToHome}
          className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-2"
        >
          <Home size={20} /> Back to Home
        </Link>
      </div>

      {!isHost && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={proceedToResults}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
};