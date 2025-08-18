// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import Types
// Import Types
import type { QuizStats, RecentQuiz } from '../types';

// Import Components
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatCardGrid from '../components/dashboard/StatCardGrid';
import RecentQuizzes from '../components/dashboard/RecentQuizzes';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import FeaturedQuiz from '../components/dashboard/FeaturedQuiz';

const DashboardPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    totalStudents: 0,
    completedQuizzes: 0,
    averageScore: 0
  });

  // Mock data - you would fetch this from your API
  const recentQuizzes: RecentQuiz[] = [
    { id: '1', title: 'JavaScript Fundamentals', students: 45, lastActivity: '2 hours ago', status: 'active', category: 'Programming', difficulty: 'Medium', progress: 78, color: 'from-yellow-400 to-orange-500' },
    { id: '2', title: 'React Components Quiz', students: 32, lastActivity: '5 hours ago', status: 'active', category: 'Frontend', difficulty: 'Hard', progress: 64, color: 'from-blue-400 to-cyan-500' },
    { id: '3', title: 'CSS Grid Layout', students: 28, lastActivity: '1 day ago', status: 'completed', category: 'Design', difficulty: 'Easy', progress: 100, color: 'from-green-400 to-emerald-500' },
    { id: '4', title: 'Python Basics', students: 52, lastActivity: '3 hours ago', status: 'active', category: 'Programming', difficulty: 'Easy', progress: 85, color: 'from-purple-400 to-pink-500' }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/quizz/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      </div>
      
      {/* Floating Elements for decoration */}
      <div className="absolute top-20 left-1/4 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>

      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentTime={currentTime}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          setSidebarOpen={setSidebarOpen}
          currentTime={currentTime}
        />

        <main className={`flex-1 p-4 lg:p-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StatCardGrid stats={stats} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
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
    </div>
  );
};

export default DashboardPage;
