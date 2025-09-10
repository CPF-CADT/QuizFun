import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PlusCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Clock,
  Users,
  Loader,
  Menu,
  X,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import {
  quizApi,
  type IQuiz,
  type IQuizPaginatedResponse,
} from "../service/quizApi";
import { useQuizGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import CreateQuizModal from "../components/dashboard/CreateQuizModal";
import { useDebounce } from "../hook/useDebounce";
import { SoloLinkModal } from "../components/quizz/SoloLinkModal";

const MyQuizz: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom } = useQuizGame();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [paginationData, setPaginationData] =
    useState<Omit<IQuizPaginatedResponse, "quizzes" | "docs">>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const itemsPerPage = 8;

  const [isSoloModalOpen, setSoloModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const handleShareSolo = (quizId: string) => {
    setSelectedQuizId(quizId);
    setSoloModalOpen(true);
  };

  useEffect(() => {
    const fetchQuizzes = async (pageToFetch: number) => {
      setIsLoading(true);
      try {
        const response = await quizApi.getAllQuizzes({
          page: pageToFetch,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
          owner: "me",
          sortBy: "createdAt",
          sortOrder: "desc",
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
    createRoom({
      quizId,
      hostName: user.name,
      userId: user._id,
      settings: { autoNext: true, allowAnswerChange: true },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalQuizzes = paginationData?.total || 0;
  const totalQuestions = quizzes.reduce(
    (sum, quiz) => sum + (quiz.questions?.length || 0),
    0
  );

  // --- SUB-COMPONENTS for cleaner structure ---

  const StatCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <div className="bg-white border border-slate-200/80 rounded-lg p-4 flex items-center">
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  const QuizCard = ({ quiz }: { quiz: IQuiz }) => (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-indigo-400 hover:-translate-y-1">
      {/* Main content */}
      <div className="p-5 flex-grow">
        <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-2">
          {quiz.title}
        </h3>
        <div className="flex items-center text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          <span>Last updated: {formatDate(quiz.updatedAt)}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
        <div className="flex items-center">
          <Target className="w-4 h-4 mr-2 text-indigo-500" />
          <span className="font-medium text-slate-700">
            {quiz.questions?.length || 0} Questions
          </span>
        </div>
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />
          <span className="font-medium text-slate-700 truncate">
            {quiz.tags || "General"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100">
        <div className="flex gap-2">
          <button
            onClick={() => handleEditQuiz(quiz._id)}
            className="flex-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg text-xs font-semibold transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleShareSolo(quiz._id)}
            className="flex-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-lg text-xs font-semibold transition-colors"
          >
            Share
          </button>
          <button
            onClick={() => handleLaunchGame(quiz._id)}
            className="flex-1 text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Play className="w-3 h-3" />
            Launch
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="text-center h-96 flex flex-col justify-center items-center bg-white border border-dashed border-slate-300 rounded-lg">
          <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            {searchTerm ? "No Quizzes Found" : "Your Collection is Empty"}
          </h3>
          <p className="text-slate-600 max-w-sm mb-6">
            {searchTerm
              ? `We couldn't find any quizzes matching "${searchTerm}". Try another search.`
              : "It looks like you haven't created any quizzes yet. Get started now!"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Create Your First Quiz
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
        {paginationData && paginationData.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!paginationData.hasPrev}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm font-medium text-slate-600">
              Page {currentPage} of {paginationData.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!paginationData.hasNext}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - always visible on large screens, hidden on small screens */}
      <Sidebar
        activeSection="my-quizz"
        setActiveSection={() => {}}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentTime={new Date()}
      />
      {/* Backdrop for mobile view */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        ></div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Hamburger menu for mobile, positioned on the left */}
        <div className="lg:hidden sticky top-0 bg-white shadow-md p-4 flex items-center justify-start gap-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold text-slate-800">My Quizzes</h1>
        </div>

        {/* Main content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4">
              My Quiz Collection
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Create, manage, and share your educational content with the world
            </p>
          </header>

          {/* Stats & Search Section */}
          <section className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              <StatCard
                icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
                label="Total Quizzes"
                value={totalQuizzes}
              />
              <StatCard
                icon={<Target className="w-6 h-6 text-emerald-600" />}
                label="Total Questions"
                value={totalQuestions}
              />
              <StatCard
                icon={<Users className="w-6 h-6 text-rose-600" />}
                label="Public Quizzes"
                value={quizzes.filter((q) => q.visibility === "public").length}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your quizzes by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center mt-4 justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              Create New Quiz
            </button>
          </section>
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <SoloLinkModal
        isOpen={isSoloModalOpen}
        onClose={() => setSoloModalOpen(false)}
        quizId={selectedQuizId}
      />
      <CreateQuizModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};

export default MyQuizz;
