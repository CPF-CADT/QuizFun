import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Eye, Loader, ShieldAlert } from 'lucide-react';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';
import { teamApi, type ITeamQuizAnalytics } from '../service/teamApi';
import type { PlayerIdentifier } from '../hook/usePerformanceData';
import { useAuth } from '../context/AuthContext';

const TeamQuizResultPage: React.FC = () => {
    const { teamId, quizId } = useParams<{ teamId: string; quizId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [quizResults, setQuizResults] = useState<ITeamQuizAnalytics | null>(null);
    const [isOwner, setIsOwner] = useState(false); // State to track ownership for THIS team
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<{ identifier: PlayerIdentifier, sessionId: string } | null>(null);

    useEffect(() => {
        if (!teamId || !quizId || !user) {
            // Wait until all necessary IDs and the user object are available
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch both quiz results and team details concurrently
                const [quizRes, teamRes] = await Promise.all([
                    teamApi.getTeamQuizAnalytics(teamId, quizId),
                    teamApi.getTeamById(teamId)
                ]);

                setQuizResults(quizRes.data);

                // ✅ Correctly determine if the current user is the owner of THIS team
                const teamData = teamRes.data;
                // @ts-ignore - Assuming userId is populated with _id
                const currentUserInTeam = teamData.members.find(member => member.userId?._id === user._id);
                if (currentUserInTeam?.role === 'owner') {
                    setIsOwner(true);
                }

            } catch (err) {
                console.error("Failed to load team data", err);
                setError("Could not load the results.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [teamId, quizId, user]); // Re-run when user context is loaded

    const handleViewDetails = (player: { userId: string, sessionId: string }) => {
        if (!player.userId || !player.sessionId) {
            console.error("Cannot view details: Missing required IDs.");
            return; 
        }
        setSelectedPlayer({ 
            identifier: { userId: player.userId },
            sessionId: player.sessionId 
        });
        setModalOpen(true);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin h-10 w-10 text-indigo-600"/></div>;
    }

    if (error || !quizResults) {
        return <div className="flex items-center justify-center h-screen text-red-500"><ShieldAlert className="h-8 w-8 mr-2"/> {error}</div>;
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <button onClick={() => navigate(`/teams/${teamId}`)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2 font-semibold">
                            <ArrowLeft size={18} /> Back to Team
                        </button>
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">{quizResults.quizTitle}</h1>
                        <p className="text-lg text-gray-500">Overall Leaderboard</p>
                    </header>

                    <div className="bg-white p-6 rounded-xl border">
                        <ul className="space-y-3">
                            {quizResults.participants.map((player, index) => {
                                // ✅ A member can only see their own details. The owner can see everyone's.
                                const canViewDetails = isOwner || player.userId === user?._id;

                                return (
                                    <li key={player.userId} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 text-center">
                                                <Award className={`w-6 h-6 inline ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-gray-300'}`} />
                                            </div>
                                            <img src={player.profileUrl || `https://i.pravatar.cc/150?u=${player.userId}`} alt={player.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                <p className="font-bold text-lg">{player.name}</p>
                                                <p className="text-indigo-600 font-semibold">{player.score.toLocaleString()} Pts (Best Score)</p>
                                            </div>
                                        </div>
                                        {/* ✅ Button is only rendered if the user has permission */}
                                        {canViewDetails && (
                                            <button 
                                                onClick={() => handleViewDetails(player)} 
                                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
                                            >
                                                <Eye size={16} /> View Best Attempt
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
                    onClose={() => setModalOpen(false)} 
                    sessionId={selectedPlayer.sessionId}
                    playerIdentifier={selectedPlayer.identifier}
                 />
            )}
        </>
    );
};

export default TeamQuizResultPage;