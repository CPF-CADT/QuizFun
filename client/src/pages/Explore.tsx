import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { quizApi } from '../service/quizApi';
import type { IQuiz } from '../service/quizApi';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../service/userApi';
import {
    Search, Star, TrendingUp, Users, GitFork, Zap, Loader, AlertCircle, Menu, PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    creatorId: string;
}

const difficultyConfig = {
    Easy: { bg: 'bg-gradient-to-r from-emerald-100 to-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    Medium: { bg: 'bg-gradient-to-r from-amber-100 to-yellow-50', text: 'text-amber-700', border: 'border-amber-200' },
    Hard: { bg: 'bg-gradient-to-r from-red-100 to-rose-50', text: 'text-red-700', border: 'border-red-200' },
};

const formatDistanceToNow = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const mapApiQuizToPreview = (apiQuiz: IQuiz): QuizPreview => ({
    id: apiQuiz._id,
    title: apiQuiz.title,
    category: apiQuiz.tags?.[0] || 'General',
    difficulty: apiQuiz.dificulty,
    description: apiQuiz.description || `A quiz about ${apiQuiz.title}.`,
    lastUpdated: formatDistanceToNow(apiQuiz.updatedAt),
    rating: 4.5,
    popularity: Math.floor(Math.random() * 1500),
    participants: Math.floor(Math.random() * 500),
    creatorId: apiQuiz.creatorId.toString(),
});

const Explore: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<QuizPreview[]>([]);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [forkingQuizId, setForkingQuizId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('explore');
    const currentTime = new Date();
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const handleSearch = () => {
        setSearchQuery(searchTerm);
        setCurrentPage(1);
        setQuizzes([]);
    };

    const handlePlaySolo = (quizId: string) => {
        navigate(`/solo/${quizId}`);
    };

    useEffect(() => {
        if (!user) return;
        const fetchQuizzes = async () => {
            const isFirstPage = currentPage === 1;
            if (isFirstPage) setLoading(true); else setLoadingMore(true);
            setError(null);
            try {
                const response = await quizApi.getAllQuizzes({
                    page: currentPage, limit: 9, search: searchQuery,
                    tags: selectedCategory, owner: 'other',
                });
                const mappedQuizzes = response.data.quizzes.map(mapApiQuizToPreview);
                setQuizzes(prev => isFirstPage ? mappedQuizzes : [...prev, ...mappedQuizzes]);
                setHasNextPage(response.data.hasNext);
            } catch (err) {
                setError('Failed to fetch quizzes. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };
        fetchQuizzes();
    }, [searchQuery, selectedCategory, currentPage, user]);

    useEffect(() => {
        const fetchCreatorNames = async () => {
            const newIds = quizzes.map(q => q.creatorId).filter(id => !creatorNames[id]);
            if (newIds.length === 0) return;
            const uniqueIds = [...new Set(newIds)];
            try {
                const responses = await Promise.all(uniqueIds.map(id => userApi.getUserById(id)));
                const newNames = responses.reduce((acc, res) => {
                    const userData = res.data?.data || res.data;
                    if (userData?._id && userData.name) acc[userData._id.toString()] = userData.name;
                    return acc;
                }, {} as Record<string, string>);
                setCreatorNames(prev => ({ ...prev, ...newNames }));
            } catch (err) {
                console.error('Failed to fetch creator names', err);
            }
        };
        if (quizzes.length > 0) fetchCreatorNames();
    }, [quizzes, creatorNames]);

    useEffect(() => {
        const categories = [...new Set(quizzes.map(q => q.category))];
        setAllCategories(categories);
    }, [quizzes]);

    const handleForkQuiz = async (quizId: string) => {
        setForkingQuizId(quizId);
        try {
            await quizApi.cloneQuiz(quizId);
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
        } catch (err) {
            console.error('Failed to fork quiz', err);
            alert('Could not fork quiz. Please try again.');
        } finally {
            setForkingQuizId(null);
        }
    };

    useEffect(() => {
        if (!hasNextPage || loadingMore) return;
        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting) setCurrentPage(prev => prev + 1); },
            { threshold: 1.0 }
        );
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => { if (sentinelRef.current) observer.unobserve(sentinelRef.current); };
    }, [hasNextPage, loadingMore]);

    // utility function
    const getCategoryColor = () => {
        const colors = [
            "bg-pink-500",
            "bg-green-500",
            "bg-indigo-500",
            "bg-yellow-500",
            "bg-cyan-500",
        ];
        // Pick a random index
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                currentTime={currentTime}
            />

            <main className="flex-1 p-4 sm:p-6 min-w-0">
                {/* Background effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Mobile Header */}
                <header className="flex items-center justify-between mb-4 lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-slate-700 hover:bg-slate-200">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">Explore</h1>
                    <div className="w-10"></div> {/* Spacer to balance title */}
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:block text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
                        <Zap className="w-4 h-4" /> Discover & Learn
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                        Explore Quizzes
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Challenge yourself with our curated collection of interactive quizzes.
                    </p>
                </header>

                {/* Search + Categories */}
                <div className="mb-8 max-w-4xl mx-auto">
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-xl">
                        <div className="relative flex flex-col sm:flex-row gap-2">
                            <Search className="absolute left-4 top-3.5 sm:top-1/2 sm:transform sm:-translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search quizzes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-11 pr-4 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 text-base sm:text-lg bg-white/50"
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 sm:py-2 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                            >
                                Search
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <button onClick={() => { setSelectedCategory(''); setQuizzes([]); setCurrentPage(1); }}
                                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                All Categories
                            </button>
                            {allCategories.map(category => (
                                <button key={category} onClick={() => { setSelectedCategory(category); setQuizzes([]); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quizzes Grid */}
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-16"><Loader className="w-12 h-12 text-violet-600 animate-spin" /></div>
                    ) : error ? (
                        <div className="text-center py-16 text-red-600 bg-red-50/50 rounded-2xl"><AlertCircle className="w-12 h-12 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">{error}</h3></div>
                    ) : quizzes.length === 0 ? (
                        <div className="text-center py-16"><div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-12 h-12 text-gray-400" /></div><h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Found</h3><p className="text-gray-600">This may be because you have already forked all available quizzes matching your search.</p></div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {quizzes.map((quiz, index) => (
                                    <div key={`${quiz.id}-${index}`} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-5 lg:p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 overflow-hidden">
                                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor()}`}></div>
                                        <div className="absolute top-4 right-4 text-right">
                                            {quiz.popularity > 1000 && (
                                                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold mb-1">
                                                    <TrendingUp className="w-3 h-3" /> Hot
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-600 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full">
                                                By: {creatorNames[quiz.creatorId] || '...'}
                                            </p>
                                        </div>
                                        <div className="mb-4 pt-8">
                                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">{quiz.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{quiz.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3 lg:gap-4">
                                                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{quiz.participants}</span>
                                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" />{quiz.rating.toFixed(1)}</span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyConfig[quiz.difficulty].bg} ${difficultyConfig[quiz.difficulty].text} ${difficultyConfig[quiz.difficulty].border}`}>
                                                {quiz.difficulty}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full mt-4">
                                            <button
                                                onClick={() => handlePlaySolo(quiz.id)}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 lg:py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                                            >
                                                <PlayCircle className="w-4 h-4" />Play Solo
                                            </button>
                                            <button
                                                onClick={() => handleForkQuiz(quiz.id)}
                                                disabled={forkingQuizId === quiz.id}
                                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 lg:py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {forkingQuizId === quiz.id ? (<><Loader className="w-4 h-4 animate-spin" />Forking...</>) : (<><GitFork className="w-4 h-4" />Fork Quiz</>)}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {hasNextPage && (
                                <div ref={sentinelRef} className="mt-12 text-center">
                                    {loadingMore && <Loader className="w-8 h-8 text-violet-600 animate-spin mx-auto" />}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Explore;