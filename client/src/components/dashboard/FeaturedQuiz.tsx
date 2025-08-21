// src/components/FeaturedQuiz.tsx
import React from 'react';
import { Sparkles, Users, Star, Heart } from 'lucide-react';

const FeaturedQuiz: React.FC = () => {
  return (
    <div className="mt-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-violet-500/25 relative overflow-hidden ml-5">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mr-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Quiz of the Week</h3>
              <p className="text-violet-100">Most popular among students</p>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-xl font-semibold mb-2">Advanced JavaScript Concepts</h4>
            <p className="text-violet-100 mb-4">Test your knowledge of closures, promises, and async programming</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center"><Users className="w-4 h-4 mr-1" />127 participants</span>
              <span className="flex items-center"><Star className="w-4 h-4 mr-1" />4.8 rating</span>
              <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />89% loved it</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-6 py-3 bg-white text-violet-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              View Quiz
            </button>
            <button className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/20">
              Duplicate
            </button>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-6xl lg:text-8xl">
            🏆
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedQuiz;
