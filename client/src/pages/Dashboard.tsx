import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { 
  PlusCircle, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  Award,
  BarChart3,
  Play,
  Edit,
  Eye,
  Zap,
  Target,
  Star,
  ArrowRight,
  ChevronRight,
  Search,
  Settings,
  FileText,
  GraduationCap,
  Compass,
  Bell,
  Calendar,
  Activity,
  Menu,
  X,
  Filter,
  MoreHorizontal,
  Sparkles,
  TrendingDown,
  Globe,
  Heart
} from 'lucide-react';
import { href } from 'react-router-dom';

interface QuizStats {
  totalQuizzes: number;
  totalStudents: number;
  completedQuizzes: number;
  averageScore: number;
}

interface RecentQuiz {
  id: string;
  title: string;
  students: number;
  lastActivity: string;
  status: 'active' | 'draft' | 'completed';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  progress: number;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'quiz_completed' | 'quiz_created' | 'student_joined';
  message: string;
  timestamp: string;
  score?: number;
  user: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats: QuizStats = {
    totalQuizzes: 24,
    totalStudents: 156,
    completedQuizzes: 89,
    averageScore: 78.5
  };

  const recentQuizzes: RecentQuiz[] = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      students: 45,
      lastActivity: '2 hours ago',
      status: 'active',
      category: 'Programming',
      difficulty: 'Medium',
      progress: 78,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: '2',
      title: 'React Components Quiz',
      students: 32,
      lastActivity: '5 hours ago',
      status: 'active',
      category: 'Frontend',
      difficulty: 'Hard',
      progress: 64,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: '3',
      title: 'CSS Grid Layout',
      students: 28,
      lastActivity: '1 day ago',
      status: 'completed',
      category: 'Design',
      difficulty: 'Easy',
      progress: 100,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: '4',
      title: 'Python Basics',
      students: 52,
      lastActivity: '3 hours ago',
      status: 'active',
      category: 'Programming',
      difficulty: 'Easy',
      progress: 85,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'quiz_completed',
      message: 'completed JavaScript Fundamentals',
      timestamp: '15 min ago',
      score: 85,
      user: 'Sarah Chen'
    },
    {
      id: '2',
      type: 'student_joined',
      message: '3 new students joined your class',
      timestamp: '1 hour ago',
      user: 'System'
    },
    {
      id: '3',
      type: 'quiz_created',
      message: 'Advanced React Patterns quiz created',
      timestamp: '3 hours ago',
      user: 'You'
    },
    {
      id: '4',
      type: 'quiz_completed',
      message: 'achieved 92% in Python Basics',
      timestamp: '4 hours ago',
      score: 92,
      user: 'Mike Johnson'
    }
  ];

  const sidebarItems = [
    { name: 'Dashboard', icon: Activity, section: 'dashboard', color: 'from-violet-500 to-purple-600' },
   { name: 'Explore', icon: Compass, section: 'explore', color: 'from-blue-500 to-cyan-50'},
    { name: 'My Library', icon: BookOpen, section: 'library', color: 'from-emerald-500 to-teal-600' },
    { name: 'Analytics', icon: BarChart3, section: 'reports', color: 'from-orange-500 to-red-500' },
    { name: 'Students', icon: Users, section: 'classes', color: 'from-pink-500 to-rose-600' },
    { name: 'Settings', icon: Settings, section: 'settings', color: 'from-slate-500 to-gray-600' }
  ];

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
      case 'Medium': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 'Hard': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' };
      case 'draft': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' };
      case 'completed': return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', dot: 'bg-gray-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', dot: 'bg-gray-500' };
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-1/4 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )} 

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo Section */}
        <div className="p-8 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Fun Quize</h1>
                <p className="text-gray-500 text-sm">Educational Platform</p>
              </div>
            </div>
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-900 font-semibold">Mr. Nak</p>
                <p className="text-gray-500 text-sm">Lead Educator</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-xs font-medium">{currentTime.toLocaleDateString()}</p>
                <p className="text-violet-600 text-sm font-mono">{currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Online</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">156 active students</span>
            </div>
          </div>
          
          {/* Create Button */}
          <button className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <a href='/create-quiz'>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative flex items-center justify-center">
              <Zap className="w-5 h-5 mr-2" />
              Create New Quiz
              <Sparkles className="w-4 h-4 ml-2 opacity-80" />
            </div>
            </a>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.section}
              onClick={() => {
                 setActiveSection(item.section);
                setSidebarOpen(false);
                navigate(`/${item.section}`);
              }}
              className={`w-full flex items-center px-4 py-4 rounded-2xl font-medium transition-all duration-300 group relative ${
                activeSection === item.section
                  ? 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 shadow-lg shadow-violet-500/10 border border-violet-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl mr-4 transition-all duration-300 ${
                activeSection === item.section 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">{item.name}</span>
              {activeSection === item.section && (
                <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-6 border-t border-gray-200/50">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Go Pro</p>
                <p className="text-xs text-gray-600">Unlock premium features</p>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-105 shadow-lg">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">QuizMaster</h1>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>

        <div className={`flex-1 p-4 lg:p-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl lg:text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
                    {getGreeting()}
                  </span>
                  <span className="ml-3">✨</span>
                </h1>
                <p className="text-gray-600 text-lg lg:text-xl">Ready to inspire minds today?</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search quizzes, students..." 
                    className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl pl-12 pr-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 transition-all duration-300 w-64 lg:w-80 shadow-sm hover:shadow-md"
                  />
                </div>
                
                <button className="hidden lg:flex p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 text-gray-600 hover:text-violet-600 relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-pulse"></div>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <button className="group px-6 lg:px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Quiz
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
              
              <button className="px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-700 rounded-2xl font-semibold hover:border-violet-300 hover:text-violet-700 hover:shadow-lg hover:bg-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Analytics
                </div>
              </button>
              
              <button className="px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-700 rounded-2xl font-semibold hover:border-violet-300 hover:text-violet-700 hover:shadow-lg hover:bg-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Students
                </div>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {[
              { 
                title: 'Total Quizzes', 
                value: stats.totalQuizzes, 
                icon: BookOpen, 
                change: '+12%',
                trend: 'up',
                color: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-50 to-cyan-50',
                border: 'border-blue-200'
              },
              { 
                title: 'Users', 
                value: stats.totalStudents, 
                icon: Users, 
                change: '+8%',
                trend: 'up',
                color: 'from-emerald-500 to-teal-500',
                bg: 'from-emerald-50 to-teal-50',
                border: 'border-emerald-200'
              },
              { 
                title: 'Completed', 
                value: stats.completedQuizzes, 
                icon: Target, 
                change: '+15%',
                trend: 'up',
                color: 'from-purple-500 to-indigo-500',
                bg: 'from-purple-50 to-indigo-50',
                border: 'border-purple-200'
              },
              { 
                title: 'Avg Score', 
                value: `${stats.averageScore}%`, 
                icon: Award, 
                change: '+3%',
                trend: 'up',
                color: 'from-amber-500 to-orange-500',
                bg: 'from-amber-50 to-orange-50',
                border: 'border-amber-200'
              }
            ].map((stat, index) => (
              <div
                key={stat.title}
                className={`group relative bg-gradient-to-br ${stat.bg} rounded-2xl lg:rounded-3xl p-4 lg:p-6 border ${stat.border} hover:shadow-xl hover:shadow-${stat.color.split('-')[1]}-500/10 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 lg:p-3 bg-gradient-to-br ${stat.color} rounded-xl lg:rounded-2xl shadow-lg`}>
                    <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className={`flex items-center ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'} text-xs lg:text-sm font-bold`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> : <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Recent Quizzes */}
            <div className="xl:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-gray-200/50 p-6 lg:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Your Quizzes</h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <Filter className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="text-violet-600 hover:text-violet-700 transition-colors duration-300 flex items-center text-sm font-semibold">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {recentQuizzes.map((quiz) => {
                    const statusStyles = getStatusStyles(quiz.status);
                    const difficultyStyles = getDifficultyStyles(quiz.difficulty);
                    
                    return (
                      <div
                        key={quiz.id}
                        className="group bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-violet-300/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                      >
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${quiz.color} rounded-t-2xl`}></div>
                        
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
                              {quiz.title}
                            </h3>
                            <p className="text-gray-500 text-sm">{quiz.category}</p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} border`}>
                            <div className={`w-1.5 h-1.5 ${statusStyles.dot} rounded-full mr-2`}></div>
                            {quiz.status}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyStyles.bg} ${difficultyStyles.text} ${difficultyStyles.border} border`}>
                            {quiz.difficulty}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {quiz.students} students
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {quiz.lastActivity}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 font-medium">Progress</span>
                            <span className="text-gray-900 font-bold">{quiz.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r ${quiz.color} h-2 rounded-full transition-all duration-1000 relative overflow-hidden`}
                              style={{ width: `${quiz.progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-300">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                          <button className={`px-4 py-2 bg-gradient-to-r ${quiz.color} hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center`}>
                            <Play className="w-4 h-4 mr-2" />
                            Launch
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="xl:col-span-1">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-gray-200/50 p-6 shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Live Activity</h2>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl border border-gray-100/50 hover:border-violet-200/50 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.type === 'quiz_completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                          activity.type === 'quiz_created' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          'bg-gradient-to-r from-purple-400 to-purple-500'
                        } text-white shadow-lg`}>
                          {activity.type === 'quiz_completed' && <Award className="w-4 h-4" />}
                          {activity.type === 'quiz_created' && <PlusCircle className="w-4 h-4" />}
                          {activity.type === 'student_joined' && <Users className="w-4 h-4" />}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <p className="text-gray-900 text-sm font-semibold mr-2">{activity.user}</p>
                          {activity.score && (
                            <div className={`px-2 py-0.5 rounded-lg text-xs font-bold text-white ${
                              activity.score >= 90 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                              activity.score >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 
                              activity.score >= 70 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}>
                              {activity.score}%
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{activity.message}</p>
                        <p className="text-gray-400 text-xs font-medium">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl text-violet-700 hover:text-violet-800 hover:from-violet-100 hover:to-purple-100 transition-all duration-300 font-semibold text-sm flex items-center justify-center group">
                    <Activity className="w-4 h-4 mr-2" />
                    View All Activity
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-500" />
                  Today's Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                      <span className="text-gray-600 text-sm">Quizzes Taken</span>
                    </div>
                    <span className="text-gray-900 font-bold text-sm">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-gray-600 text-sm">New Students</span>
                    </div>
                    <span className="text-gray-900 font-bold text-sm">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-gray-600 text-sm">Avg. Score</span>
                    </div>
                    <span className="text-gray-900 font-bold text-sm">84%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                      <span className="text-gray-600 text-sm">Total Points</span>
                    </div>
                    <span className="text-gray-900 font-bold text-sm">2,847</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Featured Quiz */}
          <div className="mt-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-violet-500/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mr-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold"> Quiz of the Week</h3>
                    <p className="text-violet-100">Most popular among students</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-xl font-semibold mb-2">Advanced JavaScript Concepts</h4>
                  <p className="text-violet-100 mb-4">Test your knowledge of closures, promises, and async programming</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      127 participants
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      4.8 rating
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      89% loved it
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-6 py-3 bg-white text-violet-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    View Quiz
                  </button>
                  <button className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/20">
                    Duplicate
                  </button>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-6xl lg:text-8xl">
                  🏆
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;