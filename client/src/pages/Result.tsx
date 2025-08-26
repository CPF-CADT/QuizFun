import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Crown, Home, Loader, ShieldAlert } from 'lucide-react';

// API and Component Imports
import { gameApi, type ResultsPayload } from '../service/gameApi';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';
import type { PlayerIdentifier } from '../hook/usePerformanceData';
import { useAuth } from '../context/AuthContext'; // Import the Auth Context

// Deriving the player type directly from your ResultsPayload interface
type LeaderboardPlayer = ResultsPayload['results'][0];

const ResultPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user } = useAuth(); // Get the currently logged-in user
    const [sessionResults, setSessionResults] = useState<ResultsPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerIdentifier | null>(null);

    useEffect(() => {
        // Guard: Don't fetch until we have both the session ID and the logged-in user
        if (!sessionId) {
            setError("No game session ID provided in the URL.");
            setLoading(false);
            return;
        }
        if (!user) {
            // This is normal on initial load, so we don't set an error, just wait.
            setLoading(true);
            return;
        }

        const fetchSessionResults = async () => {
            try {
                setLoading(true);
                // FIXED: Pass the logged-in user's ID to the API call
                const response = await gameApi.getSessionResults(sessionId, { userId: user._id });
                setSessionResults(response.data);
            } catch (err) {
                setError("Could not load the results for this game session.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionResults();
    }, [sessionId, user]); // Dependency array now includes the user

    const sortedLeaderboard = useMemo(() => {
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
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center gap-4 text-white">
                    <Loader className="w-12 h-12 animate-spin text-indigo-400" />
                    <p className="text-xl font-semibold">Loading Final Results...</p>
                </div>
            );
        }

        if (error || !sessionResults) {
            return (
                 <div className="w-full max-w-md p-10 bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-500/50 text-white text-center flex flex-col items-center gap-4">
                    <ShieldAlert className="w-12 h-12 text-red-400"/>
                    <h2 className="text-2xl font-bold">Failed to Load Results</h2>
                    <p className="text-gray-300">{error || "The requested session could not be found."}</p>
                     <Link to='/dashboard' className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-2">
                         <Home size={20} /> Back to Dashboard
                     </Link>
                </div>
            );
        }

        return (
            <div className="w-full max-w-2xl p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white">
                <h1 className="text-3xl font-bold text-center mb-6">Final Rankings</h1>

                <ul className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto p-2 bg-black/20 rounded-lg">
                    {sortedLeaderboard.map((player, index) => (
                        <li key={player.participantId || player.name} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
                            <div className="flex items-center gap-4">
                                <span className={`text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-500 text-white'}`}>
                                    {index === 0 ? <Crown size={20} /> : `#${index + 1}`}
                                </span>
                                <span className="text-lg font-medium">{player.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-xl font-bold text-indigo-400">{player.score.toLocaleString()} pts</span>
                                <button
                                    onClick={() => handleViewDetails(player)}
                                    className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Details
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                 <Link to='/dashboard' className="w-full text-center block bg-gray-600/50 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-700/70 transition-colors">
                     Back to Dashboard
                 </Link>
            </div>
        );
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                {renderContent()}
            </div>
            
            <PerformanceDetailModal
                isOpen={selectedPlayer !== null}
                onClose={() => setSelectedPlayer(null)}
                sessionId={sessionId || ''}
                playerIdentifier={selectedPlayer}
            />
        </>
    );
};

export default ResultPage;