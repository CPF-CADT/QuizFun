import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    History, 
    Loader, 
    AlertCircle, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    Trophy, 
    Award, 
    Play, 
    BarChart3, 
    Calendar,
    Menu,
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { reportApi, type IActivitySession } from '../service/reportApi';
import { useDebounce } from '../hook/useDebounce';

const LIMIT = 12; // Divisible by 1, 2, 3, and 4 for clean grid layouts

const QuizHistoryPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection] = useState("my-history");
    const [currentTime] = useState(new Date());
    const navigate = useNavigate();

    const [activities, setActivities] = useState<IActivitySession[]>([]);
    const [paginationData, setPaginationData] = useState<{ totalPages: number, hasPrevPage: boolean, hasNextPage: boolean } | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchPlayerHistory = useCallback(async (pageNum: number, _search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportApi.getUserActivityFeed(pageNum, LIMIT,'player');
            
            const playerSessions = response.data.activities.filter(s => s.role === 'player');
            setActivities(playerSessions);
            setPaginationData({
                totalPages: response.data.totalPages,
                hasPrevPage: response.data.hasPrev,
                hasNextPage: response.data.hasNext,
            });
            
        } catch (err) {
            setError("Couldn't load your quiz history. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlayerHistory(1, debouncedSearchTerm);
    }, [fetchPlayerHistory, debouncedSearchTerm]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || (paginationData && newPage > paginationData.totalPages)) return;
        setPage(newPage);
        fetchPlayerHistory(newPage, debouncedSearchTerm);
    };

    const handleViewPlayerPerformance = (sessionId: string, quizId: string) => {
        navigate(`/session/${sessionId}/performance?quizzId=${quizId}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const fullDate = date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        if (diffDays === 0) return `Today (${fullDate})`;
        if (diffDays === 1) return `Yesterday (${fullDate})`;
        if (diffDays < 7) return `${diffDays} days ago (${fullDate})`;
        
        return fullDate;
    };

    const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-xl p-4 flex items-center shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-gradient-to-br ${color} shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-600 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
    
    const HistoryCard = ({ session }: { session: IActivitySession }) => (
        <div 
            onClick={() => handleViewPlayerPerformance(session._id, session.quizzId)}
            className="group relative flex flex-col border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-xl hover:border-indigo-400/50 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
        >
            {/* Background Layers */}
            <div className="absolute inset-0 bg-white transition-opacity duration-500 group-hover:opacity-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content Layer */}
            <div className="relative flex flex-col h-full">
                <div className="p-5 flex-grow">
                    <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">{session.quizTitle}</h3>
                    <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>{formatDate(session.endedAt)}</span>
                    </div>
                </div>

                {session.playerResult && (
                    <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="flex items-center text-sm font-medium text-slate-600"><BarChart3 className="w-4 h-4 mr-2 text-indigo-500" /> Score</span>
                            <span className="font-bold text-slate-800">{session.playerResult.finalScore.toLocaleString()} pts</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="flex items-center text-sm font-medium text-slate-600"><Trophy className="w-4 h-4 mr-2 text-amber-500" /> Rank</span>
                            <span className="font-bold text-slate-800">#{session.playerResult.finalRank}</span>
                        </div>
                    </div>
                )}
                
                <div className="p-3 mt-auto">
                     <button className="w-full bg-white/60 backdrop-blur-sm border border-slate-200/50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent">
                        View Results
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-96"><Loader className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
        if (error) return <div className="text-center h-96 flex flex-col justify-center items-center bg-white/50 backdrop-blur-sm border border-dashed rounded-lg"><AlertCircle className="w-12 h-12 text-red-500 mb-4" /><h3 className="text-lg font-semibold text-slate-800">Failed to Load History</h3><p className="text-slate-600">{error}</p></div>;
        if (activities.length === 0) return <div className="text-center h-96 flex flex-col justify-center items-center bg-white/50 backdrop-blur-sm border border-dashed border-slate-300 rounded-lg"><History className="w-12 h-12 text-slate-400 mb-4" /><h3 className="text-lg font-semibold text-slate-800">{searchTerm ? "No Quizzes Found" : "No History Yet"}</h3><p className="text-slate-600 max-w-sm">{searchTerm ? `We couldn't find any quizzes matching "${searchTerm}".` : "Your game history will appear here."}</p></div>;

        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activities.map(session => <HistoryCard key={session._id} session={session} />)}
                </div>
                {paginationData && paginationData.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/80">
                        <button onClick={() => handlePageChange(page - 1)} disabled={!paginationData.hasPrevPage} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-sm font-medium text-slate-600">Page {page} of {paginationData.totalPages}</span>
                        <button onClick={() => handlePageChange(page + 1)} disabled={!paginationData.hasNextPage} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </>
        );
    };

    const avgScore = activities.length > 0 ? Math.round(activities.reduce((sum, act) => sum + (act.playerResult?.finalScore || 0), 0) / activities.length) : 0;
    const topRanks = activities.filter(act => act.playerResult && act.playerResult.finalRank <= 3).length;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50">
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={() => {}} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                currentTime={currentTime} 
            />
            
            <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
                <header className="mb-8">
                     {/* Hamburger Menu for Mobile */}
                     <div className="flex items-center mb-4 lg:hidden">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-slate-700 hover:bg-slate-200"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent ml-4">My Quiz History</h1>
                    </div>

                    {/* Desktop Header */}
                    <div className="text-center mb-10 ">
                    <div className="hidden lg:block">
                        <h1 className="text:4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4 mt-5">My Quiz History</h1>
                        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">Review your performance and track your progress over time.</p>
                    </div>
                    </div>
                </header>

                <section className="mb-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        <StatCard icon={<Play className="w-6 h-6 text-white"/>} color="from-indigo-500 to-purple-600" label="Quizzes Played" value={activities.length} />
                        <StatCard icon={<BarChart3 className="w-6 h-6 text-white"/>} color="from-green-500 to-emerald-600" label="Average Score" value={`${avgScore} pts`} />
                        <StatCard icon={<Trophy className="w-6 h-6 text-white"/>} color="from-amber-500 to-yellow-600" label="Top 3 Finishes" value={topRanks} />
                        <StatCard icon={<Award className="w-6 h-6 text-white"/>} color="from-rose-500 to-red-600" label="First Places" value={activities.filter(a => a.playerResult?.finalRank === 1).length} />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                        <input type="text" placeholder="Search your history by quiz title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"/>
                    </div>
                </section>
                {renderContent()}
            </main>
        </div>
    );
};

export default QuizHistoryPage;

