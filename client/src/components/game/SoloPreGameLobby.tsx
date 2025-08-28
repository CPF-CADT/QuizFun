// src/components/game/SoloPreGameLobby.tsx (UPDATED)

import React, { useState, useEffect } from 'react';
import { quizApi } from '../../service/quizApi';
import { PlayCircle, User } from 'lucide-react';

interface SoloPreGameLobbyProps {
    quizId: string;
    onStart: (playerName: string) => void; // Now passes the name back
}

export const SoloPreGameLobby: React.FC<SoloPreGameLobbyProps> = ({ quizId, onStart }) => {
    const [quizTitle, setQuizTitle] = useState('Loading Quiz...');
    const [isLoading, setIsLoading] = useState(true);
    const [playerName, setPlayerName] = useState(''); // State for player's name

    useEffect(() => {
        quizApi.getQuizById(quizId)
            .then(response => {
                setQuizTitle(response.data.title);
                setIsLoading(false);
            })
            .catch(() => {
                setQuizTitle('Could not load quiz');
                setIsLoading(false);
            });
    }, [quizId]);

    const handleStartClick = () => {
        if (playerName.trim()) {
            onStart(playerName.trim());
        }
    };

    return (
        <div className="w-full max-w-2xl p-8 bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 text-white text-center flex flex-col items-center">
            <h1 className="text-4xl font-extrabold mb-3">You are about to begin:</h1>
            <p className="text-2xl text-indigo-300 font-semibold mb-6 h-16">{quizTitle}</p>
            
            {/* --- NEW: Player Name Input --- */}
            <div className="w-full max-w-xs mb-6">
                <label htmlFor="playerName" className="block text-sm font-medium text-gray-400 mb-2">Enter your nickname to start</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        id="playerName"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Your Name..."
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            
            <button
                onClick={handleStartClick}
                disabled={isLoading || !playerName.trim()}
                className="w-full max-w-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlayCircle />
                Start Quiz
            </button>
        </div>
    );
};