import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Search , PlusCircle, Edit, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { QuizCard, type CardAction } from "../components/quizz/QuizzCard";
import { quizApi, type IQuiz, type IQuizPaginatedResponse } from "../service/quizApi";
import { useQuizGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import CreateQuizModal from "../components/dashboard/CreateQuizModal";
import { useDebounce } from '../hook/useDebounce';

const MyQuizz: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom } = useQuizGame();
  const { user } = useAuth();
  
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [paginationData, setPaginationData] = useState<Omit<IQuizPaginatedResponse, 'quizzes' | 'docs'>>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const itemsPerPage = 6;
  const hasPrev = currentPage > 1;
const hasNext = paginationData && currentPage < paginationData.totalPages;

  
  useEffect(() => {
    const fetchQuizzes = async (pageToFetch: number) => {
      setIsLoading(true);
      try {
        const response = await quizApi.getMyQuizzes({ 
          page: pageToFetch, 
          limit: itemsPerPage,
          search: debouncedSearchTerm,
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

  useEffect(() => {
    if (debouncedSearchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const handleEditQuiz = (quizId: string) => navigate(`/quiz-editor/${quizId}`);

  const handleLaunchGame = (quizId: string) => {
    if (!user) return;
    createRoom({ quizId, hostName: user.name, userId: user._id, settings: {} });
  };
  useEffect(() => {
  if (debouncedSearchTerm) {
    setCurrentPage(1);
  }
}, [debouncedSearchTerm]);

  const cardActions: CardAction[] = [
    { label: 'Edit', icon: Edit, onClick: handleEditQuiz, style: 'bg-gray-100 hover:bg-violet-100 text-gray-800' },
    { label: 'Launch Game', icon: Play, onClick: handleLaunchGame, style: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' },
  ];

  const generatePagination = (current: number, total: number): (string|number)[] => {
    // Pagination logic can be complex, this is a simplified version
    if (total <= 1) return [];
    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
    // Add more complex logic with '...' if needed
    return [1, '...', current-1, current, current+1, '...', total];
  }
  const paginationNumbers = useMemo(() => paginationData ? generatePagination(currentPage, paginationData.totalPages) : [], [paginationData, currentPage]);

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar activeSection="my-quizz" setActiveSection={() => {}} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentTime={new Date()} />
        <div className="flex-1 relative z-10 p-5">
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

            <div className="relative flex-grow w-full md:w-auto max-w-7xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search your quizzes by title..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>

            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="text-center py-20 text-indigo-600">Loading Quizzes...</div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try a different search term." : "Click 'Create New Quiz' to get started!"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz, index) => (
                      <QuizCard key={quiz._id} quiz={quiz} index={index} actions={cardActions} />
                    ))}
                  </div>
{paginationData && paginationData.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-12 border-t pt-6">
                       <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!hasPrev}
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
                          disabled={!hasNext}
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
    </>
  );
};

export default MyQuizz;