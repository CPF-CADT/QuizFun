import React, { useState, useEffect } from 'react';
import { X, Angry, Frown, Meh, Smile, Laugh } from 'lucide-react';

// --- PROPS INTERFACE ---
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void; // Called when skipping or closing
  onSubmit: (rating: number, comment: string) => void; // Called on submission
}

// --- RATING DATA ---
const ratings = [
  { value: 1, label: 'Awful', Icon: Angry, color: 'text-red-500' },
  { value: 2, label: 'Bad', Icon: Frown, color: 'text-orange-500' },
  { value: 3, label: 'Okay', Icon: Meh, color: 'text-yellow-500' },
  { value: 4, label: 'Good', Icon: Smile, color: 'text-green-500' },
  { value: 5, label: 'Great', Icon: Laugh, color: 'text-teal-400' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedRating(null);
      setHoverRating(null);
      setComment('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (selectedRating !== null) {
      onSubmit(selectedRating, comment);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div 
        className="relative bg-gray-800 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white transform transition-all duration-300 scale-95 animate-scale-in"
        style={{ animation: 'scale-in 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-colors"
          aria-label="Close feedback modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-2">How was it?</h2>
        <p className="text-center text-gray-400 mb-6">Your feedback helps us improve.</p>

        {/* Rating Faces */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 my-8">
          {ratings.map(({ value, label, Icon, color }) => (
            <div
              key={value}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => setSelectedRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
            >
              <div
                className={`transform transition-all duration-200 ${hoverRating === value || selectedRating === value ? 'scale-110' : 'scale-100'}`}
              >
                <Icon
                  size={48}
                  className={`transition-colors ${selectedRating === value ? color : (hoverRating !== null && value <= hoverRating) ? 'text-gray-200' : 'text-gray-500'}`}
                />
              </div>
              <span className={`text-xs font-semibold transition-opacity duration-200 ${hoverRating === value || selectedRating === value ? 'opacity-100' : 'opacity-0'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Comment Area */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any other comments? (optional)"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={selectedRating === null}
            className="w-full bg-indigo-600 font-semibold py-3 px-6 rounded-xl shadow-lg transition-all
                       hover:bg-indigo-500 
                       disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit & View Results
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-400 hover:text-white transition-colors py-2"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};


