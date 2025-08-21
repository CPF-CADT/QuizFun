import React, { useState } from "react";
import { FaSearch, FaFilter, FaClock, FaStar, FaBook, FaRocket, FaHeart, FaGamepad, FaTrophy, FaCalendarAlt, FaChevronDown, FaPlay, FaEye, FaDownload, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import Sidebar from '../components/dashboard/Sidebar';
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

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  // Sidebar state
  const [activeSection, setActiveSection] = useState<string>("Library");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Optionally, update currentTime every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
    if (score >= 90) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 75) return "text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getDifficultyColor = (difficulty:string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-50 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Hard": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getSubjectIcon = (subject:string) => {
    switch (subject) {
      case "Mathematics": return <FaRocket className="text-blue-600" />;
      case "History": return <FaBook className="text-amber-600" />;
      case "Science": return <FaStar className="text-green-600" />;
      case "English": return <FaHeart className="text-pink-600" />;
      case "Geography": return <FaGamepad className="text-purple-600" />;
      case "Technology": return <FaTrophy className="text-indigo-600" />;
      default: return <FaBook className="text-gray-600" />;
    }
  };

  const getScoreGradient = (score:number) => {
    if (score >= 90) return "from-green-400 to-green-600";
    if (score >= 75) return "from-blue-400 to-blue-600";
    if (score >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 transform animate-bounce opacity-20">
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full p-3 shadow-lg">
            <FaBook className="text-xl text-white" />
          </div>
        </div>
        <div className="absolute top-32 right-20 transform animate-pulse opacity-20">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-3 shadow-lg">
            <FaTrophy className="text-xl text-white" />
          </div>
        </div>
        <div className="absolute bottom-40 left-16 transform animate-bounce opacity-20" style={{ animationDelay: '1s' }}>
          <div className="bg-gradient-to-r from-pink-400 to-red-500 rounded-full p-3 shadow-lg">
            <FaClock className="text-lg text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 right-20 transform animate-pulse opacity-20" style={{ animationDelay: '0.5s' }}>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg">
            <FaStar className="text-lg text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-4 shadow-xl">
            <FaBook className="text-3xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-tight">
            Quiz Library 
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Explore your learning journey and revisit your quiz adventures
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300"
              />
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300 appearance-none"
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
                className="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300 appearance-none"
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
                className="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300 appearance-none"
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
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Quiz Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    {getSubjectIcon(quiz.subject)}
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm font-medium">{quiz.subject}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>

              {/* Quiz Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {quiz.title}
              </h3>

              {/* Quiz Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {new Date(quiz.date).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center">
                    <FaClock className="mr-2" />
                    {quiz.duration}
                  </span>
                </div>
                
                {/* <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">
                    {quiz.totalQuestions} Questions
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(quiz.score)}`}>
                    {quiz.score}%
                  </span>
                </div> */}
              </div>

              {/* Progress Bar */}
              {/* <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getScoreGradient(quiz.score)} rounded-full transition-all duration-500`}
                    style={{ width: `${quiz.score}%` }}
                  ></div>
                </div>
              </div> */}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link to="/history" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold text-sm hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <FaEye className="mr-2" />
                  View Histroy
                </Link>
                <Link to="/" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-xl font-semibold text-sm hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <FaUser className="mr-2" />
                  Top Performance
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <FaSearch className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No quizzes found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Your Learning Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
              <div className="text-3xl font-bold text-indigo-600">{mockQuizHistory.length}</div>
              <div className="text-gray-600 font-medium">Total Quizzes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(mockQuizHistory.reduce((acc, quiz) => acc + quiz.score, 0) / mockQuizHistory.length)}%
              </div>
              <div className="text-gray-600 font-medium">Average Score</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">
                {mockQuizHistory.reduce((acc, quiz) => acc + quiz.totalQuestions, 0)}
              </div>
              <div className="text-gray-600 font-medium">Questions Answered</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl">
              <div className="text-3xl font-bold text-pink-600">
                {new Set(mockQuizHistory.map(quiz => quiz.subject)).size}
              </div>
              <div className="text-gray-600 font-medium">Subjects Explored</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Library;