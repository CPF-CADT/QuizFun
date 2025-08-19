import React from 'react';
import { FaBolt, FaChartLine, FaGamepad } from 'react-icons/fa';

const FeaturesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Why Teachers <span className="text-purple-600">Love Fun Quiz</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create engaging, educational experiences that boost student participation and learning outcomes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FaBolt className="text-3xl text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Lightning Fast Setup</h3>
            <p className="text-gray-600 mb-6">Create professional quizzes in under 2 minutes. Our AI suggests questions based on your topic!</p>
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 h-1 w-12 rounded-full"></div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FaChartLine className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Real-Time Insights</h3>
            <p className="text-gray-600 mb-6">Watch student understanding unfold live. Identify learning gaps instantly and adapt on the fly.</p>
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 w-12 rounded-full"></div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FaGamepad className="text-3xl text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Gamified Learning</h3>
            <p className="text-gray-600 mb-6">Turn any lesson into an exciting game. Leaderboards, points, and achievements keep students engaged.</p>
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-1 w-12 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;