import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader, AlertCircle, Inbox } from 'lucide-react';
import { reportApi, type IActivitySession } from '../../service/reportApi';
import { HostSessionCard } from './HostSessionCard';
import { PlayerSessionCard } from './PlayerSessionCard';

const LIMIT = 5;

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<IActivitySession[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const fetchActivities = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const response = await reportApi.getUserActivityFeed(pageNum, LIMIT);
            const newActivities = response.data.activities;

            if (pageNum === 1) {
                setActivities(newActivities);
            } else {
                setActivities(prev => {
                    const existingIds = new Set(prev.map(a => a._id));
                    const filteredNew = newActivities.filter(a => !existingIds.has(a._id));
                    return [...prev, ...filteredNew];
                });
            }
            
            setHasMore(pageNum < response.data.totalPages);
        } catch (err) {
            setError("Couldn't load your recent activity.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities(1);
    }, [fetchActivities]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchActivities(nextPage);
    };

    const handleViewPlayerPerformance = (sessionId: string) => {
        navigate(`/session/${sessionId}/performance?quizzId=${activities.at(0)?.quizzId}`);
    };
    
    const handleViewSessionResult = (sessionId: string) => {
        navigate(`/result/${sessionId}`);
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-red-500">
                    <AlertCircle className="w-8 h-8" />
                    <p className="mt-2">{error}</p>
                </div>
            );
        }

        if (activities.length === 0 && !loading) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <Inbox className="w-8 h-8" />
                    <p className="mt-2 text-center">
                        No recent activity found. <br /> Play or host a quiz to see it here!
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {activities.map(session =>
                    session.role === 'host' ? (
                        <HostSessionCard
                            key={session._id}
                            session={session}
                            onViewResult={handleViewSessionResult}
                        />
                    ) : (
                        <PlayerSessionCard
                            key={session._id}
                            session={session}
                            onViewResults={() => handleViewPlayerPerformance(session._id)}
                        />
                    )
                )}

                {loading && (
                    <div className="flex justify-center py-4 text-gray-500">
                        <Loader className="w-6 h-6 animate-spin" />
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleLoadMore}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}
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