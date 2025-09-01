import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Loader, AlertCircle, Gamepad2, Search, ChevronLeft, ChevronRight, Trophy, Star, Zap, Target, Award, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { reportApi, type IActivitySession } from '../../service/reportApi';
import { useDebounce } from '../../hook/useDebounce';

const LIMIT = 12;

const QuizHistory: React.FC = () => {
    const [activities, setActivities] = useState<IActivitySession[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchPlayerHistory = useCallback(async (pageNum: number, search?: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await reportApi.getUserActivityFeed(pageNum, LIMIT);
            
            // Filter only player sessions (role !== 'host')
            let playerSessions = response.data.activities.filter(
                (session: IActivitySession) => session.role === 'player'
            );
            
            // Apply search filter if search term exists
            if (search && search.trim()) {
                playerSessions = playerSessions.filter(
                    (session: IActivitySession) => 
                        session.quizTitle?.toLowerCase().includes(search.toLowerCase())
                );
            }

            setActivities(playerSessions);
            setTotalPages(response.data.totalPages);
            
        } catch (err) {
            setError("Couldn't load your quiz history.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        fetchPlayerHistory(1, debouncedSearchTerm);
    }, [fetchPlayerHistory, debouncedSearchTerm]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchPlayerHistory(newPage, debouncedSearchTerm);
    };

    const handleViewPlayerPerformance = (sessionId: string, quizId: string) => {
        navigate(`/session/${sessionId}/performance?quizzId=${quizId}`);
    };

    const generatePagination = (current: number, total: number): (string | number)[] => {
        if (total <= 1) return [];
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        const pages: (string | number)[] = [1];
        if (current > 3) pages.push('...');
        if (current > 2) pages.push(current - 1);
        if (current > 1 && current < total) pages.push(current);
        if (current < total - 1) pages.push(current + 1);
        if (current < total - 2) pages.push('...');
        pages.push(total);

        return pages;
    };

    const paginationNumbers = generatePagination(page, totalPages);
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-rose-500';
    };

    const getScoreBadgeColor = (score: number) => {
        if (score >= 90) return 'from-emerald-500 to-teal-600';
        if (score >= 80) return 'from-blue-500 to-cyan-600';
        if (score >= 70) return 'from-amber-500 to-orange-600';
        if (score >= 60) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-rose-600';
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { color: 'from-yellow-400 to-yellow-600', icon: '🥇', text: '1st' };
        if (rank === 2) return { color: 'from-gray-300 to-gray-500', icon: '🥈', text: '2nd' };
        if (rank === 3) return { color: 'from-amber-600 to-amber-800', icon: '🥉', text: '3rd' };
        return { color: 'from-slate-400 to-slate-600', icon: '', text: `${rank}th` };
    };

    // Calculate enhanced stats
    const avgScore = activities.length > 0 ? activities.reduce((sum, act) => sum + (act.playerResult?.finalScore || 0), 0) / activities.length : 0;
    const topRanks = activities.filter(act => act.playerResult && act.playerResult.finalRank <= 3).length;

    const renderQuizCard = (session: IActivitySession) => {
        const rankBadge = session.playerResult ? getRankBadge(session.playerResult.finalRank) : null;
        
        return (
            <div
                key={session._id}
                className="group relative bg-white/80 backdrop-blur-xl border border-white/30 shadow-xl hover:shadow-2xl rounded-3xl p-8 transition-all duration-500 hover:border-purple-300/50 cursor-pointer hover:-translate-y-2 overflow-hidden"
                onClick={() => handleViewPlayerPerformance(session._id, session.quizzId)}
            >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                {/* Top performance indicator for top 3 ranks */}
                {session.playerResult && session.playerResult.finalRank <= 3 && (
                    <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                )}

                <div className="relative z-10">
                    {/* Header with quiz title and date */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 pr-4">
                            <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2 leading-tight">
                                {session.quizTitle}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 bg-gray-100/60 rounded-full px-3 py-1 w-fit">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="font-medium">{formatDate(session.endedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Score and rank display */}
                    {session.playerResult && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div className={`bg-gradient-to-r ${getScoreBadgeColor(session.playerResult.finalScore)} p-6 rounded-2xl shadow-lg flex-1 mr-4`}>
                                    <div className="text-white">
                                        <div className="flex items-center mb-2">
                                            <Target className="w-5 h-5 mr-2" />
                                            <span className="text-sm font-medium opacity-90">Score</span>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-bold">{Math.round(session.playerResult.finalScore)}</span>
                                            <Star className="w-6 h-6 ml-2" />
                                        </div>
                                    </div>
                                </div>

                                {rankBadge && (
                                    <div className={`bg-gradient-to-r ${rankBadge.color} p-6 rounded-2xl shadow-lg flex-1`}>
                                        <div className="text-white">
                                            <div className="flex items-center mb-2">
                                                <Award className="w-5 h-5 mr-2" />
                                                <span className="text-sm font-medium opacity-90">Rank</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-2">{rankBadge.icon}</span>
                                                <span className="text-2xl font-bold">#{session.playerResult.finalRank}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Performance indicators */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl text-center border border-indigo-100">
                                    <Zap className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600 font-medium">Performance</div>
                                    <div className={`text-lg font-bold ${getScoreColor(session.playerResult.finalScore)}`}>
                                        {session.playerResult.finalScore >= 80 ? 'Great' : session.playerResult.finalScore >= 60 ? 'Good' : 'Fair'}
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl text-center border border-emerald-100">
                                    <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600 font-medium">Grade</div>
                                    <div className="text-lg font-bold text-emerald-600">
                                        {session.playerResult.finalScore >= 90 ? 'A+' : 
                                         session.playerResult.finalScore >= 80 ? 'A' :
                                         session.playerResult.finalScore >= 70 ? 'B' :
                                         session.playerResult.finalScore >= 60 ? 'C' : 'D'}
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl text-center border border-purple-100">
                                    <Sparkles className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600 font-medium">Stars</div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {Math.ceil(session.playerResult.finalScore / 20)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action button */}
                    <div className="pt-4 border-t border-gray-200/60">
                        <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg">
                            <span className="flex items-center justify-center">
                                View Detailed Results
                                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-center text-lg font-medium">{error}</p>
                    <button 
                        onClick={() => fetchPlayerHistory(page, debouncedSearchTerm)}
                        className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                    <span className="text-xl font-medium text-indigo-700 ml-6">Loading your quiz history...</span>
                </div>
            );
        }

        if (activities.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="relative mb-8">
                        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-full p-12 shadow-2xl">
                            <Gamepad2 className="w-20 h-20 text-indigo-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-800 text-center">
                        {searchTerm ? "No Quiz Adventures Found!" : "No Quiz History Found"}
                    </h3>
                    <p className="text-center text-lg max-w-md text-gray-600 leading-relaxed">
                        {searchTerm 
                            ? "No quizzes match your search. Try a different term." 
                            : "You haven't played any quizzes yet. Join a quiz game to see your history here!"
                        }
                    </p>
                </div>
            );
        }

        return (
            <>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
                    {activities.map(renderQuizCard)}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/30">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={!hasPrev}
                            className="flex items-center gap-2 px-8 py-4 bg-white/70 border border-white/30 rounded-2xl font-semibold text-gray-700 hover:bg-white/90 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                        </button>

                        <div className="flex items-center gap-3">
                            {paginationNumbers.map((pageNum, index) =>
                                typeof pageNum === 'number' ? (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-14 h-14 rounded-2xl text-sm font-bold transition-all duration-300 backdrop-blur-md shadow-lg ${
                                            page === pageNum
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl transform scale-110'
                                                : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-white/30 hover:border-purple-300 hover:scale-105'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ) : (
                                    <span key={index} className="w-14 h-14 flex items-center justify-center text-gray-500 text-lg font-bold">
                                        ...
                                    </span>
                                )
                            )}
                        </div>

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={!hasNext}
                            className="flex items-center gap-2 px-8 py-4 bg-white/70 border border-white/30 rounded-2xl font-semibold text-gray-700 hover:bg-white/90 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 relative overflow-hidden">
            {/* Enhanced animated background elements */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 -left-40 w-72 h-72 bg-gradient-to-r from-violet-400/20 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-500"></div>

            <div className="relative z-10 p-6 lg:p-12">
                {/* Enhanced Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <History className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4">
                        Quiz History
                    </h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        Track your learning journey and celebrate your achievements
                    </p>
                </div>

                {/* Enhanced Stats and Search Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8">
                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full lg:w-auto">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                                    <Gamepad2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
                                    <div className="text-sm text-gray-600 font-medium">Quizzes</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{Math.round(avgScore)}%</div>
                                    <div className="text-sm text-gray-600 font-medium">Avg Score</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{topRanks}</div>
                                    <div className="text-sm text-gray-600 font-medium">Top 3</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Enhanced Search Bar */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search your quiz adventures..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-white/30 bg-white/70 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-300 text-lg shadow-lg"
                        />
                    </div>
                </div>

                {/* Content */}
                {renderContent()}
            </div>
        </div>
    );
};

export default QuizHistory;