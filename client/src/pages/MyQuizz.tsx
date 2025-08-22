import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  PlusCircle,
  Edit,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// --- App-specific imports ---
import Sidebar from '../components/dashboard/Sidebar';
import { QuizCard, type CardAction } from "../components/quizz/QuizzCard";
import { quizApi } from "../service/quizApi";
import { useQuizGame } from '../context/GameContext'; // Assuming context paths
import { useAuth } from '../context/AuthContext';
import type { IQuiz, IQuizPaginatedResponse } from "../service/quizApi";
import CreateQuizModal from "../components/dashboard/CreateQuizModal";

// --- Helper function for smart pagination ---
const generatePagination = (currentPage: number, totalPages: number): (number | string)[] => {
  if (totalPages <= 7) {
    return [...Array(totalPages).keys()].map(i => i + 1);
  }

  // If current page is near the start
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // If current page is near the end
  if (currentPage > totalPages - 4) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // If current page is in the middle
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const MyQuizz: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom } = useQuizGame();
  const { user } = useAuth();
  
  // --- State Management ---
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [paginationData, setPaginationData] = useState<Omit<IQuizPaginatedResponse, 'quizzes' | 'docs'>>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 6;
  
  // --- Data Fetching ---
  useEffect(() => {
    const fetchQuizzes = async (page: number) => {
      setIsLoading(true);
      try {
        const response = await quizApi.getMyQuizzes({ 
          page, 
          limit: itemsPerPage,
        });
        
        const quizData = response.data.quizzes;
        setQuizzes(quizData);
        setPaginationData({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrev: response.data.hasPrev,
        });
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes(currentPage);
  }, [currentPage]);

  const handleEditQuiz = (quizId: string) => {
    navigate(`/quiz-editor/${quizId}`);
  };

  const handleLaunchGame = (quizId: string) => {
    if (!user) {
      alert("You must be logged in to host a game.");
      return;
    }
    console.log(`Launching quiz ${quizId} for user ${user.name}`);
    createRoom({
      quizId: quizId,
      hostName: user.name,
      userId: user._id,
      settings: { autoNext: true, allowAnswerChange: true } // Default settings
    });
  };

  const cardActions: CardAction[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: handleEditQuiz,
      style: 'bg-gray-100 hover:bg-violet-100 text-gray-800'
    },
    {
      label: 'Launch Game',
      icon: Play,
      onClick: handleLaunchGame,
      style: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
    },
  ];
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const paginationNumbers = useMemo(() => 
    paginationData ? generatePagination(paginationData.page, paginationData.totalPages) : [],
    [paginationData]
  );

  return (
    <>
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><Menu className="w-5 h-5 text-gray-600" /></button>
      </div>
      <div className="flex min-h-screen">
        <Sidebar activeSection="my-quizz" setActiveSection={() => {}} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentTime={new Date()} />
        <div className="flex-1 relative z-10">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">{/* Background elements */}</div>
          
          <div className="relative z-10 p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 max-w-7xl mx-auto">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2">My Quizzes</h1>
                <p className="text-lg text-gray-500">Manage, edit, and launch your collection of quizzes.</p>
              </div>
              <button onClick={() => setCreateModalOpen(true)} className="mt-4 md:mt-0 flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                <PlusCircle className="w-5 h-5" />
                Create New Quiz
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 max-w-7xl mx-auto">
              <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search your quizzes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400" />
              </div>
            </div>

            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="text-center py-20 text-indigo-600">Loading Quizzes...</div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Found</h3>
                  <p className="text-gray-600">Click "Create New Quiz" to get started!</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz, index) => (
                      <QuizCard key={quiz._id} quiz={quiz} index={index} actions={cardActions} />
                    ))}
                  </div>

                  {/* === NEW PAGINATION UI (BOTTOM) === */}
                  {paginationData && paginationData.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-12 border-t pt-6">
                       <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!paginationData.hasPrev}
                          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-2">
                           {paginationNumbers.map((page, index) =>
                            typeof page === 'number' ? (
                              <button
                                key={index}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                                  currentPage === page
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                                }`}
                              >
                                {page}
                              </button>
                            ) : (
                              <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-500">...</span>
                            )
                          )}
                        </div>

                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!paginationData.hasNext}
                          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <CreateQuizModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />
      </div>
      
    </>
  );
};

export default MyQuizz;