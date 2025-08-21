// src/components/StatCardGrid.tsx
import React from 'react';
import type { QuizStats } from '../../types/';
import { BookOpen, Users, Target, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardGridProps {
  stats: QuizStats;
}

const StatCardGrid: React.FC<StatCardGridProps> = ({ stats }) => {
  const statItems = [
    { 
      title: 'Total Quizzes', 
      value: stats.totalQuizzes, 
      icon: BookOpen, 
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-200'
    },
    { 
      title: 'Users', 
      value: stats.totalStudents, 
      icon: Users, 
      change: '+8%',
      trend: 'up',
      color: 'from-emerald-500 to-teal-500',
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200'
    },
    { 
      title: 'Completed', 
      value: stats.completedQuizzes, 
      icon: Target, 
      change: '+15%',
      trend: 'up',
      color: 'from-purple-500 to-indigo-500',
      bg: 'from-purple-50 to-indigo-50',
      border: 'border-purple-200'
    },
    { 
      title: 'Avg Score', 
      value: `${stats.averageScore}%`, 
      icon: Award, 
      change: '+3%',
      trend: 'up',
      color: 'from-amber-500 to-orange-500',
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12 ml-5">
      {statItems.map((stat) => (
        <div
          key={stat.title}
          className={`group relative bg-gradient-to-br ${stat.bg} rounded-2xl lg:rounded-3xl p-4 lg:p-6 border ${stat.border} hover:shadow-xl hover:shadow-${stat.color.split('-')[1]}-500/10 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 lg:p-3 bg-gradient-to-br ${stat.color} rounded-xl lg:rounded-2xl shadow-lg`}>
              <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className={`flex items-center ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'} text-xs lg:text-sm font-bold`}>
              {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> : <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />}
              {stat.change}
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1">{stat.title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCardGrid;
