import { Angry, Frown, Meh, Smile, Laugh } from 'lucide-react';

// --- RATING DATA (from your FeedbackModal) ---
const ratings = [
  { value: 1, label: 'Awful', Icon: Angry, color: 'text-red-500' },
  { value: 2, label: 'Bad', Icon: Frown, color: 'text-orange-500' },
  { value: 3, label: 'Okay', Icon: Meh, color: 'text-yellow-500' },
  { value: 4, label: 'Good', Icon: Smile, color: 'text-green-500' },
  { value: 5, label: 'Great', Icon: Laugh, color: 'text-teal-400' },
];

// --- NEW REUSABLE COMPONENT ---
export const FeelingRating: React.FC<{ rating: number }> = ({ rating }) => {
    // Find the corresponding rating object, default to 'Okay' if not found
    const ratingInfo = ratings.find(r => r.value === Math.round(rating)) || ratings[2];

    if (!ratingInfo) return null;

    const { Icon, color, label } = ratingInfo;

    return (
        <div className={`flex items-center gap-2 font-semibold ${color}`}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </div>
    );
};