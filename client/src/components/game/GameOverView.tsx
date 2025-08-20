import React from 'react';

interface GameOverViewProps {
    onFetchResults: () => void;
    onViewMyPerformance: () => void;
    isHost: boolean;
}

export const GameOverView: React.FC<GameOverViewProps> = ({ onFetchResults, onViewMyPerformance, isHost }) => (
    <div className="w-full max-w-md p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white text-center">
        <h1 className="text-5xl font-bold mb-6">🎉 Game Over! 🎉</h1>
        
        {isHost ? (
            <button onClick={onFetchResults} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700">
                View Final Results
            </button>
        ) : (
            <button onClick={onViewMyPerformance} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-700">
                View My Results
            </button>
        )}
    </div>
);