// --- File: pages/Library.tsx ---

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Search, 
    BookOpen, 
    Menu, 
    Clock, 
    Users, 
    BarChart2, 
    Target,
    Loader,
    ChevronLeft,
    ChevronRight,
    Trophy
} from 'lucide-react';

import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hook/useDebounce"; 
import { quizApi, type IQuiz, type IQuizPaginatedResponse, type ILeaderboardEntry } from "../service/quizApi"; 
import { gameApi } from "../service/gameApi"; 
import type { IGameSession } from "../service/gameApi";


const QuizLeaderboard: React.FC<{ quizId: string }> = ({ quizId }) => {
    const [leaderboard, setLeaderboard] = useState<ILeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await quizApi.getQuizLeaderboard(quizId);
                setLeaderboard(response.data || []);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
                setError("Could not load performance data.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [quizId]);

    const getTrophyColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-yellow-600';
        return 'text-gray-300';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <Loader className="w-6 h-6 text-green-600 animate-spin" />
                <span className="ml-3 text-slate-600">Loading Performance...</span>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }
  
    if (leaderboard.length === 0) {
        return (
            <div className="p-6 text-center text-slate-500">
                No performance data is available for this quiz yet.
            </div>
        );
    }

    return (
        <div className="p-4">
            <h4 className="font-bold text-lg mb-3 text-slate-800">Top Performers</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {leaderboard.map((entry) => (
                    <div key={entry.rank} className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                            <Trophy className={`w-6 h-6 flex-shrink-0 ${getTrophyColor(entry.rank)}`} />
                            <img src={entry.profileUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${entry.name}`} alt={entry.name} className="w-9 h-9 rounded-full bg-slate-200 object-cover"/>
                            <span className="font-medium text-slate-700 truncate">{entry.name}</span>
                        </div>
                        <div className="font-bold text-slate-800 text-base">
                            {entry.score} pts
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GameSessionList: React.FC<{ quizId: string; hostId: string }> = ({ quizId, hostId }) => {
  const [sessions, setSessions] = useState<IGameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await gameApi.getSessionByQuizAndHost({ hostId, quizId });
        setSessions(response.data || []);
      } catch (err) {
        console.error("Failed to fetch game sessions:", err);
        setError("Could not load session history.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [quizId, hostId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="ml-3 text-slate-600">Loading History...</span>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }
  
    if (sessions.length === 0) {
        return (
            <div className="p-6 text-center text-slate-500">
                No game sessions found for this quiz yet.
            </div>
        );
    }

  return (
    <div className="p-4">
      <h4 className="font-bold text-lg mb-3 text-slate-800">Quiz History</h4>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {sessions.map((session) => (
          <div key={session._id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{session.results?.length ?? 0} Players</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 mt-1 sm:mt-0">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Finished: {session.endedAt ? new Date(session.endedAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            <Link
              to={`/result/${session._id}`}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden md:inline">Results</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const HostedQuizCard: React.FC<{ 
    quiz: IQuiz; 
    onShowHistory: () => void; 
    onShowPerformance: () => void;
    isActive: 'history' | 'performance' | null;
}> = ({ quiz, onShowHistory, onShowPerformance, isActive }) => {
  return (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-blue-400 hover:-translate-y-1">
        <div className="p-5 flex-grow">
            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 group-hover:text-blue-700">
                {quiz.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                {quiz.description || "No description available."}
            </p>
            <div className="flex items-center text-xs text-slate-500">
                <Target className="w-3.5 h-3.5 mr-1.5" />
                <span>{quiz.questions?.length || 0} Questions</span>
            </div>
        </div>
      
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex gap-2">
        <button
          onClick={onShowHistory}
          className={`flex-1 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md transform hover:scale-105
            ${isActive === 'history' ? 'bg-blue-700 ring-2 ring-offset-2 ring-blue-500' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <Clock className="w-4 h-4" />
          Quiz History
        </button>
        <button
          onClick={onShowPerformance}
          className={`flex-1 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md transform hover:scale-105
            ${isActive === 'performance' ? 'bg-green-700 ring-2 ring-offset-2 ring-green-500' : 'bg-green-600 hover:bg-green-700'}`}
        >
          <BarChart2 className="w-4 h-4" />
          Performance
        </button>
      </div>
    </div>
  );
};

const Library: React.FC = () => {
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [paginationData, setPaginationData] = useState<Omit<IQuizPaginatedResponse, "quizzes">>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('library');
  const [expandedView, setExpandedView] = useState<{ quizId: string | null; type: 'history' | 'performance' | null }>({ quizId: null, type: null });
  
  const { user } = useAuth();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchQuizzes = async (pageToFetch: number) => {
      setIsLoading(true);
      try {
        const response = await quizApi.getAllQuizzes({
          page: pageToFetch, limit: itemsPerPage, search: debouncedSearchTerm,
          owner: "me", sortBy: "createdAt", sortOrder: "desc",
        });
        setQuizzes(response.data.quizzes);
        setPaginationData(response.data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        setQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes(currentPage);
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => { if (debouncedSearchTerm) { setCurrentPage(1); } }, [debouncedSearchTerm]);
  
  const handleToggleView = (quizId: string, type: 'history' | 'performance') => {
    setExpandedView(prev => (prev.quizId === quizId && prev.type === type) ? { quizId: null, type: null } : { quizId, type });
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="text-center h-96 flex flex-col justify-center items-center bg-white border border-dashed border-slate-300 rounded-lg">
          <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            {searchTerm ? "No Quizzes Found" : "No Quizzes Created Yet"}
          </h3>
          <p className="text-slate-600 max-w-sm">
            {searchTerm ? `We couldn't find any quizzes matching your search.` : "Your created quizzes will appear here."}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quizzes.map((quiz) => {
            const isActive = expandedView.quizId === quiz._id ? expandedView.type : null;
            return (
                <div key={quiz._id} className="bg-white rounded-xl shadow-sm border border-transparent transition-all duration-300">
                    <HostedQuizCard 
                        quiz={quiz} 
                        onShowHistory={() => handleToggleView(quiz._id, 'history')} 
                        onShowPerformance={() => handleToggleView(quiz._id, 'performance')}
                        isActive={isActive}
                    />
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isActive ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <div className="p-2 pt-0">
                            <div className="bg-slate-100/70 rounded-lg">
                                {isActive === 'history' && user?._id && <GameSessionList quizId={quiz._id} hostId={user._id} />}
                                {isActive === 'performance' && <QuizLeaderboard quizId={quiz._id} />}
                            </div>
                        </div>
                    </div>
                </div>
            )
          })}
        </div>
        {paginationData && paginationData.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button onClick={() => setCurrentPage(c => c - 1)} disabled={!paginationData.hasPrev} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {paginationData.totalPages}</span>
            <button onClick={() => setCurrentPage(c => c + 1)} disabled={!paginationData.hasNext} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentTime={new Date()} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900">My Quiz Library</h1>
                <p className="text-lg text-slate-600 mt-2">Review history and performance for all of your created quizzes.</p>
            </header>
            <section className="mb-6">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input type="text" placeholder="Search your quizzes by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
            </section>
            
            {renderContent()}
        </main>
      </div>
    </>
  );
};

export default Library;