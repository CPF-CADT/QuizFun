// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import StatCardGrid from "../components/dashboard/StatCardGrid";
import RecentQuizzes from "../components/dashboard/RecentQuizzes";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import FeaturedQuiz from "../components/dashboard/FeaturedQuiz";
import CreateQuizModal from "../components/dashboard/CreateQuizModal";
import { quizApi } from "../service/quizApi";
import type { IQuiz } from "../types/quiz";

interface QuizStats {
  totalQuizzes: number;
  totalStudents: number;
  completedQuizzes: number;
  averageScore: number;
}

const DashboardPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    totalStudents: 0,
    completedQuizzes: 0,
    averageScore: 0,
  });

  const [recentQuizzes, setRecentQuizzes] = useState<IQuiz[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/quizz/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    const fetchUserQuizzes = async () => {
      try {
        const response = await quizApi.getMyQuizzes({ limit: 4, page: 1 });
        setRecentQuizzes(response.data.quizzes);
      } catch (error) {
        console.error("Error fetching user quizzes:", error);
      }
    };

    fetchStats();
    fetchUserQuizzes();

    return () => clearInterval(timer);
  }, []);

  return (
     
  <div className="flex min-h-screen relative overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentTime={currentTime}
      />
      <div className="flex-1 flex flex-col ml-2.5 mt-7 min-h-screen">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          onNewQuizClick={() => setCreateModalOpen(true)} 
          
        />
        <main
          className={`mr-15 flex-1 p-4 lg:p-8 transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <StatCardGrid stats={stats} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Corrected: xl:col-span-2 */}
            <div className="xl:col-span-2">
              <RecentQuizzes quizzes={recentQuizzes} />
            </div>
            <div className="xl:col-span-1">
              <ActivityFeed />
            </div>
          </div>
          <FeaturedQuiz />
        </main>
      </div>

      <CreateQuizModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
