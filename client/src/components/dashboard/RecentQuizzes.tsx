// src/components/dashboard/RecentQuizzes.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { IQuiz } from '../../types/quiz';
import { 
  Activity, ChevronRight, Users, Clock, Edit, Play 
} from 'lucide-react';

interface RecentQuizzesProps {
  quizzes: IQuiz[];
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'from-green-400 to-emerald-500';
    case 'Medium': return 'from-yellow-400 to-orange-500';
    case 'Hard': return 'from-red-400 to-rose-500';
    default: return 'from-gray-400 to-gray-500';
  }
};

const RecentQuizzes: React.FC<RecentQuizzesProps> = ({ quizzes }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-gray-200/50 p-6 lg:p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Your Quizzes</h2>
        </div>
        <button className="text-violet-600 hover:text-violet-700 transition-colors duration-300 flex items-center text-sm font-semibold">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          // Card container
          <div
            key={quiz._id}
            // Flexbox layout for consistent height and alignment
            className="group bg-white rounded-2xl p-5 border border-gray-200/50 hover:border-violet-300 hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Top section of the card */}
            <div className="flex-grow">
              <div className={`px-3 py-1 rounded-full text-xs font-medium text-white inline-block mb-3 bg-gradient-to-r ${getDifficultyColor(quiz.dificulty)}`}>
                {quiz.dificulty}
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-violet-700 truncate">
                {quiz.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3 h-10">
                {quiz.description || 'No description provided.'}
              </p>
            </div>

            {/* Bottom section of the card */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                  {quiz.questions?.length || 0} questions
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                  {new Date(quiz.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="text-gray-900 font-bold">{quiz.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${quiz.color} h-2 rounded-full transition-all duration-1000 relative overflow-hidden`}
                    style={{ width: `${quiz.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div> */}

              <div className="flex items-center justify-between">
                <Link
                  to={`/quiz-editor/${quiz._id}`}
                  className="p-2 bg-gray-100 hover:bg-violet-100 rounded-lg text-gray-600 hover:text-violet-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button className={`px-4 py-2 bg-gradient-to-r ${getDifficultyColor(quiz.dificulty)} hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center`}>
                  <Play className="w-4 h-4 mr-2" />
                  Launch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentQuizzes;
