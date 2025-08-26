import React, { useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

const History: React.FC = () => {
  // const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("history");
  const currentTime = new Date();

  // Dummy quiz history data
  const quizHistory = [
    { id: 1, date: "May 15, 2025", score: 85, timeTaken: "3m 42s", players: 120, status: "Completed" },
    { id: 2, date: "May 12, 2025", score: 92, timeTaken: "4m 10s", players: 98, status: "Completed" },
    { id: 3, date: "May 10, 2025", score: 74, timeTaken: "2m 58s", players: 76, status: "Completed" },
    { id: 4, date: "May 8, 2025", score: 67, timeTaken: "5m 21s", players: 89, status: "Incomplete" },
    { id: 5, date: "May 5, 2025", score: 90, timeTaken: "6m 03s", players: 65, status: "Completed" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-500";
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

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
          {/* Decorative Blurs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

          {/* Page Content */}
          <div className="relative z-10 p-6 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                Quiz History
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track your past quiz attempts and performance
              </p>
            </div>

            {/* History Table */}
            <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-10 py-3">Date</th>
                    <th className="px-10 py-3">Score</th>
                    <th className="px-10 py-3">Time Taken</th>
                    <th className="px-10 py-3">Players</th>
                    <th className="px-10 py-3">More Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {quizHistory.map((quiz) => (
                    <tr key={quiz.id} className="border-b border-gray-200 hover:bg-blue-50/50 transition">
                      <td className="px-10 py-4 flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        {quiz.date}
                      </td>
                      <td className={`px-10 py-4 font-semibold ${getScoreColor(quiz.score)}`}>
                        {quiz.score}%
                      </td>
                      <td className="px-10 py-4 flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-orange-600" />
                        {quiz.timeTaken}
                      </td>
                      <td className="px-10 py-4 text-gray-600 font-medium">
                        {quiz.players}
                      </td>
                      <td className="px-10 py-4">
                        <button
                          onClick={() => navigate(`/history/${quiz.id}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-all duration-300"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
