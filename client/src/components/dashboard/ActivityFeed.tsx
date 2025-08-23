import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader, AlertCircle, Inbox } from 'lucide-react';
import { reportApi, type IActivitySession } from '../../service/reportApi';
import { HostSessionCard } from './HostSessionCard';
import { PlayerSessionCard } from './PlayerSessionCard';

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<IActivitySession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            try {
                const response = await reportApi.getUserActivityFeed();
                setActivities(response.data);
            } catch (err) {
                setError("Couldn't load your recent activity.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const handleViewResults = (sessionId: string) => {
        navigate(`/session/${sessionId}/performance`);
    };
    
    const handleViewReport = (quizId: string) => {
        navigate(`/report?quizId=${quizId}`);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <Loader className="w-8 h-8 animate-spin" />
                    <p className="mt-2">Loading Activity...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-red-500">
                    <AlertCircle className="w-8 h-8" />
                    <p className="mt-2">{error}</p>
                </div>
            );
        }

        if (activities.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <Inbox className="w-8 h-8" />
                    <p className="mt-2 text-center">No recent activity found. <br /> Play or host a quiz to see it here!</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {activities.map(session => (
                    session.role === 'host'
                        ? <HostSessionCard key={session._id} session={session} onViewReport={handleViewReport} />
                        : <PlayerSessionCard key={session._id} session={session} onViewResults={handleViewResults} />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 ml-5">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                My Recent Activity
            </h3>
            {renderContent()}
        </div>
    );
};

export default ActivityFeed;