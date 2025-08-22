import React, { useState } from "react";
import {
  BarChart3,
  Users,
  Award,
  Timer,
  TrendingUp,
  Calendar,
  Eye,
  Target,
  UserCheck,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
const Report: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("explore");
  const currentTime = new Date();

  const quizzes = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      endDate: "Friday May 2025",
      totalPlayers: 45,
      averageScore: 78,
      completionRate: 89,
      averageTime: "3m 24s",
      highestScore: 98,
      attempts: 67,
      difficulty: "Intermediate",
      category: "Programming",
    },
    {
      id: 2,
      title: "React Components",
      endDate: "Thursday May 2025",
      totalPlayers: 32,
      averageScore: 82,
      completionRate: 94,
      averageTime: "4m 12s",
      highestScore: 100,
      attempts: 48,
      difficulty: "Advanced",
      category: "Frontend",
    },
    {
      id: 3,
      title: "CSS Grid Layout",
      endDate: "Wednesday May 2025",
      totalPlayers: 28,
      averageScore: 75,
      completionRate: 86,
      averageTime: "2m 58s",
      highestScore: 95,
      attempts: 41,
      difficulty: "Beginner",
      category: "Styling",
    },
    {
      id: 4,
      title: "Node.js Basics",
      endDate: "Tuesday May 2025",
      totalPlayers: 38,
      averageScore: 71,
      completionRate: 82,
      averageTime: "5m 16s",
      highestScore: 92,
      attempts: 55,
      difficulty: "Intermediate",
      category: "Backend",
    },
    {
      id: 5,
      title: "Database Design",
      endDate: "Monday May 2025",
      totalPlayers: 22,
      averageScore: 68,
      completionRate: 77,
      averageTime: "6m 33s",
      highestScore: 89,
      attempts: 34,
      difficulty: "Advanced",
      category: "Database",
    },
  ];

  const currentQuiz = quizzes[selectedQuiz];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Returns a color class based on score value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-blue-600";
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  // Removed duplicate state and variable declarations

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
          {/* Decorative Blurs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

          {/* Main Content */}
          <div className="relative z-10 p-6 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                Quiz Analytics Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Analyze performance and insights for each quiz individually
              </p>
            </div>

            {/* Quiz Selection Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Select a Quiz to Analyze
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {quizzes.map((quiz, idx) => (
                  <button
                    key={quiz.id}
                    onClick={() => setSelectedQuiz(idx)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedQuiz === idx
                        ? "border-purple-500 bg-purple-50 shadow-lg"
                        : "border-white/20 bg-white/60 hover:border-purple-300 hover:bg-purple-25"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {quiz.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                          quiz.difficulty
                        )}`}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{quiz.endDate}</p>
                    <p className="text-xs text-gray-600">
                      {quiz.totalPlayers} players
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Quiz Analytics */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    {currentQuiz.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(
                        currentQuiz.difficulty
                      )}`}
                    >
                      {currentQuiz.difficulty}
                    </span>
                    <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      {currentQuiz.category}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Ends: {currentQuiz.endDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Total Players</p>
                  <p className="text-xl font-bold text-gray-800">
                    {currentQuiz.totalPlayers}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500">Total Attempts</p>
                  <p className="text-xl font-bold text-gray-800">
                    {currentQuiz.attempts}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <BarChart3
                      className={`w-6 h-6 ${getScoreColor(
                        currentQuiz.averageScore
                      )}`}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Avg Score</p>
                  <p
                    className={`text-xl font-bold ${getScoreColor(
                      currentQuiz.averageScore
                    )}`}
                  >
                    {currentQuiz.averageScore}%
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-500">Highest Score</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {currentQuiz.highestScore}%
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <UserCheck className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-xl font-bold text-teal-600">
                    {currentQuiz.completionRate}%
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Timer className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-500">Avg Time</p>
                  <p className="text-xl font-bold text-orange-600">
                    {currentQuiz.averageTime}
                  </p>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Analysis */}
                <div className="bg-white/40 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Performance Analysis
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Score Distribution</span>
                      <span className="font-medium">
                        Good performance overall
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Engagement Level</span>
                      <span
                        className={`font-medium ${
                          currentQuiz.completionRate > 85
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {currentQuiz.completionRate > 85 ? "High" : "Moderate"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Difficulty Assessment
                      </span>
                      <span className="font-medium">
                        {currentQuiz.averageScore > 80
                          ? "Appropriate"
                          : "Consider reviewing"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Retry Rate</span>
                      <span className="font-medium">
                        {Math.round(
                          (currentQuiz.attempts / currentQuiz.totalPlayers -
                            1) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white/40 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Recommendations
                  </h3>
                  <div className="space-y-3 text-sm">
                    {currentQuiz.averageScore < 70 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700">
                          • Consider reviewing question difficulty
                        </p>
                      </div>
                    )}
                    {currentQuiz.completionRate < 80 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-700">
                          • Low completion rate - check quiz length
                        </p>
                      </div>
                    )}
                    {currentQuiz.averageScore > 90 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-700">
                          • High scores - consider adding advanced questions
                        </p>
                      </div>
                    )}
                    {currentQuiz.completionRate > 90 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700">
                          • Excellent engagement - great quiz structure!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
