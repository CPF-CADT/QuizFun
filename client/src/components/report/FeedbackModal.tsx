// FILE: src/components/report/FeedbackModal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { reportApi, type IFeedback, type IFeedbackResponse } from '../../service/reportApi';
import { FeelingRating } from '../common/FeelingRating';
import { X, Loader, Inbox } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizId: string | null;
}

const LIMIT = 5;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, quizId }) => {
    const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeedback = useCallback(async (pageNum: number, id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportApi.getQuizFeedback(id, pageNum, LIMIT);
            const { feedbacks: newFeedbacks, totalPages } = response.data;
            
            setFeedbacks(prev => pageNum === 1 ? newFeedbacks : [...prev, ...newFeedbacks]);
            setHasMore(pageNum < totalPages);
        } catch (err) {
            setError("Could not load feedback.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && quizId) {
            // Reset state when opening for a new quiz
            setFeedbacks([]);
            setPage(1);
            setHasMore(true);
            fetchFeedback(1, quizId);
        }
    }, [isOpen, quizId, fetchFeedback]);

    const handleLoadMore = () => {
        if (quizId && !loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchFeedback(nextPage, quizId);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Player Feedback</h2>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {feedbacks.length > 0 && feedbacks.map((fb, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <FeelingRating rating={fb.rating} />
                            {fb.comment && <p className="text-gray-600 mt-2 italic">"{fb.comment}"</p>}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-center py-4"><Loader className="animate-spin text-indigo-500" /></div>
                    )}
                    
                    {!loading && feedbacks.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <Inbox size={40} className="mx-auto mb-2" />
                            <p>No feedback has been submitted for this quiz yet.</p>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                
                {hasMore && !loading && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};