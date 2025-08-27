import React, { useEffect, useState, useMemo } from 'react';
import type { ResultsPayload } from '../../context/GameContext';
import type { PlayerIdentifier } from '../../pages/GamePage';
import { Trophy, Crown, Star, Award } from 'lucide-react';

interface GameResultDetailsProps {
    payload: ResultsPayload;
    sessionId: string;
    yourUserId: string;
    onExit: () => void;
    setSelectedPlayer: (player: PlayerIdentifier | null) => void;
}

export const GameResultDetails: React.FC<GameResultDetailsProps> = ({ payload, yourUserId, onExit, setSelectedPlayer }) => {
    const { viewType, results } = payload;
    const [showCelebration, setShowCelebration] = useState(true);
    const [revealedPlayers, setRevealedPlayers] = useState<number[]>([]);
    
    const sortedResults = useMemo(() => [...results].sort((a, b) => b.score - a.score), [results]);

    useEffect(() => {
        const celebrationTimer = setTimeout(() => setShowCelebration(false), 3000);
        sortedResults.forEach((_, index) => {
            setTimeout(() => {
                setRevealedPlayers(prev => [...prev, index]);
            }, 1000 + (index * 500));
        });
        return () => clearTimeout(celebrationTimer);
    }, [sortedResults]);

    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    const handleViewDetails = (player: { participantId?: string; name: string }) => {
        const isGuest = !isValidObjectId(player.participantId || '');
        if (isGuest) {
            setSelectedPlayer({ guestName: player.name });
        } else {
            if (!player.participantId) return;
            setSelectedPlayer({ userId: player.participantId });
        }
    };

    return (
        <div className="w-full max-w-3xl p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white relative overflow-hidden">
            {showCelebration && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-out">
                    <div className="text-center animate-celebration">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">GAME COMPLETE!</h1>
                        <div className="flex justify-center gap-4 text-3xl">
                            <div className="animate-bounce" style={{animationDelay: '0ms'}}>🏆</div>
                            <div className="animate-bounce" style={{animationDelay: '200ms'}}>🎊</div>
                            <div className="animate-bounce" style={{animationDelay: '400ms'}}>✨</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${3 + Math.random() * 2}s` }} />
                ))}
            </div>

            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                        Final Rankings
                        <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                    </div>
                </h1>

                <ul className="space-y-4 mb-8 max-h-96 overflow-y-auto p-2 bg-black/20 rounded-xl">
                    {sortedResults.map((p, index) => {
                        const canViewDetails = viewType === 'host' || p.participantId === yourUserId;
                        const isRevealed = revealedPlayers.includes(index);
                        return (
                            <li key={p.name} className={`flex items-center justify-between p-6 rounded-xl transition-all duration-1000 ${isRevealed ? (index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 animate-winner-reveal' : 'bg-gray-700/50 animate-slide-in-left') : 'bg-gray-800 opacity-30 scale-95'}`} style={{ animationDelay: isRevealed ? `${index * 100}ms` : '0ms' }}>
                                {isRevealed ? (
                                    <>
                                        <div className="flex items-center gap-6">
                                            <div className={`flex items-center justify-center w-16 h-16 rounded-full font-bold text-2xl transition-all duration-500 ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 animate-pulse-glow ring-4 ring-yellow-300' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900' : 'bg-gradient-to-br from-gray-600 to-gray-800 text-white'}`}>
                                                {index === 0 ? '👑' : `#${index + 1}`}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xl font-bold">{p.name}</span>
                                                {index === 0 && (<span className="text-sm text-yellow-400 font-semibold animate-pulse">🌟 CHAMPION 🌟</span>)}
                                            </div>
                                            {index === 0 && <Crown className="w-8 h-8 text-yellow-400 animate-bounce ml-2" />}
                                            {index === 1 && <Award className="w-6 h-6 text-gray-300 ml-2" />}
                                            {index === 2 && <Star className="w-6 h-6 text-orange-400 ml-2" />}
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="text-3xl font-bold text-indigo-400 animate-count-up">{p.score}</span>
                                                <div className="text-sm opacity-80">points</div>
                                            </div>
                                            {canViewDetails && (
                                                <button onClick={() => handleViewDetails(p)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl">
                                                    View Details
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center w-full">
                                        <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <button onClick={onExit} className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl animate-fade-in-up" style={{animationDelay: `${sortedResults.length * 500 + 1000}ms`}}>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-xl">Exit Game</span>
                    </div>
                </button>
            </div>

            <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slide-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes celebration { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                @keyframes fade-out { 0% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; visibility: hidden; } }
                @keyframes winner-reveal { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
                @keyframes float { 0% { transform: translateY(100vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; } }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
                .animate-slide-in-left { animation: slide-in-left 0.5s ease-out forwards; opacity: 0; }
                .animate-celebration { animation: celebration 1s ease-in-out infinite; }
                .animate-fade-out { animation: fade-out 3s ease-out forwards; }
                .animate-winner-reveal { animation: winner-reveal 0.8s ease-out; }
                .animate-float { animation: float linear infinite; }
                .animate-pulse-glow { animation: pulse-glow 2s infinite; }
                .animate-count-up { animation: count-up 0.8s ease-out; }
            `}</style>
        </div>
    );
};