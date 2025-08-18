// src/components/RecentQuizzes.tsx
import React from 'react';
import type { RecentQuiz } from '../../types';
import { 
  Activity, Filter, ChevronRight, MoreHorizontal, Users, Clock, Edit, Play 
} from 'lucide-react';

interface RecentQuizzesProps {
  quizzes: RecentQuiz[];
}

const getDifficultyStyles = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
    case 'Medium': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Hard': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'active': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' };
    case 'draft': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'completed': return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', dot: 'bg-gray-500' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', dot: 'bg-gray-500' };
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
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
          <button className="text-violet-600 hover:text-violet-700 transition-colors duration-300 flex items-center text-sm font-semibold">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {quizzes.map((quiz) => {
          const statusStyles = getStatusStyles(quiz.status);
          const difficultyStyles = getDifficultyStyles(quiz.difficulty);
          
          return (
            <div
              key={quiz.id}
              className="group bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-violet-300/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${quiz.color} rounded-t-2xl`}></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{quiz.category}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} border`}>
                  <div className={`w-1.5 h-1.5 ${statusStyles.dot} rounded-full mr-2`}></div>
                  {quiz.status}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyStyles.bg} ${difficultyStyles.text} ${difficultyStyles.border} border`}>
                  {quiz.difficulty}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {quiz.students} students
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {quiz.lastActivity}
                </span>
              </div>

              <div className="mb-4">
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-300">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <button className={`px-4 py-2 bg-gradient-to-r ${quiz.color} hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center`}>
                  <Play className="w-4 h-4 mr-2" />
                  Launch
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentQuizzes;
