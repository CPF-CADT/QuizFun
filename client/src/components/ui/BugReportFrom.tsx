import React, { useState, useEffect } from 'react';
import { X, Angry, Frown, Meh, Smile, Laugh } from 'lucide-react';

// --- PROPS INTERFACE ---
interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: { title: string; description: string; rating: number }) => void;
}

// --- RATING DATA ---
const ratings = [
  { value: 1, label: 'Awful', Icon: Angry, color: 'text-red-500' },
  { value: 2, label: 'Bad', Icon: Frown, color: 'text-orange-500' },
  { value: 3, label: 'Okay', Icon: Meh, color: 'text-yellow-500' },
  { value: 4, label: 'Good', Icon: Smile, color: 'text-green-500' },
  { value: 5, label: 'Great', Icon: Laugh, color: 'text-teal-400' },
];

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const isFormValid = title.trim() !== '' && description.trim() !== '' && selectedRating !== null;

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSelectedRating(null);
        setHoverRating(null);
      }, 300); // Reset after animation
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit({ title, description, rating: selectedRating });
      handleClose();
    }
  };
  
  const animationClass = isClosing ? 'animate-scale-out' : 'animate-scale-in';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <form 
        onSubmit={handleSubmit}
        className={`relative bg-gray-800 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white transform ${animationClass}`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-colors"
          aria-label="Close bug report modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-center mb-2">Report a Bug</h2>
        <p className="text-center text-gray-400 mb-8">Your detailed report helps us fix issues faster.</p>

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize the issue..."
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the steps to reproduce the bug..."
            required
            rows={5}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* --- RATING FACES --- */}
        <p className="text-center text-gray-400 mt-6 mb-4">How frustrating was this bug?</p>
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6">
          {ratings.map(({ value, label, Icon, color }) => (
            <div
              key={value}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => setSelectedRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
            >
              <div
                className={`transform transition-all duration-200 ${hoverRating === value || selectedRating === value ? 'scale-125' : 'scale-100'}`}
              >
                <Icon
                  size={40}
                  className={`transition-colors duration-200 ${selectedRating === value ? color : (hoverRating !== null && value <= hoverRating) ? 'text-gray-200' : 'text-gray-500'}`}
                />
              </div>
              <span className={`text-xs font-semibold transition-opacity duration-200 ${hoverRating === value || selectedRating === value ? 'opacity-100' : 'opacity-0'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-indigo-600 font-semibold py-3 px-6 rounded-xl shadow-lg transition-all
                       hover:bg-indigo-500 
                       disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Report
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full text-gray-400 hover:text-white transition-colors py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BugReportModal;