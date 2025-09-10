import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, Calendar, Eye } from 'lucide-react';


// Type definitions for the component props
interface Quiz {
  id: string;
  title: string;
  category: string;
  date: string;
  score: number;
  totalQuestions: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  onView: (quizId: string) => void;
}

// Color configurations (can be moved to a shared constants file)
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
  Mathematics: 'from-blue-500 to-cyan-500',
  History: 'from-amber-500 to-orange-500',
  Science: 'from-green-500 to-emerald-500',
  Literature: 'from-purple-500 to-pink-500',
  Geography: 'from-indigo-500 to-blue-500',
  Technology: 'from-violet-500 to-purple-500',
};

const QuizCardHistory: React.FC<QuizCardProps> = ({ quiz, index }) => {
  return (
    <div
      className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Category Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryColors[quiz.category as keyof typeof categoryColors]}`}></div>
      
      <div className="mb-4 mt-2">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
          {quiz.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">{quiz.description}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-gradient-to-r ${categoryColors[quiz.category as keyof typeof categoryColors]} rounded-lg flex items-center justify-center`}>
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
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {quiz.totalQuestions} Q's
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {quiz.duration}
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(quiz.date).toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link   to={`/history/${quiz.id}`}className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:shadow-lg">
          <Eye className="w-4 h-4" />
          View History
        </Link>

      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default QuizCardHistory;