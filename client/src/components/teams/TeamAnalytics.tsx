import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamApi, type ITeamAnalytics } from '../../service/teamApi';
import { BookOpen, Eye, Calendar, Trophy, Loader, ShieldAlert, Repeat, Users } from 'lucide-react';

export const TeamAnalytics: React.FC = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const [analytics, setAnalytics] = useState<ITeamAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!teamId) return;

        setLoading(true);
        setError(null);
        teamApi.getTeamAnalytics(teamId)
            .then(res => setAnalytics(res.data))
            .catch(err => {
                console.error("Failed to fetch analytics", err);
                setError("Could not load analytics data.");
            })
            .finally(() => setLoading(false));
    }, [teamId]);

    if (loading) {
        return <div className="flex justify-center items-center p-10"><Loader className="animate-spin" /></div>;
    }

    if (error || !analytics) {
        return <div className="text-center p-10 text-red-500"><ShieldAlert className="mx-auto h-8 w-8" /><p className="mt-2">{error}</p></div>;
    }

    const { leaderboard, pastSessions } = analytics;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side: Leaderboard */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <Trophy className="w-6 h-6 text-yellow-500" /> Team Leaderboard
                </h3>
                {leaderboard.length > 0 ? (
                    <ul className="space-y-3">
                        {leaderboard.map((player, index) => (
                            <li key={player.userId} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                                <span className="font-bold text-lg w-8 text-center">{index + 1}</span>
                                <img src={player.profileUrl || `https://i.pravatar.cc/150?u=${player.userId}`} alt={player.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-gray-700">{player.name}</p>
                                    <p className="text-sm text-indigo-600 font-medium">{player.totalScore.toLocaleString()} pts</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm mt-4">No completed quizzes yet to rank members.</p>
                )}
            </div>

            {/* Right Side: Past Sessions */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <BookOpen className="w-6 h-6 text-indigo-500" /> Past Quiz Sessions
                </h3>
                 {pastSessions.length > 0 ? (
                    <ul className="space-y-4">
                        {pastSessions.map(quiz => (
                            <li key={quiz.latestSessionId} className="p-4 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <p className="font-bold text-gray-800">{quiz.quizTitle}</p>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                                        <span><Calendar size={14}/> Last played on {new Date(quiz.endedAt).toLocaleDateString()}</span>
                                        <span><Users size={14}/> {quiz.participantCount} Unique Players</span>
                                        <span><Repeat size={14}/> Played {quiz.playCount} times</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate(`/teams/${teamId}/analytics/quiz/${quiz.quizId}`)}
                                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                                >
                                    <Eye size={16} /> View Results
                                </button>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-gray-500 text-sm mt-4">No quizzes have been completed by the team yet.</p>
                 )}
            </div>
        </div>
    );
};