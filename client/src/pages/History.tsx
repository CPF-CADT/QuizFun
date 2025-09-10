import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import { gameApi } from "../service/gameApi";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";

const History: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("history");
  const currentTime = new Date();

  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
    const { quizid } = useParams<{ quizid: string }>();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user?._id && quizid) {
        setLoading(true);
        try {
          const res = await gameApi.getUserQuizHistoryForQuiz(user._id, quizid);
          setQuizHistory(res.data || []);
        } catch (e) {
          setQuizHistory([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  console.log(user?._id);
  console.log(quizid);
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
                    <th className="px-6 py-3">Quiz Title</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time Taken</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">View details</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : quizHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No quiz history found.
                      </td>
                    </tr>
                  ) : (
                    quizHistory.map((quiz: any) => (
                      <tr
                        key={quiz.id}
                        className="border-b border-gray-200 hover:bg-blue-50/50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {quiz.title}
                        </td>
                        <td className="px-6 py-4  text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          {quiz.date}
                        </td>
                        <td className="px-6 py-4 flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-orange-600" />
                          {quiz.duration}
                        </td>
                        <td className="px-6 py-4 flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-teal-600" />
                          {quiz.participants}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              quiz.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {quiz.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
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