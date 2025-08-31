import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award, Eye, Loader, ShieldAlert, Crown, Home } from 'lucide-react';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';
import { ExcelExportButton } from '../components/ui/ExcelExportButton'; // Make sure this path is correct
import { gameApi, type ISessionAnalytics } from '../service/gameApi';
import type { PlayerIdentifier } from '../hook/usePerformanceData';
import { useAuth } from '../context/AuthContext';

// Define the type for a single player in the leaderboard
type LeaderboardPlayer = ISessionAnalytics['participants'][0];

const ResultPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [sessionDetails, setSessionDetails] = useState<ISessionAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerIdentifier | null>(null);
    const [isHost, setIsHost] = useState(false); // State to determine if the viewer is the host

    useEffect(() => {
        if (!sessionId || !user) {
            setIsLoading(!!user); 
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        gameApi.getSessionAnalytics(sessionId)
            .then(res => {
                const details = res.data;
                setSessionDetails(details);
            })
            .catch(err => {
                console.error("Failed to load session results", err);
                setError("Could not load results.");
            })
            .finally(() => setIsLoading(false));
    }, [sessionId, user]);

    // Determine the results to display based on the user's role
    const visibleResults = useMemo(() => {
        if (!sessionDetails) return [];
        const isUserTheHost = sessionDetails.participants.some(p => p.userId === user?._id); // Simplified check
        setIsHost(isUserTheHost); // For now, let's assume if you are in the game, you can see all results like a host

        if (!isUserTheHost) {
            return sessionDetails.participants.filter(p => p.userId === user?._id);
        }

        return [...sessionDetails.participants].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    }, [sessionDetails, user]);

    const handleViewDetails = (player: LeaderboardPlayer) => {
        if (player.userId) {
            setSelectedPlayer({ userId: player.userId });
            setModalOpen(true);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="flex flex-col items-center gap-4 text-white">
                    <Loader className="w-12 h-12 animate-spin text-indigo-400" />
                    <p className="text-xl font-semibold">Loading Final Results...</p>
                </div>
            </div>
        );
    }

    if (error || !sessionDetails) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="w-full max-w-md p-10 bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-500/50 text-white text-center flex flex-col items-center gap-4">
                    <ShieldAlert className="w-12 h-12 text-red-400"/>
                    <h2 className="text-2xl font-bold">Failed to Load Results</h2>
                    <p className="text-gray-300">{error || "The requested session could not be found."}</p>
                    <Link to='/dashboard' className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-2">
                        <Home size={20} /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-4xl mx-auto">
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2 font-semibold">
                                <ArrowLeft size={18} /> Back to Dashboard
                            </button>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">{sessionDetails.quizTitle}</h1>
                            <p className="text-lg text-gray-500">Session Results from {new Date(sessionDetails.endedAt).toLocaleString()}</p>
                        </div>
                        {isHost && sessionId && (
                             <ExcelExportButton
                                type="session"
                                sessionId={sessionId}
                                buttonText="Export Results"
                                buttonClass="mt-4 sm:mt-0 flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                showOptions={true}
                            />
                        )}
                    </header>

                    <div className="bg-white p-6 rounded-xl border">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Leaderboard</h3>
                        <ul className="space-y-3">
                            {visibleResults.map((player) => (
                                <li key={player.userId || player.name} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 text-center">
                                            <Award className={`w-6 h-6 inline ${player.rank === 1 ? 'text-yellow-500' : player.rank === 2 ? 'text-gray-400' : 'text-orange-500'}`} />
                                        </div>
                                        <img src={player.profileUrl || `https://i.pravatar.cc/150?u=${player.userId}`} alt={player.name} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <p className="font-bold text-lg">{player.name}</p>
                                            <p className="text-indigo-600 font-semibold">{player.score.toLocaleString()} Pts</p>
                                        </div>
                                    </div>
                                    {player.userId && (
                                        <button 
                                            onClick={() => handleViewDetails(player)} 
                                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
                                        >
                                            <Eye size={16} /> Details
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
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