import React, { useState } from "react";
import { 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  Menu,
  Calendar,
  Eye,
  Trophy,
  Target,
  ChevronDown
} from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import Sidebar from '../components/dashboard/Sidebar';
import { Link } from 'react-router-dom';

// Mock quiz history data
const mockQuizHistory = [
  {
    id: '1',
    title: "Advanced Mathematics Quiz",
    category: "Mathematics",
    date: "2024-08-20",
    score: 95,
    totalQuestions: 20,
    duration: "15 min",
    difficulty: 'Hard' as const,
    status: "Completed",
    rating: 4.8,
    participants: 1250,
    lastUpdated: '2 days ago',
    description: 'Master advanced calculus and algebra concepts.'
  },
  {
    id: '2',
    title: "World History: Ancient Civilizations",
    category: "History",
    date: "2024-08-19",
    score: 87,
    totalQuestions: 15,
    duration: "12 min",
    difficulty: 'Medium' as const,
    status: "Completed",
    rating: 4.6,
    participants: 890,
    lastUpdated: '3 days ago',
    description: 'Explore the rise and fall of ancient empires.'
  },
  {
    id: '3',
    title: "Basic Chemistry Elements",
    category: "Science",
    date: "2024-08-18",
    score: 92,
    totalQuestions: 25,
    duration: "20 min",
    difficulty: 'Easy' as const,
    status: "Completed",
    rating: 4.7,
    participants: 1100,
    lastUpdated: '4 days ago',
    description: 'Learn about periodic table and chemical reactions.'
  },
  {
    id: '4',
    title: "English Literature Classics",
    category: "Literature",
    date: "2024-08-17",
    score: 78,
    totalQuestions: 18,
    duration: "14 min",
    difficulty: 'Medium' as const,
    status: "Completed",
    rating: 4.5,
    participants: 750,
    lastUpdated: '5 days ago',
    description: 'Dive into Shakespeare, Dickens and other classics.'
  },
  {
    id: '5',
    title: "Geography: Capitals of the World",
    category: "Geography",
    date: "2024-08-16",
    score: 88,
    totalQuestions: 30,
    duration: "18 min",
    difficulty: 'Hard' as const,
    status: "Completed",
    rating: 4.4,
    participants: 920,
    lastUpdated: '6 days ago',
    description: 'Test your knowledge of world capitals and landmarks.'
  },
  {
    id: '6',
    title: "Programming Fundamentals",
    category: "Technology",
    date: "2024-08-15",
    score: 96,
    totalQuestions: 22,
    duration: "16 min",
    difficulty: 'Medium' as const,
    status: "Completed",
    rating: 4.9,
    participants: 1350,
    lastUpdated: '1 week ago',
    description: 'Learn the basics of programming logic and syntax.'
  }
];

const difficultyConfig = {
  Easy: { 
    bg: 'bg-gradient-to-r from-emerald-100 to-emerald-50', 
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  Medium: { 
    bg: 'bg-gradient-to-r from-amber-100 to-yellow-50', 
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  Hard: { 
    bg: 'bg-gradient-to-r from-red-100 to-rose-50', 
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const categoryColors = {
  Mathematics: 'from-blue-500 to-cyan-500',
  History: 'from-amber-500 to-orange-500',
  Science: 'from-green-500 to-emerald-500',
  Literature: 'from-purple-500 to-pink-500',
  Geography: 'from-indigo-500 to-blue-500',
  Technology: 'from-violet-500 to-purple-500',
};

const getScoreGradient = (score: number) => {
  if (score >= 90) return "from-green-400 to-green-600";
  if (score >= 75) return "from-blue-400 to-blue-600";
  if (score >= 60) return "from-yellow-400 to-yellow-600";
  return "from-red-400 to-red-600";
};

const Library: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredQuizzes = mockQuizHistory.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || quiz.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || quiz.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(mockQuizHistory.map(quiz => quiz.category))];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [activeSection, setActiveSection] = useState('library');
  const currentTime = new Date();

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
                        {Math.round(filteredQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) / filteredQuizzes.length)}%
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
                    <div
                      key={quiz.id}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Category Gradient Bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryColors[quiz.category as keyof typeof categoryColors]}`}></div>
                      

                      <div className="mb-4 mt-2">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{quiz.description}</p>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-r ${categoryColors[quiz.category as keyof typeof categoryColors]} rounded-lg flex items-center justify-center`}>
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{quiz.category}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyConfig[quiz.difficulty].bg} ${difficultyConfig[quiz.difficulty].text} ${difficultyConfig[quiz.difficulty].border}`}>
                           {quiz.difficulty}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {quiz.totalQuestions} Q's
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {quiz.duration}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(quiz.date).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link to="/history" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:shadow-lg">
                          <Eye className="w-4 h-4" />
                          View Histroy
                        </Link>
                        <button className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:shadow-lg">
                          <FaUser className="w-4 h-4" />
                          Top Performance
                        </button>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
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