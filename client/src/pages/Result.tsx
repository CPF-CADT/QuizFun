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
                return <Crown className="w-7 h-7 text-yellow-400 drop-shadow-lg" />;
            case 1:
                return <Medal className="w-6 h-6 text-gray-400 drop-shadow-lg" />;
            case 2:
                return <Trophy className="w-6 h-6 text-amber-600 drop-shadow-lg" />;
            default:
                return <Star className="w-5 h-5 text-slate-400" />;
        }
    };

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0:
                return "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 shadow-lg transform hover:scale-[1.02]";
            case 1:
                return "bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400 shadow-md transform hover:scale-[1.02]";
            case 2:
                return "bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-600 shadow-md transform hover:scale-[1.02]";
            default:
                return "bg-white border-l-4 border-transparent hover:border-indigo-200 shadow-sm hover:shadow-md transform hover:scale-[1.01]";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
                    <div className="flex flex-col items-center gap-6 text-white">
                        <div className="relative">
                            <Loader className="w-16 h-16 animate-spin text-white" />
                            <div className="absolute inset-0 w-16 h-16 animate-ping rounded-full bg-white/20"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold mb-2">Loading Final Results...</p>
                            <p className="text-white/70">Calculating scores and rankings</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !sessionResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-900 to-pink-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-red-500/30 text-white text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <ShieldAlert className="w-16 h-16 text-red-400"/>
                                <div className="absolute -inset-2 bg-red-400/20 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-3">Unable to Load Results</h2>
                                <p className="text-white/80 text-lg leading-relaxed">
                                    {error || "The requested session could not be found."}
                                </p>
                            </div>
                            <Link 
                                to='/dashboard' 
                                className="group mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Animated background elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                </div>

                <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
                    <div className="w-full max-w-5xl">
                        {/* Header Section */}
                        <header className="mb-12">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => navigate('/dashboard')} 
                                        className="group inline-flex items-center gap-3 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                                    >
                                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" /> 
                                        Back to Dashboard
                                    </button>
                                    <div>
                                        <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-3">
                                            {isHost ? "🏆 Final Rankings" : "📊 Your Results"}
                                        </h1>
                                        <p className="text-xl text-slate-600 font-medium">
                                            Quiz completed on {new Date().toLocaleDateString('en-US', { 
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                {isHost && sessionId && (
                                    <div className="flex-shrink-0">
                                        <ExcelExportButton
                                            type="session"
                                            sessionId={sessionId}
                                            buttonText="📥 Export Results"
                                            buttonClass="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                            showOptions={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </header>

                        {/* Main Leaderboard */}
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
                                <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Trophy className="w-8 h-8 text-yellow-300" />
                                    Leaderboard
                                </h3>
                                <p className="text-indigo-100 mt-2 text-lg">
                                    {sortedResults.length} participant{sortedResults.length !== 1 ? 's' : ''} • Final scores
                                </p>
                            </div>
                            
                            <div className="p-8">
                                <div className="space-y-4">
                                    {sortedResults.map((player, index) => (
                                        <div
                                            key={player.participantId || player.name}
                                            className={`group relative p-6 rounded-2xl transition-all duration-300 ${getRankStyle(index)}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    {/* Rank Position */}
                                                    <div className="flex flex-col items-center min-w-[60px]">
                                                        {getRankIcon(index)}
                                                        <span className="text-sm font-bold text-slate-600 mt-1">
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Player Info */}
                                                    <div className="space-y-1">
                                                        <p className="text-2xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors duration-200">
                                                            {player.name}
                                                        </p>
                                                        <div className="flex items-center gap-4">
                                                            <p className="text-xl font-bold text-indigo-600">
                                                                {player.score.toLocaleString()} Points
                                                            </p>
                                                            {index < 3 && (
                                                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                                                                    {index === 0 ? '🥇 Champion' : index === 1 ? '🥈 Runner-up' : '🥉 Third Place'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Details Button */}
                                                <button 
                                                    onClick={() => handleViewDetails(player)} 
                                                    className="group/btn flex items-center gap-3 px-6 py-3 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                >
                                                    <Eye size={18} className="group-hover/btn:scale-110 transition-transform duration-200" /> 
                                                    View Details
                                                </button>
                                            </div>
                                            
                                            {/* Animated background for top 3 */}
                                            {index < 3 && (
                                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    <div className={`absolute inset-0 rounded-2xl ${
                                                        index === 0 ? 'bg-gradient-to-r from-yellow-100/50 to-amber-100/50' :
                                                        index === 1 ? 'bg-gradient-to-r from-gray-100/50 to-slate-100/50' :
                                                        'bg-gradient-to-r from-amber-100/50 to-orange-100/50'
                                                    }`}></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {sortedResults.length === 0 && (
                                    <div className="text-center py-16">
                                        <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-xl text-slate-500 font-medium">No results to display</p>
                                    </div>
                                )}
                            </div>
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