import React, { useState } from 'react';
import {
  Search,
  Star,
  TrendingUp,
  ChevronRight,
  Filter,
  BookOpen,
  Users,
  Clock,
  Heart,
  Tag,
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
}

const sampleQuizzes: QuizPreview[] = [
  {
    id: '1',
    title: 'React Basics',
    category: 'Frontend',
    difficulty: 'Easy',
    rating: 4.5,
    popularity: 1200,
    participants: 350,
    lastUpdated: '2 days ago',
    description: 'Learn the fundamentals of React components and hooks.',
  },
  {
    id: '2',
    title: 'Advanced CSS Techniques',
    category: 'Design',
    difficulty: 'Medium',
    rating: 4.7,
    popularity: 900,
    participants: 280,
    lastUpdated: '1 week ago',
    description: 'Master animations, flexbox, grid and responsiveness.',
  },
  {
    id: '3',
    title: 'JavaScript ES6+ Features',
    category: 'Programming',
    difficulty: 'Medium',
    rating: 4.9,
    popularity: 1500,
    participants: 420,
    lastUpdated: '3 days ago',
    description: 'Explore modern JavaScript syntax and features.',
  },
  {
    id: '4',
    title: 'Node.js API Development',
    category: 'Backend',
    difficulty: 'Hard',
    rating: 4.3,
    popularity: 700,
    participants: 180,
    lastUpdated: '5 days ago',
    description: 'Build robust APIs with Express and Node.js.',
  },
];

const difficultyColors = {
  Easy: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  Hard: 'bg-red-100 text-red-800',
};

const Explore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuizzes = sampleQuizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-4xl font-bold text-gray-900">Explore Quizzes</h1>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search quizzes or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition"
          />
        </div>
      </div>

      {/* Filters and Sorting - Placeholder for future */}
      <div className="mb-6 flex justify-between items-center">
        <button className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold">
          <Filter className="w-5 h-5" />
          Filter
        </button>
        <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold">
          Sort by Popularity <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuizzes.length === 0 && (
          <p className="text-gray-600 col-span-full text-center">
            No quizzes found for "{searchTerm}"
          </p>
        )}
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:scale-[1.02] transform transition"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
            <p className="text-gray-700 mb-4">{quiz.description}</p>
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-violet-600" />
                {quiz.category}
              </span>
              <span className={`py-1 px-3 rounded-full font-semibold ${difficultyColors[quiz.difficulty]}`}>
                {quiz.difficulty}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {quiz.participants} Participants
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                {quiz.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{quiz.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
