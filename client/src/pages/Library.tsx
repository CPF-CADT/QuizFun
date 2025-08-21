import React, { useState } from "react";
import { FaSearch, FaFilter, FaClock, FaStar, FaBook, FaRocket, FaHeart, FaGamepad, FaTrophy, FaCalendarAlt, FaChevronDown, FaPlay, FaEye, FaDownload } from "react-icons/fa";

// Mock quiz history data
const mockQuizHistory = [
  {
    id: 1,
    title: "Advanced Mathematics Quiz",
    subject: "Mathematics",
    date: "2024-08-20",
    score: 95,
    totalQuestions: 20,
    duration: "15 min",
    difficulty: "Hard",
    status: "Completed"
  },
  {
    id: 2,
    title: "World History: Ancient Civilizations",
    subject: "History",
    date: "2024-08-19",
    score: 87,
    totalQuestions: 15,
    duration: "12 min",
    difficulty: "Medium",
    status: "Completed"
  },
  {
    id: 3,
    title: "Basic Chemistry Elements",
    subject: "Science",
    date: "2024-08-18",
    score: 92,
    totalQuestions: 25,
    duration: "20 min",
    difficulty: "Easy",
    status: "Completed"
  },
  {
    id: 4,
    title: "English Literature Classics",
    subject: "English",
    date: "2024-08-17",
    score: 78,
    totalQuestions: 18,
    duration: "14 min",
    difficulty: "Medium",
    status: "Completed"
  },
  {
    id: 5,
    title: "Geography: Capitals of the World",
    subject: "Geography",
    date: "2024-08-16",
    score: 88,
    totalQuestions: 30,
    duration: "18 min",
    difficulty: "Hard",
    status: "Completed"
  },
  {
    id: 6,
    title: "Programming Fundamentals",
    subject: "Technology",
    date: "2024-08-15",
    score: 96,
    totalQuestions: 22,
    duration: "16 min",
    difficulty: "Medium",
    status: "Completed"
  }
];

const QuizLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const subjects = ["All", "Mathematics", "History", "Science", "English", "Geography", "Technology"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredQuizzes = mockQuizHistory.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "All" || quiz.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 75) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case "Mathematics": return <FaRocket className="text-blue-500" />;
      case "History": return <FaBook className="text-amber-600" />;
      case "Science": return <FaStar className="text-green-500" />;
      case "English": return <FaHeart className="text-pink-500" />;
      case "Geography": return <FaGamepad className="text-purple-500" />;
      case "Technology": return <FaTrophy className="text-indigo-500" />;
      default: return <FaBook className="text-gray-500" />;
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 25%, #C084FC 50%, #DDD6FE 75%, #F3E8FF 100%)',
      }}
    >
      {/* Floating Educational Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 transform animate-bounce">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-3 shadow-lg opacity-30">
            <FaBook className="text-xl text-white" />
          </div>
        </div>
        <div className="absolute top-32 right-20 transform animate-pulse">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg opacity-30">
            <FaTrophy className="text-xl text-white" />
          </div>
        </div>
        <div className="absolute bottom-40 left-16 transform animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="bg-gradient-to-r from-pink-400 to-red-500 rounded-full p-3 shadow-lg opacity-30">
            <FaClock className="text-lg text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 right-20 transform animate-pulse" style={{ animationDelay: '0.5s' }}>
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-3 shadow-lg opacity-30">
            <FaStar className="text-lg text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full mb-4 shadow-xl">
            <FaBook className="text-3xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Quiz Library 📚
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto">
            Explore your learning journey and revisit your quiz adventures
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/40 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400/60 transition-all duration-300"
              />
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full py-3 px-4 bg-white/90 backdrop-blur-sm border-2 border-white/40 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400/60 transition-all duration-300 appearance-none"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject} Subject</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full py-3 px-4 bg-white/90 backdrop-blur-sm border-2 border-white/40 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400/60 transition-all duration-300 appearance-none"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty} Level</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 px-4 bg-white/90 backdrop-blur-sm border-2 border-white/40 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400/60 transition-all duration-300 appearance-none"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="title">Sort by Title</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Quiz Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {getSubjectIcon(quiz.subject)}
                  </div>
                  <div>
                    <span className="text-white/60 text-sm font-medium">{quiz.subject}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>

              {/* Quiz Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors line-clamp-2">
                {quiz.title}
              </h3>

              {/* Quiz Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {new Date(quiz.date).toLocaleDateString()}
                  </span>
                  <span className="text-white/70 text-sm flex items-center">
                    <FaClock className="mr-2" />
                    {quiz.duration}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">
                    {quiz.totalQuestions} Questions
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(quiz.score)}`}>
                    {quiz.score}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${quiz.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold text-sm hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <FaEye className="mr-2" />
                  Review
                </button>
                <button className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 px-4 rounded-xl font-semibold text-sm hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <FaPlay className="mr-2" />
                  Retake
                </button>
                <button className="bg-white/20 text-white py-2 px-3 rounded-xl hover:bg-white/30 transition-all duration-300">
                  <FaDownload />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
              <FaSearch className="text-4xl text-white/60" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No quizzes found</h3>
            <p className="text-white/70 text-lg">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Your Learning Stats 📊</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{mockQuizHistory.length}</div>
              <div className="text-white/70">Total Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-300">
                {Math.round(mockQuizHistory.reduce((acc, quiz) => acc + quiz.score, 0) / mockQuizHistory.length)}%
              </div>
              <div className="text-white/70">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300">
                {mockQuizHistory.reduce((acc, quiz) => acc + quiz.totalQuestions, 0)}
              </div>
              <div className="text-white/70">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-300">
                {new Set(mockQuizHistory.map(quiz => quiz.subject)).size}
              </div>
              <div className="text-white/70">Subjects Explored</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLibrary;