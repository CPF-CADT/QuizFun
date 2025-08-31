import React, { useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Eye, Loader, ShieldAlert } from 'lucide-react';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';
import { teamApi, type ISessionAnalytics } from '../service/teamApi';
import type { PlayerIdentifier } from '../hook/usePerformanceData';
import { useAuth } from '../context/AuthContext';

const TeamSessionResultPage: React.FC = () => {
    const { teamId, sessionId } = useParams<{ teamId: string; sessionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [sessionDetails, setSessionDetails] = useState<ISessionAnalytics | null>(null);
    const [isOwner, setIsOwner] = useState(false); // ✅ State to track ownership for THIS team
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerIdentifier | null>(null);

    useEffect(() => {
        if (!sessionId || !teamId || !user) {
            // Wait until all necessary IDs are available
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // ✅ Fetch both session results and team details concurrently
                const [sessionRes, teamRes] = await Promise.all([
                    teamApi.getSessionAnalytics(sessionId),
                    teamApi.getTeamById(teamId)
                ]);

                setSessionDetails(sessionRes.data);

                // ✅ Correctly determine if the current user is the owner of THIS team
                const teamData = teamRes.data;
                // @ts-ignore
                const currentUserInTeam = teamData.members.find(member => member.userId?._id === user._id);
                if (currentUserInTeam?.role === 'owner') {
                    setIsOwner(true);
                }

            } catch (err) {
                console.error("Failed to load session details or team data", err);
                setError("Could not load the results for this game session.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sessionId, teamId, user]); // Rerun when user context is loaded

    const handleViewDetails = (player: { userId: string }) => {
        if (!player.userId) {
            console.error("Cannot view details: Player has no valid User ID.");
            return; 
        }
        setSelectedPlayer({ userId: player.userId });
        setModalOpen(true);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin h-10 w-10 text-indigo-600"/></div>;
    }

    if (error || !sessionDetails) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                <ShieldAlert className="h-8 w-8 mr-2"/> {error || "Session data not available."}
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <button onClick={() => navigate(`/teams/${teamId}`)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2 font-semibold">
                            <ArrowLeft size={18} /> Back to Team
                        </button>
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">{sessionDetails.quizTitle}</h1>
                        <p className="text-lg text-gray-500">Session Results from {new Date(sessionDetails.endedAt).toLocaleString()}</p>
                    </header>

                    <div className="bg-white p-6 rounded-xl border">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Leaderboard</h3>
                        <ul className="space-y-3">
                            {sessionDetails.participants.map((player) => {
                                // A member can only see their own details. The owner can see everyone's.
                                const canViewDetails = isOwner || player.userId === user?._id;
                                return (
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
                                        {/* ✅ Button is only shown if details can be viewed and player has a valid userId */}
                                        {canViewDetails && player.userId && (
                                            <button 
                                                onClick={() => handleViewDetails({ userId: player.userId })} 
                                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
                                            >
                                                <Eye size={16} /> Details
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
            {selectedPlayer && (
                 <PerformanceDetailModal 
                    isOpen={isModalOpen} 
                    onClose={() => { setModalOpen(false); setSelectedPlayer(null); }} 
                    sessionId={sessionId!} 
                    playerIdentifier={selectedPlayer} 
                 />
            )}
        </>
    );
};
export default TeamSessionResultPage;