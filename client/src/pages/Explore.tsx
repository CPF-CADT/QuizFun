import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { quizApi} from '../service/quizApi';
import type { IQuiz} from '../service/quizApi';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../service/userApi';

import {
  Search,
  Star,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
 GitFork,
  Zap,
  Loader,
  AlertCircle,
} from 'lucide-react';

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
  Easy: { 
    bg: 'bg-gradient-to-r from-emerald-100 to-emerald-50', 
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  Medium: { 
    bg: 'bg-gradient-to-r from-amber-100 to-yellow-50', 
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  Hard: { 
    bg: 'bg-gradient-to-r from-red-100 to-rose-50', 
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const categoryColors = {
  Frontend: 'from-blue-500 to-cyan-500',
  Design: 'from-purple-500 to-pink-500',
  Programming: 'from-green-500 to-emerald-500',
  Backend: 'from-orange-500 to-red-500',
  'Data Science': 'from-indigo-500 to-blue-500',
  'AI/ML': 'from-violet-500 to-purple-500',
  Default: 'from-gray-500 to-slate-500',
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
  const [quizzes, setQuizzes] = useState<QuizPreview[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const { user } = useAuth();
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

  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      const isNewSearch = currentPage === 1;
      if (isNewSearch) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const response = await quizApi.getAllQuizzes({
          page: currentPage,
          limit: 9,
          search: searchQuery,
          tags: selectedCategory,
          owner: 'other',
        });

        const { data } = response;
        const mappedQuizzes = data.quizzes.map(mapApiQuizToPreview);

        setQuizzes(prev => isNewSearch ? mappedQuizzes : [...prev, ...mappedQuizzes]);
        setHasNextPage(data.hasNext);

      } catch (err) {
        setError('Failed to fetch quizzes. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    if (user) {
      fetchQuizzes();
    }
  }, [searchQuery, selectedCategory, currentPage, user]);
  
  useEffect(() => {
    const fetchCreatorNames = async () => {
      const newCreatorIds = quizzes
        .map(q => q.creatorId)
        .filter(id => !creatorNames[id]);
      
      if (newCreatorIds.length === 0) return;

      const uniqueCreatorIds = [...new Set(newCreatorIds)];
      
      try {
        // const namePromises = uniqueCreatorIds.map(id => userApi.getUserById(id));
        const userResponses = await Promise.all(uniqueCreatorIds.map(id => userApi.getUserById(id)));
        
const newNames = userResponses.reduce((acc, res) => {
  // Adjust based on API response structure
  const user = res.data?.data || res.data; // maybe it's nested under 'data'
  if (user?._id && user.name) {
    acc[user._id.toString()] = user.name; // convert _id to string to match creatorId
  }
  return acc;
}, {} as Record<string, string>);

   setCreatorNames(prev => ({ ...prev, ...newNames }));
      } catch (error) {
        console.error("Failed to fetch creator names", error);
      }
    };

    if (quizzes.length > 0) {
      fetchCreatorNames();
    }
  }, [quizzes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);
  
  useEffect(() => {
    const categories = [...new Set(quizzes.map(quiz => quiz.category))];
    setAllCategories(categories);
  }, [quizzes]);

  const handleForkQuiz = async (quizId: string) => {
    setForkingQuizId(quizId);
    try {
      await quizApi.cloneQuiz(quizId);
      setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quizId));

    } catch (error) {
      console.error("Failed to fork quiz:", error);
      alert("Could not fork the quiz. Please try again.");
    } finally {
      setForkingQuizId(null);
    }
  };
  
  const handleLoadMore = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.Default;
  };
  return (
    <div className="flex min-h-screen">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentTime={currentTime}
      />
      <div className="flex-1 relative z-10">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 p-5">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
              <Zap className="w-4 h-4" /> Discover & Learn
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Explore Quizzes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Challenge yourself with our curated collection of interactive quizzes.
            </p>
          </div>

          <div className="mb-8 max-w-4xl mx-auto">
             <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="relative flex gap-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="Search by title, tag, or topic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 text-lg bg-white/50"
                  />
                  <button 
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  >
                    Search
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    All Categories
                  </button>
                  {allCategories.map((category) => (
                    <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {category}
                    </button>
                  ))}
                </div>
              </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-16"><Loader className="w-12 h-12 text-violet-600 animate-spin" /></div>
            ) : error ? (
              <div className="text-center py-16 text-red-600 bg-red-50/50 rounded-2xl">
                 <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                 <h3 className="text-xl font-semibold mb-2">{error}</h3>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Found</h3>
                <p className="text-gray-600">This may be because you have already forked all available quizzes matching your search.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes.map((quiz, index) => (
                    <div key={`${quiz.id}-${index}`} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(quiz.category)}`}></div>
                      
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">{quiz.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{quiz.description}</p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-r ${getCategoryColor(quiz.category)} rounded-lg flex items-center justify-center`}>
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{quiz.category}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyConfig[quiz.difficulty].bg} ${difficultyConfig[quiz.difficulty].text} ${difficultyConfig[quiz.difficulty].border}`}>
                          {quiz.difficulty}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{quiz.participants}</span>
                          <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" />{quiz.rating.toFixed(1)}</span>
                        </div>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{quiz.lastUpdated}</span>
                      </div>
                      <button 
                        onClick={() => handleForkQuiz(quiz.id)}
                        disabled={forkingQuizId === quiz.id}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {forkingQuizId === quiz.id ? (<><Loader className="w-4 h-4 animate-spin" />Forking...</>) : (<><GitFork className="w-4 h-4" />Fork Quiz</>)}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-12 text-center">
                  {hasNextPage && (
                    <button onClick={handleLoadMore} disabled={loadingMore} className="bg-white/80 backdrop-blur-sm text-gray-800 font-semibold py-3 px-8 rounded-full shadow-lg border border-white/20 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
