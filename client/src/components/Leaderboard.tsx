import React, { useState, useEffect } from 'react';
import { reportApi, type ILeaderboardPlayer } from '../service/reportApi';
import { useAuth } from '../context/AuthContext';
import { Trophy, Loader, ShieldQuestion, Crown, Medal, Award, Star, Users } from 'lucide-react';

// --- Reusable Row Component ---
const LeaderboardRow: React.FC<{ 
    player: ILeaderboardPlayer; 
    isCurrentUser: boolean;
    index: number; 
}> = ({ player, isCurrentUser, index }) => {

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
        if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
        return (
            <span className="font-bold text-slate-500 text-sm w-5 text-center">
                {rank}
            </span>
        );
    };
    return (
        <div 
            className={`flex items-center p-3 rounded-xl transition-all duration-300 ${
                isCurrentUser 
                    ? 'bg-indigo-50 border border-indigo-200 shadow-md' 
                    : 'bg-white border border-transparent hover:bg-slate-50'
            }`}
            style={{ 
                animation: `fadeInUp 0.5s ease-out ${index * 80}ms forwards`,
                opacity: 0
            }}
        >
            {/* Rank */}
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
                {getRankIcon(player.rank)}
            </div>

            {/* Player Info */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <img
                    src={player.profileUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${player.name}`}
                    alt={player.name}
                    className="w-11 h-11 rounded-full bg-slate-200 object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{player.name}</p>
                    <div className="flex items-center text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> 
                            {player.totalGamesPlayed} games
                        </span>
                    </div>
                </div>
            </div>

            {/* Score */}
            <div className="text-right ml-4 flex-shrink-0">
                <p className="font-bold text-xl text-indigo-600 flex items-center gap-1.5 justify-end">
                    <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                    {Math.round(player.totalScore)}
                </p>
                <p className="text-xs text-slate-500">total Points</p>
            </div>
        </div>
    );
};

// --- Main Leaderboard Component ---
export const Leaderboard: React.FC = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<ILeaderboardPlayer[]>([]);
    const [userRank, setUserRank] = useState<ILeaderboardPlayer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const response = await reportApi.getLeaderboard(10);
                setLeaderboard(response.data.leaderboard);
                setUserRank(response.data.userRank || null);
            } catch (err) {
                setError("Could not load the leaderboard. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col justify-center items-center py-20">
                    <Loader className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="mt-4 text-slate-600 font-medium">Loading leaderboard...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center py-16 px-4">
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldQuestion className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 font-semibold mb-2">Oops! Something went wrong</p>
                    <p className="text-slate-500 text-sm">{error}</p>
                </div>
            );
        }
        if (leaderboard.length === 0) {
            return (
                <div className="text-center py-20 px-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Players Yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Be the first to play and claim a spot!</p>
                </div>
            );
        }
        return (
            <div className="space-y-2 p-3">
                {leaderboard.map((player, index) => (
                    <LeaderboardRow 
                        key={`${player._id.toString()}-${player.name}`} 
                        player={player}
                        isCurrentUser={!!user && user._id === player._id.toString()}
                        index={index}
                    />
                ))}
            </div>
        );
    };

    const isUserInTopList = user && leaderboard.some(p => p._id.toString() === user._id);

    return (
        <>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg w-full max-w-4xl mx-auto overflow-hidden">
                <header className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white overflow-hidden">
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full opacity-50"></div>
                    <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/10 rounded-full opacity-50"></div>
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <Trophy className="w-8 h-8 text-yellow-300" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Leaderboard</h2>
                                <p className="text-indigo-100 text-sm">Our Top Quiz Masters</p>
                            </div>
                        </div>
                    </div>
                </header>
                
                <div className="bg-slate-50">
                    <div className="max-h-[500px] overflow-y-auto">
                        {renderContent()}
                    </div>

                    {user && userRank && !isUserInTopList && (
                        <div className="sticky bottom-0 bg-white/80 p-3 border-t border-slate-200 backdrop-blur-sm">
                            <LeaderboardRow player={userRank} isCurrentUser={true} index={0} />
                        </div>
                    )}
                </div>
            </div>

            <style>
            {`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}
            </style>
        </>
    );
};