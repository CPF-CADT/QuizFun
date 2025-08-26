import React from 'react';
import {Calendar, Lock, Globe, CircleQuestionMark } from 'lucide-react';
import type { IQuiz } from '../../types/quiz'; 

export interface CardAction {
  label: string;
  icon: React.ElementType;
  onClick: (id: string) => void;
  style: string;
}

interface QuizCardProps {
  quiz: IQuiz;
  index: number;
  actions?: CardAction[];
}

const difficultyConfig = {
  Easy: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    border: 'border-emerald-200',
    gradient: 'from-emerald-400 to-green-500'
  },
  Medium: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    border: 'border-amber-200',
    gradient: 'from-amber-400 to-orange-500'
  },
  Hard: { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    border: 'border-red-200',
    gradient: 'from-red-500 to-rose-500'
  },
};

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, index, actions = [] }) => {
  const difficulty = difficultyConfig[quiz.dificulty as keyof typeof difficultyConfig] || difficultyConfig.Medium;

  return (
    <div
      className="group flex flex-col relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${difficulty.gradient}`}></div>
      
      <div className="flex-grow">
        <div className="mb-4 mt-2">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
            {quiz.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed min-h-[40px]">
            {quiz.description || 'No description provided.'}
          </p>
        </div>
        
        <div className="flex items-center justify-end gap-2 mb-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            quiz.visibility === 'public' 
            ? 'bg-sky-50 text-sky-700 border-sky-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {quiz.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {quiz.visibility}
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
            {quiz.dificulty}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="flex items-center gap-1"><CircleQuestionMark className="w-4 h-4" />{quiz.questions?.length || 0} Questions</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(quiz.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200/60">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => action.onClick(quiz._id)}
              className={`flex-1 ${action.style} py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:shadow-lg`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};