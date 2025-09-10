// FILE: src/pages/Report.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, Target, Search, MessageSquare, Clock } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { quizApi, type IQuiz } from "../service/quizApi";
import { reportApi, type IQuizAnalytics } from "../service/reportApi";
import { useDebounce } from '../hook/useDebounce';
import { FeedbackModal } from "../components/report/FeedbackModal";
import { ExcelExportButton } from "../components/ui/ExcelExportButton";

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

    // Select quiz from URL
    useEffect(() => {
        const quizIdFromUrl = searchParams.get('quizId');
        if (quizIdFromUrl && !selectedQuizId) {
            setSelectedQuizId(quizIdFromUrl);
        }
    }, [searchParams, selectedQuizId]);

    // Fetch quizzes
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
            } catch {
                setError("Failed to load your quizzes.");
                setQuizList([]);
            } finally {
                setIsLoadingList(false);
            }
        };
        fetchQuizList();
    }, [debouncedSearchTerm]);

    // Fetch report data
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
            } catch {
                setError(`Failed to load report for this quiz.`);
                setReportData(null);
            } finally {
                setIsLoadingReport(false);
            }
        };
        fetchReportData();
    }, [selectedQuizId]);

    // Helper for difficulty badge
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Easy": return "bg-green-100 text-green-700";
            case "Medium": return "bg-yellow-100 text-yellow-700";
            case "Hard": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Pie chart data
    const pieChartData = reportData ? [
        { name: "Unique Players", value: reportData.engagementMetrics.uniquePlayers },
        { name: "Total Sessions", value: reportData.engagementMetrics.totalSessions },
        { name: "Avg Completion %", value: reportData.engagementMetrics.averageCompletionRate },
    ].filter(item => item.value > 0) : [];

    const PIE_COLORS = ["#6366f1", "#f97316", "#22c55e"];

    // Restructured data for three separate bar charts
    const passFailData = reportData ? [
        { name: "Performance", Passed: reportData.playerPerformance.passOrFail.passed, Failed: reportData.playerPerformance.passOrFail.failed },
    ] : [];

    const scoreDistributionData = reportData ? [
        {
            name: "Score Distribution",
            '0-49%': reportData.playerPerformance.scoreDistribution['0-49%'],
            '50-69%': reportData.playerPerformance.scoreDistribution['50-69%'],
            '70-89%': reportData.playerPerformance.scoreDistribution['70-89%'],
            '90-100%': reportData.playerPerformance.scoreDistribution['90-100%'],
        }
    ] : [];

    const speedData = reportData ? [
        {
            name: "Speed",
            Fast: reportData.playerPerformance.fastResponses, // Updated to access the number directly
            Average: reportData.totalUniquePlayers - reportData.playerPerformance.fastResponses
        },
    ] : [];

    const BAR_COLORS = {
        'Passed': "#22c55e",
        'Failed': "#ef4444",
        'Fast': "#6366f1",
        'Average': "#a855f7",
        '0-49%': "#cbd5e1",
        '50-69%': "#f97316",
        '70-89%': "#6366f1",
        '90-100%': "#a855f7",
    };

    interface CustomTooltipProps {
        active?: boolean;
        payload?: Array<{ name: string; value: number; color: string }>;
        label?: string;
    }

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            let title = '';
            let description = '';

            switch (label) {
                case 'Performance':
                    title = 'Overall Performance';
                    break;
                case 'Score Distribution':
                    title = 'Score Distribution';
                    break;
                case 'Speed':
                    title = 'Player Thinking Speed';
                    description = `Fast thinkers answered questions in under 50% of the allocated time.`;
                    break;
                default:
                    title = label || '';
                    break;
            }

            return (
                <div className="bg-white p-4 border border-gray-300 rounded shadow-md text-sm">
                    <p className="font-semibold">{title}</p>
                    {description && <p className="text-gray-600 mb-2">{description}</p>}
                    {payload.map((item, index) => (
                        <p key={index} style={{ color: item.color }}>
                            {item.name}: {item.value} players
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };


    return (
        <div className="flex min-h-screen">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                currentTime={new Date()}
            />

            <div className="flex-1 relative z-10">
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
                    {/* Decorative gradients */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                    <div className="relative z-10 p-6 lg:p-12">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                                Quiz Analytics Dashboard
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Dive deep into the performance and engagement metrics for each quiz.
                            </p>
                        </div>

                        {/* Quiz Selector */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Select a Quiz to Analyze</h2>
                                <div className="relative w-full md:w-1/3 mt-4 md:mt-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search your quizzes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            {isLoadingList ? <p className="text-gray-500">Loading quizzes...</p> :
                                error && !reportData ? <p className="text-red-500">{error}</p> :
                                    quizList.length === 0 ? <p className="text-center py-4">No quizzes found.</p> :
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                            {quizList.map((quiz) => (
                                                <button
                                                    key={quiz._id}
                                                    onClick={() => setSelectedQuizId(quiz._id)}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedQuizId === quiz._id ? "border-purple-500 bg-purple-50 shadow-lg" : "border-white/20 bg-white/60 hover:border-purple-300 hover:bg-purple-25"}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{quiz.title}</h3>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(quiz.dificulty)}`}>{quiz.dificulty}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-1">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                                                </button>
                                            ))}
                                        </div>}
                        </div>

                        {isLoadingReport ? <div className="text-center p-8">Loading Report...</div> :
                            !selectedQuizId ? <div className="text-center p-8 text-gray-500">Please select a quiz to view analytics.</div> :
                                error ? <div className="text-center p-8 text-red-500">{error}</div> :
                                    reportData && (
                                        <div className="animate-fade-in space-y-8">
                                            {/* Metrics Overview */}
                                            <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                                    <h3 className="text-lg font-semibold text-gray-800">Key Metrics Overview for "{reportData.quizTitle}"</h3>
                                                    <ExcelExportButton
                                                        type="analytics"
                                                        quizId={selectedQuizId}
                                                        buttonText="Export Analytics"
                                                        buttonClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* Pie Chart: Player Engagement */}
                                                    <div className="w-full h-80 flex flex-col items-center justify-center bg-white/80 rounded-lg p-4 shadow-sm">
                                                        <h4 className="text-lg font-bold mb-4 text-gray-800">Player Engagement 📈</h4>
                                                        {pieChartData.length > 0 ? (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={pieChartData}
                                                                        dataKey="value"
                                                                        nameKey="name"
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        outerRadius={80}
                                                                        labelLine={false}
                                                                        label={({ name, value }) => `${name}: ${name.includes('%') ? `${value}%` : value}`}
                                                                    >
                                                                        {pieChartData.map((_entry, index) => (
                                                                            <Cell key={`cell-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip formatter={(value: number, name: string) => [`${value}${name.includes('%') ? '%' : ''}`, name]} />
                                                                    <Legend />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <p className="text-gray-500">No engagement data available for this quiz yet.</p>
                                                        )}
                                                    </div>

                                                    {/* Bar Charts: Three distinct groups */}
                                                    <div className="w-full h-80 flex flex-col justify-center bg-white/80 rounded-lg p-4 shadow-sm">
                                                        <h4 className="text-lg font-bold mb-4 text-gray-800">Player Performance 🎯</h4>
                                                        <div className="grid grid-cols-3 gap-2 h-full">
                                                            {/* Pass/Fail Chart */}
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={passFailData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                                    <YAxis label={{ value: 'Number of Players', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                                                                    <Tooltip content={<CustomTooltip />} />
                                                                    <Bar dataKey="Passed" fill={BAR_COLORS.Passed} name="Passed" />
                                                                    <Bar dataKey="Failed" fill={BAR_COLORS.Failed} name="Failed" />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                            {/* Score Distribution Chart */}
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={scoreDistributionData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                                    <YAxis hide />
                                                                    <Tooltip content={<CustomTooltip />} />
                                                                    <Bar dataKey="0-49%" fill={BAR_COLORS['0-49%']} name="0-49% Score" />
                                                                    <Bar dataKey="50-69%" fill={BAR_COLORS['50-69%']} name="50-69% Score" />
                                                                    <Bar dataKey="70-89%" fill={BAR_COLORS['70-89%']} name="70-89% Score" />
                                                                    <Bar dataKey="90-100%" fill={BAR_COLORS['90-100%']} name="90-100% Score" />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                            {/* Speed Comparison Chart */}
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={speedData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                                    <YAxis hide />
                                                                    <Tooltip content={<CustomTooltip />} />
                                                                    <Bar dataKey="Fast" fill={BAR_COLORS.Fast} name="Fast Thinkers" />
                                                                    <Bar dataKey="Average" fill={BAR_COLORS.Average} name="Average Thinkers" />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                        <div className="text-center text-sm text-gray-500 mt-2">
                                                            Pass/Fail, Score Distribution, and Speed
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Performance & Feedback */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="bg-white/40 rounded-xl p-6">
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />Performance Analysis
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Average Correct Score</span>
                                                            <span className="font-medium text-blue-600">{reportData.averageQuizScore}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Average Completion Rate</span>
                                                            <span className="font-medium text-green-600">{reportData.engagementMetrics.averageCompletionRate}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Players Passed / Total</span>
                                                            <span className="font-medium text-purple-600">{reportData.playerPerformance.passOrFail.passed} / {reportData.totalUniquePlayers}</span>
                                                        </div>
                                                        {/* New metric display */}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-indigo-500" />Players who think fast
                                                            </span>
                                                            <span className="font-medium text-indigo-600">{reportData.playerPerformance.fastResponses} / {reportData.totalUniquePlayers}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 🎉 Friendlier Player Feedback */}
                                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:shadow-xl transition-all duration-300">
                                                    <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
                                                        <Target className="w-6 h-6 mr-2 text-purple-600 animate-bounce" />
                                                        Player Feedback
                                                    </h3>
                                                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                                                        <div className="bg-white rounded-full p-4 shadow-md mb-4">
                                                            <MessageSquare className="w-10 h-10 text-indigo-500 animate-pulse" />
                                                        </div>
                                                        <p className="text-gray-700 mb-6 font-medium">
                                                            See what players <span className="text-purple-600">loved ❤️</span> and what they think can be improved ✨
                                                        </p>
                                                        <button
                                                            onClick={() => setIsFeedbackModalOpen(true)}
                                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-6 rounded-full hover:scale-105 transition-transform shadow-md"
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

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                quizId={selectedQuizId}
            />
        </div>
    );
};

export default Report;