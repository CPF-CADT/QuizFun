import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// --- UI Components ---
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import StatCardGrid from "../components/dashboard/StatCardGrid";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import FeaturedQuiz from "../components/dashboard/FeaturedQuiz";
import CreateQuizModal from "../components/dashboard/CreateQuizModal";
import { PDFImportModal } from "../components/quizz/PDFImportModal";
import { QuizCard, type CardAction } from "../components/quizz/QuizzCard";
import { TemplateLibraryModal } from "../components/dashboard/TemplateLibraryModal";
import BugReportModal from "../components/ui/BugReportFrom";

// --- Services & Hooks ---
import { quizApi } from "../service/quizApi";
import { useQuizGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";

// --- Types & Icons ---
import type { IQuiz } from "../types/quiz";
import { ChevronRight, Edit, Play } from "lucide-react";

interface QuizStats {
  totalQuizzes: number;
  totalStudents: number;
  completedQuizzes: number;
  averageScore: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom } = useQuizGame();
  const { user } = useAuth();

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<QuizStats>({ totalQuizzes: 0, totalStudents: 0, completedQuizzes: 0, averageScore: 0 });
  const [recentQuizzes, setRecentQuizzes] = useState<IQuiz[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isPDFImportModalOpen, setPDFImportModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isBugReportModalOpen, setBugReportModalOpen] = useState(false);

  const fetchUserQuizzes = async () => {
    try {
      const response = await quizApi.getAllQuizzes({ limit: 4, owner: "me", sortBy: "createdAt", sortOrder: "desc" });
      setRecentQuizzes(response.data.quizzes);
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const fetchStats = async () => {
      try {
        const response = await quizApi.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
    fetchUserQuizzes();

    return () => clearInterval(timer);
  }, []);

  const handleEditQuiz = (quizId: string) => navigate(`/quiz-editor/${quizId}`);

  const handleLaunchGame = (quizId: string) => {
    if (!user) {
      alert("You must be logged in to host a game.");
      return;
    }
    createRoom({ quizId, hostName: user.name, userId: user._id, settings: { autoNext: true, allowAnswerChange: true } });
  };

  const handleBugReportSubmit = async (report: { title: string; description: string; rating: number }) => {
    try {
      quizApi.addBugReport(report)
      toast.success("Bug report submitted. Thank you!");
    } catch (err) {
      console.error("Failed to submit bug report:", err);
      toast.error("Could not submit bug report.");
    }
  };

  const cardActions: CardAction[] = [
    { label: "Edit", icon: Edit, onClick: handleEditQuiz, style: "bg-gray-100 hover:bg-violet-100 text-gray-800" },
    { label: "Launch Game", icon: Play, onClick: handleLaunchGame, style: "bg-gradient-to-r from-emerald-500 to-green-500 text-white" },
  ];

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentTime={currentTime} />
      
      {/* Updated main content with mobile responsive classes */}
      <div className="flex-1 flex flex-col lg:ml-2.5 lg:mt-7 min-h-screen">
        <Header
          setSidebarOpen={setSidebarOpen}
          onNewQuizClick={() => setCreateModalOpen(true)}
          onPDFImportClick={() => setPDFImportModalOpen(true)}
          onShowTemplatesClick={() => setIsTemplateModalOpen(true)}
          onBugReportClick={() => setBugReportModalOpen(true)}
        />
        
        {/* Updated main with mobile-first padding and spacing */}
        <main className={`flex-1 p-4 lg:p-8 lg:mr-15 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <StatCardGrid stats={stats} />
          
          {/* Updated grid to stack on mobile */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
            <div className="xl:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Your Latest Quizzes</h2>
                  <Link to="/my-quizz" className="flex items-center text-xs lg:text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                    View All
                    <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 ml-1" />
                  </Link>
                </div>
                {recentQuizzes.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {recentQuizzes.map((quiz, index) => <QuizCard key={quiz._id} quiz={quiz} index={index} actions={cardActions} />)}
                  </div>
                ) : (
                  <div className="text-center py-8 lg:py-10 text-gray-500">You haven't created any quizzes yet.</div>
                )}
              </div>
            </div>
            <div className="xl:col-span-1"><ActivityFeed /></div>
          </div>
          <FeaturedQuiz />
        </main>
      </div>
      
      <CreateQuizModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />
      <PDFImportModal isOpen={isPDFImportModalOpen} onClose={() => setPDFImportModalOpen(false)} onImportSuccess={fetchUserQuizzes} />
      <TemplateLibraryModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />
      <BugReportModal isOpen={isBugReportModalOpen} onClose={() => setBugReportModalOpen(false)} onSubmit={handleBugReportSubmit} />
    </div>
  );
};

export default DashboardPage;