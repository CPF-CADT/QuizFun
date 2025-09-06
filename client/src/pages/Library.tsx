import React, { useState, useEffect } from "react";
import { 
  Search, 
  BookOpen, 
  Menu,
  Trophy,
  Target,
  Award,
  ChevronDown
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import QuizCardHistory from "../components/Quizhistory";
import { userApi } from "../service/userApi";
import { useAuth } from "../context/AuthContext";

// --- Best Practice: Import the interface from a dedicated types file ---
// import { IQuizHistory } from "../types/quiz";

// Define the interface for the quiz history data
export interface IQuizHistory {
  id: string;
  title: string;
  category: string;
  date: string;
  score: number;
  totalQuestions: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: string;
  rating: number;
  participants: number;
  lastUpdated: string;
  description: string;
}

const Library: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Use the IQuizHistory interface for the component's state
  const [quizHistory, setQuizHistory] = useState<IQuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizHistory = async () => {
      // Ensure user and user._id exist before making the API call
      if (user?._id) {
        try {
          setLoading(true);
          const response = await userApi.getUserQuizHistory(user._id);
          // Assuming response.data is an array of IQuizHistory objects
          setQuizHistory(response.data);
        } catch (error) {
          console.error("Failed to fetch quiz history:", error);
          // Optionally, set an error state here to show a message to the user
        } finally {
          setLoading(false);
        }
      } else {
        // If there's no user, we can stop loading and show an empty state
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, [user]); // The effect depends on the user object

  const filteredQuizzes = quizHistory.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || quiz.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || quiz.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Dynamically generate categories from the fetched data
  const categories = [...new Set(quizHistory.map(quiz => quiz.category))];
  const difficulties: IQuizHistory['difficulty'][] = ['Easy', 'Medium', 'Hard'];
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [activeSection, setActiveSection] = useState('library');
  const currentTime = new Date();

  // Display a loading indicator while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading your quiz history...</p>
      </div>
    );
  }

  return (
    <>
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentTime={currentTime}
        />
        <div className="flex-1 relative z-10">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10 p-5">
            {/* Hero Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
                <BookOpen className="w-4 h-4" />
                Your Learning Journey
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-600 bg-clip-text text-transparent mb-4">
                Quiz Library
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Revisit your completed quizzes and track your learning progress over time
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      placeholder="Search your completed quizzes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Filter Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Category Filter */}
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full py-3 px-4 bg-white/70 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 appearance-none"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                    </div>

                    {/* Difficulty Filter */}
                    <div className="relative">
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full py-3 px-4 bg-white/70 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 appearance-none"
                      >
                        <option value="">All Difficulties</option>
                        {difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                    </div>

                    {/* Sort Filter */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full py-3 px-4 bg-white/70 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 appearance-none"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="score">Sort by Score</option>
                        <option value="title">Sort by Title</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        !selectedCategory 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex flex-wrap justify-center gap-8 text-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{filteredQuizzes.length}</div>
                      <div className="text-sm text-gray-600">Completed Quizzes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(filteredQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) / (filteredQuizzes.length || 1))}%
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {filteredQuizzes.reduce((acc, quiz) => acc + quiz.totalQuestions, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Questions Answered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Cards Grid */}
            <div className="max-w-7xl mx-auto">
              {filteredQuizzes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or filters</p>
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredQuizzes.map((quiz, index) => (
                    // Make sure your QuizCardHistory component expects a 'quiz' prop of type IQuizHistory
                    <QuizCardHistory key={quiz.id} quiz={quiz} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Library;