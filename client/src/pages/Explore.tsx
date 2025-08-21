import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';

import {
  Search,
  Star,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
  Play,
  Award,
  Zap,
} from 'lucide-react';

interface QuizPreview {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  popularity: number;
  participants: number;
  lastUpdated: string;
  description: string;
}

const sampleQuizzes: QuizPreview[] = [
  {
    id: '1',
    title: 'React Basics',
    category: 'Frontend',
    difficulty: 'Easy',
    rating: 4.5,
    popularity: 1200,
    participants: 350,
    lastUpdated: '2 days ago',
    description: 'Learn the fundamentals of React components and hooks.',
  },
  {
    id: '2',
    title: 'Advanced CSS Techniques',
    category: 'Design',
    difficulty: 'Medium',
    rating: 4.7,
    popularity: 900,
    participants: 280,
    lastUpdated: '1 week ago',
    description: 'Master animations, flexbox, grid and responsiveness.',
  },
  {
    id: '3',
    title: 'JavaScript ES6+ Features',
    category: 'Programming',
    difficulty: 'Medium',
    rating: 4.9,
    popularity: 1500,
    participants: 420,
    lastUpdated: '3 days ago',
    description: 'Explore modern JavaScript syntax and features.',
  },
  {
    id: '4',
    title: 'Node.js API Development',
    category: 'Backend',
    difficulty: 'Hard',
    rating: 4.3,
    popularity: 700,
    participants: 180,
    lastUpdated: '5 days ago',
    description: 'Build robust APIs with Express and Node.js.',
  },
  {
    id: '5',
    title: 'Python Data Science',
    category: 'Data Science',
    difficulty: 'Medium',
    rating: 4.6,
    popularity: 1100,
    participants: 320,
    lastUpdated: '4 days ago',
    description: 'Dive into data analysis with pandas and numpy.',
  },
  {
    id: '6',
    title: 'Machine Learning Basics',
    category: 'AI/ML',
    difficulty: 'Hard',
    rating: 4.8,
    popularity: 850,
    participants: 210,
    lastUpdated: '1 week ago',
    description: 'Introduction to ML algorithms and concepts.',
  },
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
  Frontend: 'from-blue-500 to-cyan-500',
  Design: 'from-purple-500 to-pink-500',
  Programming: 'from-green-500 to-emerald-500',
  Backend: 'from-orange-500 to-red-500',
  'Data Science': 'from-indigo-500 to-blue-500',
  'AI/ML': 'from-violet-500 to-purple-500',
};

const Explore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredQuizzes = sampleQuizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(sampleQuizzes.map(quiz => quiz.category))];
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [activeSection, setActiveSection] = useState('explore'); // default active section
  const currentTime = new Date();

  return (
    <div className="flex min-h-screen">
  {/* Sidebar */}
  <Sidebar 
    activeSection={activeSection}
    setActiveSection={setActiveSection}
    sidebarOpen={sidebarOpen}
    setSidebarOpen={setSidebarOpen}
    currentTime={currentTime}
  />
    {/* <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"> */}
    <div className="flex-1 relative z-10">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 p-5">
        {/* Hero Header */}
        <div className="text-center mb-12">

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
            <Zap className="w-4 h-4" />
            Discover & Learn
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Explore Quizzes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge yourself with our curated collection of interactive quizzes across various topics
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search quizzes, categories, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm"
                />
              </div>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    !selectedCategory 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' 
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
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
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
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{filteredQuizzes.length}</div>
                  <div className="text-sm text-gray-600">Available Quizzes</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredQuizzes.reduce((sum, quiz) => sum + quiz.participants, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(filteredQuizzes.reduce((sum, quiz) => sum + quiz.rating, 0) / filteredQuizzes.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
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
                  
                  {/* Popularity Indicator */}
                  {quiz.popularity > 1000 && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        Hot
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
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
                        {quiz.participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        {quiz.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.lastUpdated}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                    <Play className="w-4 h-4" />
                    Start Quiz
                  </button>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Explore;