import React, { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Report: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("report");
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

  // Pie Chart Data
  const pieData = [
    { name: "Players", value: currentQuiz.totalPlayers },
    { name: "Attempts", value: currentQuiz.attempts },
    { name: "Completion %", value: currentQuiz.completionRate },
  ];

  const COLORS = ["#6366f1", "#f97316", "#22c55e"];

  // Line Chart Data (trend over dummy metrics)
  const lineData = [
    {
      name: "Metric 1",
      Avg: currentQuiz.averageScore,
      High: currentQuiz.highestScore,
      Attempts: currentQuiz.attempts,
      Completion: currentQuiz.completionRate,
    },
    {
      name: "Metric 2",
      Avg: currentQuiz.averageScore + 5,
      High: currentQuiz.highestScore - 3,
      Attempts: currentQuiz.attempts + 10,
      Completion: currentQuiz.completionRate - 2,
    },
    {
      name: "Metric 3",
      Avg: currentQuiz.averageScore + 10,
      High: currentQuiz.highestScore,
      Attempts: currentQuiz.attempts + 15,
      Completion: currentQuiz.completionRate,
    },
  ];

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

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
          {/* Decorative Blurs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

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

            {/* Quiz Selection */}
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

            {/* Key Metrics */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Key Metrics Overview
                </h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  View Detail
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Pie Chart */}
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Right: Line Chart */}
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Avg" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="High" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="Attempts" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="Completion" stroke="#a855f7" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Performance & Recommendations */}
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
                    <span className="font-medium">Good performance overall</span>
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
                    <span className="text-gray-600">Difficulty Assessment</span>
                    <span className="font-medium">
                      {currentQuiz.averageScore > 80 ? "Appropriate" : "Consider reviewing"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Retry Rate</span>
                    <span className="font-medium">
                      {Math.round(
                        (currentQuiz.attempts / currentQuiz.totalPlayers - 1) * 100
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
                      <p className="text-red-700">• Consider reviewing question difficulty</p>
                    </div>
                  )}
                  {currentQuiz.completionRate < 80 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-700">• Low completion rate - check quiz length</p>
                    </div>
                  )}
                  {currentQuiz.averageScore > 90 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-700">• High scores - consider adding advanced questions</p>
                    </div>
                  )}
                  {currentQuiz.completionRate > 90 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-700">• Excellent engagement - great quiz structure!</p>
                    </div>
                  )}
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
