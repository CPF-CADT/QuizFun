// src/pages/LibraryPage.tsx
import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, Users, BarChart3, Clock, Eye, Edit2, Trash2, BookOpen } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import CreateQuizModal from "../components/dashboard/CreateQuizModal";
import type { IQuiz } from "../types/quiz";

interface QuizWithDetails extends Omit<IQuiz, 'createdBy'> {
  createdBy: string;
  createdDate: string;
  lastModified: string;
  participants: number;
  averageScore: number;
  completionRate: number;
  views: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Published' | 'Draft' | 'Archived';
}

interface LibraryPageProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentTime: Date;
}

const LibraryPage: React.FC<LibraryPageProps> = ({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
  currentTime
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithDetails | null>(null);

  // Dummy data for user's quizzes
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([
    {
      _id: "1",
      title: "Advanced JavaScript Concepts",
      description: "Test your knowledge of advanced JavaScript topics including closures, prototypes, and async programming.",
      questions: [],
      createdBy: "user123",
      createdDate: "2024-08-15",
      lastModified: "2024-08-18",
      participants: 127,
      averageScore: 78.5,
      completionRate: 89.2,
      views: 245,
      category: "Programming",
      difficulty: "Hard",
      status: "Published"
    },
    {
      _id: "2",
      title: "React Hooks Fundamentals",
      description: "Master the basics of React Hooks including useState, useEffect, and custom hooks.",
      questions: [],
      createdBy: "user123",
      createdDate: "2024-08-10",
      lastModified: "2024-08-12",
      participants: 89,
      averageScore: 82.1,
      completionRate: 94.3,
      views: 178,
      category: "Programming",
      difficulty: "Medium",
      status: "Published"
    },
    {
      _id: "3",
      title: "CSS Grid vs Flexbox",
      description: "Understanding when to use CSS Grid versus Flexbox for modern web layouts.",
      questions: [],
      createdBy: "user123",
      createdDate: "2024-08-08",
      lastModified: "2024-08-08",
      participants: 45,
      averageScore: 71.8,
      completionRate: 76.4,
      views: 95,
      category: "Web Design",
      difficulty: "Medium",
      status: "Draft"
    },
    {
      _id: "4",
      title: "Database Normalization",
      description: "Learn the principles of database normalization and when to apply different normal forms.",
      questions: [],
      createdBy: "user123",
      createdDate: "2024-08-05",
      lastModified: "2024-08-07",
      participants: 203,
      averageScore: 69.3,
      completionRate: 81.7,
      views: 387,
      category: "Database",
      difficulty: "Hard",
      status: "Published"
    },
    {
      _id: "5",
      title: "Git Workflow Basics",
      description: "Essential Git commands and workflows for collaborative development.",
      questions: [],
      createdBy: "user123",
      createdDate: "2024-08-01",
      lastModified: "2024-08-03",
      participants: 156,
      averageScore: 88.2,
      completionRate: 92.1,
      views: 298,
      category: "Version Control",
      difficulty: "Easy",
      status: "Published"
    },
    {
      _id: "6",
      title: "API Design Best Practices",
      description: "Learn how to design RESTful APIs that are scalable, maintainable, and developer-friendly.",
      questions: [],
      createdBy: "user123",
      createdDate: "2024-07-28",
      lastModified: "2024-07-30",
      participants: 78,
      averageScore: 75.6,
      completionRate: 83.9,
      views: 134,
      category: "Backend",
      difficulty: "Medium",
      status: "Archived"
    }
  ]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "published" && quiz.status === "Published") ||
                         (filterBy === "draft" && quiz.status === "Draft") ||
                         (filterBy === "archived" && quiz.status === "Archived");
    
    return matchesSearch && matchesFilter;
  });

  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      case "oldest":
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      case "popular":
        return b.participants - a.participants;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-blue-100 text-blue-800";
      case "Draft": return "bg-orange-100 text-orange-800";
      case "Archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 flex flex-col ml-2.5 mt-7 min-h-screen">
      <Header 
        setSidebarOpen={setSidebarOpen} 
        onNewQuizClick={() => setCreateModalOpen(true)} 
      />
      
      <main className={`mr-15 flex-1 p-4 lg:p-8 transition-all duration-1000 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Quiz Library</h1>
            </div>
            <p className="text-gray-600">Manage and organize all your created quizzes</p>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{quiz.description}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(quiz.createdDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{quiz.participants}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(quiz.status)}`}>
                      {quiz.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedQuizzes.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </main>
      </div>

      {/* Quiz Details Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedQuiz.title}</h2>
                  <p className="text-gray-600">{selectedQuiz.description}</p>
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created Date</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedQuiz.createdDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Modified</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedQuiz.lastModified)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Participants</p>
                      <p className="text-sm text-gray-600">{selectedQuiz.participants}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Average Score</p>
                      <p className="text-sm text-gray-600">{selectedQuiz.averageScore}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Views</p>
                      <p className="text-sm text-gray-600">{selectedQuiz.views}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-indigo-600 rounded"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Completion Rate</p>
                      <p className="text-sm text-gray-600">{selectedQuiz.completionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedQuiz.status)}`}>
                  {selectedQuiz.status}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(selectedQuiz.difficulty)}`}>
                  {selectedQuiz.difficulty}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  {selectedQuiz.category}
                </span>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  View Quiz
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Edit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateQuizModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};

export default LibraryPage;