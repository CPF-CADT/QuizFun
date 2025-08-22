import { Home } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface GameOverViewProps {
    onFetchResults: () => void;
    onViewMyPerformance: () => void;
    isHost: boolean;
}

export const GameOverView: React.FC<GameOverViewProps> = ({ onFetchResults, onViewMyPerformance, isHost }) => (
    <div className="w-full max-w-md p-10 bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 text-white text-center flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">🎉 Game Over! 🎉</h1>
        
        <p className="text-gray-300 mb-6">Thanks for playing! Check your results below.</p>

        {isHost ? (
            <button 
                onClick={onFetchResults} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold py-3 px-6 rounded-xl shadow-lg"
            >
                View Final Results
            </button>
        ) : (
            <button 
                onClick={onViewMyPerformance} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold py-3 px-6 rounded-xl shadow-lg"
            >
                View My Results
            </button>
        )}

        <Link 
            to='dashboard' 
            className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
           <Home /> Back to Home
        </Link>
    </div>
);
