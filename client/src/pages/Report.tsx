import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, Target, Search, BarChartBig, Rocket } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// --- CONTEXT & API IMPORTS ---
import { quizApi, type IQuiz } from "../service/quizApi";
import { reportApi, type IQuizAnalytics } from "../service/reportApi";
import { useQuizGame } from '../context/GameContext'; // Import game context
import { useAuth } from '../context/AuthContext'; // Import auth context

// --- COMPONENT IMPORTS ---
import { FeelingRating } from '../components/common/FeelingRating';
import { useDebounce } from '../hook/useDebounce';

// --- Helper Component for the "No Data" state ---
interface NoReportDataProps {
    quizId: string;
}

const NoReportData: React.FC<NoReportDataProps> = ({ quizId }) => {
    const { createRoom } = useQuizGame();
    const { user } = useAuth();

    const handleLaunch = () => {
        if (!user) {
            alert("You must be logged in to host a game.");
            return;
        }
        
        console.log(`Launching quiz ${quizId} from report page...`);
        createRoom({
            quizId: quizId,
            hostName: user.name,
            userId: user._id,
            settings: { autoNext: true, allowAnswerChange: true }
        });
    };
    
    return (
        <div className="text-center p-12 bg-white/60 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl animate-fade-in">
            <BarChartBig className="w-16 h-16 mx-auto text-purple-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Ready to Launch!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
                This quiz needs to be hosted for players to join. Launch a game now to start gathering analytics!
            </p>
            <button 
                onClick={handleLaunch}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl mx-auto"
            >
                <Rocket className="w-5 h-5" />
                Launch Now
            </button>
        </div>
    );
};


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

    const [searchParams] = useSearchParams();

    // Effect to handle initial selection from URL
    useEffect(() => {
        const quizIdFromUrl = searchParams.get('quizId');
        if (quizIdFromUrl && !selectedQuizId) {
            setSelectedQuizId(quizIdFromUrl);
        }
    }, [searchParams, selectedQuizId]);

    // Effect to fetch the list of user's quizzes
    useEffect(() => {
        const fetchQuizList = async () => {
            setIsLoadingList(true);
            setError(null);
            try {
                const response = await quizApi.getAllQuizzes({
                    limit: 100,
                    search: debouncedSearchTerm,
                    owner: 'me',
                    sortBy: 'createdAt',
                    sortOrder: "desc",
                });
                setQuizList(response.data.quizzes);
            } catch (err) {
                setError("Failed to load your quizzes. Please check your connection and try again.");
                setQuizList([]);
            } finally {
                setIsLoadingList(false);
            }
        };
        fetchQuizList();
    }, [debouncedSearchTerm]);

    // Effect to fetch the detailed analytics report
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
                if (response.data && response.data.totalUniquePlayers > 0) {
                   setReportData(response.data);
                } else {
                   setReportData(null);
                }
            } catch (err) {
                console.error("Could not fetch analytics, showing 'No Data' message:", err);
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
    
    // --- RENDER LOGIC ---
    const renderReportContent = () => {
        if (isLoadingReport) {
            return <div className="text-center p-8 text-indigo-600 font-semibold">Loading Report...</div>;
        }
        if (!selectedQuizId) {
            return <div className="text-center p-8 text-gray-500">Please select a quiz to view its analytics.</div>;
        }
        if (error) {
             return <div className="text-center p-8 text-red-500">{error}</div>;
        }
        if (!reportData || !currentQuizData) {
            return <NoReportData quizId={selectedQuizId} />;
        }

        // If we have data, render the full report
        return (
            <div className="animate-fade-in space-y-8">
                <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Key Metrics Overview for "{reportData.quizTitle}"</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="w-full h-80">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {pieData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full h-80">
                            <ResponsiveContainer>
                                <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Avg" name="Avg Score %" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Attempts" name="Sessions" stroke="#22c55e" strokeWidth={2} />
                                    <Line name="Completion %" dataKey="Completion" stroke="#a855f7" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
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
                    <div className="bg-white/40 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center"><Target className="w-5 h-5 mr-2 text-purple-600" />Player Feedback</h3>
                        <div className="space-y-3 text-sm max-h-60 overflow-y-auto pr-2">
                            {reportData.recommendations.feedback.length > 0 ? reportData.recommendations.feedback.map((fb, idx) => (
                                <div key={idx} className="bg-white/50 border border-gray-200 rounded-lg p-3">
                                    <FeelingRating rating={fb.rating} />
                                    {fb.comment && <p className="text-gray-600 mt-2 italic">"{fb.comment}"</p>}
                                </div>
                            )) : <p className="text-gray-500">No feedback submitted for this quiz yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                                quizList.length === 0 ? <p className="text-center py-4">You haven't created any quizzes yet.</p> :
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
                        
                        <div className="mt-8">
                           {renderReportContent()}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;