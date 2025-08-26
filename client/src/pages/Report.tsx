// FILE: src/pages/Report.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, Target, Search, MessageSquare } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { quizApi, type IQuiz } from "../service/quizApi";
import { reportApi, type IQuizAnalytics } from "../service/reportApi";
import { useDebounce } from '../hook/useDebounce';
import { FeedbackModal } from "../components/report/FeedbackModal";

const Report: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("report");
    const [quizList, setQuizList] = useState<IQuiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [reportData, setReportData] = useState<IQuizAnalytics | null>(null);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const quizIdFromUrl = searchParams.get('quizId');
        if (quizIdFromUrl && !selectedQuizId) {
            setSelectedQuizId(quizIdFromUrl);
        }
    }, [searchParams, selectedQuizId]);

    useEffect(() => {
        const fetchQuizList = async () => {
            setIsLoadingList(true);
            setError(null);
            try {
                const response = await quizApi.getAllQuizzes({
                    limit: 5,
                    search: debouncedSearchTerm,
                    owner: 'me',
                    sortBy: 'createdAt',
                    sortOrder: "desc",
                });
                setQuizList(response.data.quizzes);
            } catch (err) {
                setError("Failed to load your quizzes.");
                setQuizList([]);
            } finally {
                setIsLoadingList(false);
            }
        };
        fetchQuizList();
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (!selectedQuizId) {
            setReportData(null);
            return;
        }
        const fetchReportData = async () => {
            setIsLoadingReport(true);
            setError(null);
            try {
                const response = await reportApi.getQuizAnalytics(selectedQuizId);
                setReportData(response.data);
            } catch (err) {
                setError(`Failed to load report for this quiz.`);
                setReportData(null);
            } finally {
                setIsLoadingReport(false);
            }
        };
        fetchReportData();
    }, [selectedQuizId]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Easy": return "bg-green-100 text-green-700";
            case "Medium": return "bg-yellow-100 text-yellow-700";
            case "Hard": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const currentQuizData = reportData ? {
        title: reportData.quizTitle,
        totalPlayers: reportData.totalUniquePlayers,
        averageScore: reportData.averageQuizScore,
        completionRate: reportData.playerPerformance.averageCompletionRate,
        attempts: reportData.totalSessions,
    } : null;

    const pieData = currentQuizData ? [
        { name: "Unique Players", value: currentQuizData.totalPlayers },
        { name: "Total Sessions", value: currentQuizData.attempts },
        { name: "Avg Completion %", value: Math.round(currentQuizData.completionRate) },
    ] : [];

    const COLORS = ["#6366f1", "#f97316", "#22c55e"];

    const lineData = currentQuizData ? [
        { name: "Metric A", Avg: currentQuizData.averageScore, Attempts: currentQuizData.attempts, Completion: currentQuizData.completionRate },
        { name: "Metric B", Avg: currentQuizData.averageScore + 5, Attempts: currentQuizData.attempts + 10, Completion: currentQuizData.completionRate - 2 },
        { name: "Metric C", Avg: currentQuizData.averageScore - 2, Attempts: currentQuizData.attempts + 5, Completion: currentQuizData.completionRate + 3 },
    ] : [];

    return (
        <div className="flex min-h-screen">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentTime={new Date()} />
            <div className="flex-1 relative z-10">
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="relative z-10 p-6 lg:p-12">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                                Quiz Analytics Dashboard
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Analyze performance and insights for each quiz individually
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Select a Quiz to Analyze</h2>
                                <div className="relative w-full md:w-1/3 mt-4 md:mt-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Search your quizzes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            {isLoadingList ? <p className="text-gray-500">Loading quizzes...</p> :
                                error && !reportData ? <p className="text-red-500">{error}</p> :
                                    quizList.length === 0 ? <p className="text-center py-4">No quizzes found.</p> :
                                        (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                                {quizList.map((quiz) => (
                                                    <button key={quiz._id} onClick={() => setSelectedQuizId(quiz._id)} className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedQuizId === quiz._id ? "border-purple-500 bg-purple-50 shadow-lg" : "border-white/20 bg-white/60 hover:border-purple-300 hover:bg-purple-25"}`}>
                                                        <div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-gray-800 text-sm leading-tight">{quiz.title}</h3><span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(quiz.dificulty)}`}>{quiz.dificulty}</span></div>
                                                        <p className="text-xs text-gray-500 mb-1">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                        </div>

                        {isLoadingReport ? <div className="text-center p-8">Loading Report...</div> :
                            !selectedQuizId ? <div className="text-center p-8 text-gray-500">Please select a quiz to view analytics.</div> :
                                error ? <div className="text-center p-8 text-red-500">{error}</div> :
                                    reportData && currentQuizData && (
                                        <div className="animate-fade-in space-y-8">
                                            <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Key Metrics Overview for "{reportData.quizTitle}"</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="w-full h-80"><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{pieData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                                                    <div className="w-full h-80"><ResponsiveContainer><LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="Avg" name="Avg Score %" stroke="#3b82f6" strokeWidth={2} /><Line type="monotone" dataKey="Attempts" name="Sessions" stroke="#22c55e" strokeWidth={2} /><Line type="monotone" name="Completion %" dataKey="Completion" stroke="#a855f7" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="bg-white/40 rounded-xl p-6">
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-blue-600" />Performance Analysis</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center"><span className="text-gray-600">Engagement Level</span><span className={`font-medium ${currentQuizData.completionRate > 85 ? "text-green-600" : "text-yellow-600"}`}>{currentQuizData.completionRate > 85 ? "High" : "Moderate"}</span></div>
                                                        <div className="flex justify-between items-center"><span className="text-gray-600">Difficulty Assessment</span><span className="font-medium">{currentQuizData.averageScore > 80 ? "Appropriate" : "Consider reviewing"}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/40 rounded-xl p-6 flex flex-col">
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center"><Target className="w-5 h-5 mr-2 text-purple-600" />Player Feedback</h3>
                                                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                                                        <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                                                        <p className="text-gray-600 mb-4">
                                                            Check player ratings and comments to improve your quiz.
                                                        </p>
                                                        <button
                                                            onClick={() => setIsFeedbackModalOpen(true)}
                                                            className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                                                        >
                                                            View All Feedback
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                    </div>
                </div>
            </div>
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                quizId={selectedQuizId}
            />
        </div>
    );
};

export default Report;