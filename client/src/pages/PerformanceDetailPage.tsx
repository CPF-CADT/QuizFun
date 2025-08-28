import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePerformanceData } from '../hook/usePerformanceData';
import { PerformanceView } from '../components/ui/PerformanceView';
import { useAuth } from '../context/AuthContext';

const PerformanceDetailPage: React.FC = () => {
    const { sessionId = '', guestName } = useParams<{ sessionId: string; guestName?: string; }>();
    const navigate = useNavigate();
    const {user} = useAuth()
    const userId = user?._id;
    // Create the identifier object for the hook
    const playerIdentifier = useMemo(() => {
        if (userId) return { userId };
        if (guestName) return { guestName };
        return null;
    }, [userId, guestName]);

    // Call the same hook with the identifier
    const { loading, error, player, performance, summary } = usePerformanceData(sessionId, playerIdentifier);

    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><div className="text-2xl font-bold animate-pulse">Loading Performance Details...</div></div>;
    if (error) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><div className="text-2xl font-bold text-red-400">{error}</div></div>;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <button onClick={() => navigate(-1)} className="bg-white/5 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3 mb-6">
                    <span className="text-xl">&larr;</span> Back
                </button>
                <PerformanceView
                    player={player}
                    performance={performance}
                    summary={summary}
                />
            </div>
        </div>
    );
};

export default PerformanceDetailPage;