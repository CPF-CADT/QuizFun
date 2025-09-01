import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Loader, ShieldAlert, Crown, Home, Trophy, Medal, Star } from 'lucide-react';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';
import { ExcelExportButton } from '../components/ui/ExcelExportButton';
import { gameApi, type ResultsPayload } from '../service/gameApi';
import type { PlayerIdentifier } from '../hook/usePerformanceData';
import { useAuth } from '../context/AuthContext';

type LeaderboardPlayer = ResultsPayload['results'][0];

const ResultPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [sessionResults, setSessionResults] = useState<ResultsPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerIdentifier | null>(null);

    useEffect(() => {
        if (!sessionId || !user) {
            setIsLoading(!!user);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        gameApi.getSessionResults(sessionId, { userId: user._id })
            .then(res => {
                setSessionResults(res.data);
            })
            .catch(err => {
                console.error("Failed to load session results", err);
                setError("Could not load results.");
            })
            .finally(() => setIsLoading(false));
    }, [sessionId, user]);

    const sortedResults = useMemo(() => {
        if (!sessionResults?.results) return [];
        return [...sessionResults.results].sort((a, b) => b.score - a.score);
    }, [sessionResults]);

    const handleViewDetails = (player: LeaderboardPlayer) => {
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

        if (player.participantId && isValidObjectId(player.participantId)) {
            setSelectedPlayer({ userId: player.participantId });
        } else {
            setSelectedPlayer({ guestName: player.name });
        }
        setModalOpen(true);
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown className="w-8 h-8 text-yellow-500 drop-shadow-lg" />;
            case 1:
                return <Medal className="w-7 h-7 text-gray-500 drop-shadow-lg" />;
            case 2:
                return <Trophy className="w-7 h-7 text-amber-600 drop-shadow-lg" />;
            default:
                return <Star className="w-6 h-6 text-slate-400" />;
        }
    };

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0:
                return "bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-l-4 border-yellow-500 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] ring-2 ring-yellow-200/50";
            case 1:
                return "bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-l-4 border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ring-2 ring-gray-200/50";
            case 2:
                return "bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-l-4 border-amber-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ring-2 ring-amber-200/50";
            default:
                return "bg-gradient-to-r from-white to-slate-50 border-l-4 border-slate-300 hover:border-indigo-400 shadow-md hover:shadow-lg transform hover:scale-[1.01]";
        }
    };

    const getRankBadge = (index: number) => {
        switch (index) {
            case 0:
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white text-sm font-bold rounded-full shadow-lg">
                        <Crown className="w-4 h-4" />
                        CHAMPION
                    </div>
                );
            case 1:
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-400 to-slate-500 text-white text-sm font-bold rounded-full shadow-lg">
                        <Medal className="w-4 h-4" />
                        RUNNER-UP
                    </div>
                );
            case 2:
                return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                        <Trophy className="w-4 h-4" />
                        THIRD PLACE
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
                    <div className="flex flex-col items-center gap-8 text-white">
                        <div className="relative">
                            <Loader className="w-20 h-20 animate-spin text-white" />
                            <div className="absolute inset-0 w-20 h-20 animate-ping rounded-full bg-white/20"></div>
                            <div className="absolute inset-2 w-16 h-16 animate-pulse rounded-full bg-white/10"></div>
                        </div>
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold">Loading Final Results</h2>
                            <p className="text-white/80 text-lg">Calculating scores and rankings...</p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse animation-delay-200"></div>
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse animation-delay-400"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !sessionResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-950 via-rose-950 to-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-red-500/30 text-white text-center">
                        <div className="flex flex-col items-center gap-8">
                            <div className="relative">
                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <ShieldAlert className="w-10 h-10 text-red-400"/>
                                </div>
                                <div className="absolute -inset-2 bg-red-400/20 rounded-full animate-pulse"></div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold">Unable to Load Results</h2>
                                <p className="text-white/80 text-lg leading-relaxed">
                                    {error || "The requested session could not be found."}
                                </p>
                            </div>
                            <Link 
                                to='/dashboard' 
                                className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg hover:shadow-xl"
                            >
                                <Home size={20} className="group-hover:rotate-12 transition-transform duration-300" /> 
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    const isHost = sessionResults.viewType === 'host';

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
                {/* Enhanced animated background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Enhanced Header Section */}
                    <header className="mb-12">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                            <div className="space-y-6">
                                <button 
                                    onClick={() => navigate('/dashboard')} 
                                    className="group inline-flex items-center gap-3 text-slate-600 hover:text-indigo-600 font-medium transition-all duration-200 bg-white/50 hover:bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30"
                                >
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" /> 
                                    Back to Dashboard
                                </button>
                                <div>
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4 leading-tight">
                                        {isHost ? "Final Rankings" : "Your Results"}
                                    </h1>
                                    <p className="text-lg sm:text-xl text-slate-600 font-medium">
                                        Quiz completed on {new Date().toLocaleDateString('en-US', { 
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
                                            <Trophy className="w-4 h-4" />
                                            {sortedResults.length} participants
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {isHost && sessionId && (
                                <div className="flex-shrink-0">
                                    <ExcelExportButton
                                        type="session"
                                        sessionId={sessionId}
                                        buttonText="Export Results"
                                        buttonClass="group bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                        showOptions={true}
                                    />
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Enhanced Main Leaderboard */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
                            <h3 className="text-3xl font-bold text-white flex items-center gap-4">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Trophy className="w-8 h-8 text-yellow-300" />
                                </div>
                                Leaderboard
                            </h3>
                            <p className="text-indigo-100 mt-3 text-lg">
                                {sortedResults.length} participant{sortedResults.length !== 1 ? 's' : ''} competed • Final rankings
                            </p>
                        </div>
                        
                        <div className="p-8">
                            <div className="space-y-6">
                                {sortedResults.map((player, index) => (
                                    <div
                                        key={player.participantId || player.name}
                                        className={`group relative p-6 sm:p-8 rounded-2xl transition-all duration-300 ${getRankStyle(index)}`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                {/* Enhanced Rank Position */}
                                                <div className="flex flex-col items-center min-w-[80px] space-y-2">
                                                    <div className="relative">
                                                        {getRankIcon(index)}
                                                        {index < 3 && (
                                                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full animate-pulse"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-lg font-bold text-slate-700">
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                                
                                                {/* Enhanced Player Info */}
                                                <div className="space-y-3 flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors duration-200 truncate">
                                                            {player.name}
                                                        </h3>
                                                        {getRankBadge(index)}
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                                                            {player.score.toLocaleString()} Points
                                                        </p>
                                                        {index < 3 && (
                                                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-medium rounded-full">
                                                                <Star className="w-4 h-4" />
                                                                Top Performer
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Enhanced Details Button */}
                                            <div className="flex-shrink-0">
                                                <button 
                                                    onClick={() => handleViewDetails(player)} 
                                                    className="group/btn w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border-2 border-indigo-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                >
                                                    <Eye size={18} className="group-hover/btn:scale-110 transition-transform duration-200" /> 
                                                    <span>View Details</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Enhanced animated background for top 3 */}
                                        {index < 3 && (
                                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <div className={`absolute inset-0 rounded-2xl ${
                                                    index === 0 ? 'bg-gradient-to-r from-yellow-100/30 via-amber-100/20 to-yellow-100/30' :
                                                    index === 1 ? 'bg-gradient-to-r from-gray-100/30 via-slate-100/20 to-gray-100/30' :
                                                    'bg-gradient-to-r from-amber-100/30 via-orange-100/20 to-amber-100/30'
                                                } animate-pulse`}></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {sortedResults.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Trophy className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-600 mb-2">No Results Available</h3>
                                    <p className="text-slate-500">Results will appear here once the session is completed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {selectedPlayer && sessionId && (
                <PerformanceDetailModal 
                    isOpen={isModalOpen} 
                    onClose={() => { setModalOpen(false); setSelectedPlayer(null); }} 
                    sessionId={sessionId} 
                    playerIdentifier={selectedPlayer} 
                />
            )}
        </>
    );
};

export default ResultPage;