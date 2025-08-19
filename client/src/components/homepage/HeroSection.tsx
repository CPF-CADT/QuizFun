import React from 'react';
import { FaPlus, FaHistory, FaChartLine, FaStar, FaUsers, FaTrophy, FaGamepad } from 'react-icons/fa';

interface HeroSectionProps {
  handleProtectedRoute: (path: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ handleProtectedRoute }) => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-4 py-20 bg-cover bg-center bg-no-repeat w-full relative min-h-screen"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundColor: '#A24FF6',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/50 to-purple-800/70"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="inline-flex items-center bg-yellow-400 text-purple-900 px-4 py-2 rounded-full font-bold text-sm mb-6 animate-bounce">
          <FaStar className="mr-2" />
          #1 Quiz Platform for Educators
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent leading-tight">
          Fun Quiz
        </h1>
        
        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white drop-shadow-lg">
          🚀 Get Started in Minutes,<br />
          <span className="text-yellow-300">See Amazing Results Today!</span>
        </h2>

        <p className="max-w-3xl text-xl md:text-2xl mb-12 text-gray-100 leading-relaxed">
          Transform your classroom with <span className="text-yellow-300 font-bold">engaging quiz games</span>, 
          smart adaptive learning, and instant progress tracking that students absolutely love!
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button onClick={() => handleProtectedRoute("/create-quiz")}
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold px-8 py-4 rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all transform hover:scale-110 shadow-2xl border border-emerald-300">
            <FaPlus className="group-hover:rotate-90 transition-transform" /> Create Quiz
          </button>
          <button onClick={() => handleProtectedRoute("/history")}
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-110 shadow-2xl border border-indigo-400">
            <FaHistory className="group-hover:rotate-12 transition-transform" /> Check History
          </button>
          <button onClick={() => handleProtectedRoute("/Dashboard")}
            className="group flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold px-8 py-4 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-110 shadow-2xl border border-pink-400">
            <FaChartLine className="group-hover:bounce transition-transform" /> Reports
          </button>
          <button className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-110 shadow-2xl border border-cyan-400"
            onClick={() => (window.location.href = "/join")}>
            <FaGamepad className="inline mr-2 group-hover:rotate-12 transition-transform" /> Enter Code
          </button>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 text-center">
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <FaUsers className="text-blue-300 mr-2" />
            <span className="font-bold">50K+</span>
            <span className="ml-1 text-gray-300">Teachers</span>
          </div>
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <FaTrophy className="text-yellow-300 mr-2" />
            <span className="font-bold">2M+</span>
            <span className="ml-1 text-gray-300">Quizzes</span>
          </div>
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <FaStar className="text-orange-300 mr-2" />
            <span className="font-bold">4.9/5</span>
            <span className="ml-1 text-gray-300">Rating</span>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[5%] left-[5%] text-yellow-300 text-4xl opacity-70 animate-pulse">✨</div>
        <div className="absolute top-[10%] right-[10%] text-purple-300 text-5xl opacity-70 animate-spin">🌟</div>
        <div className="absolute top-[25%] left-[15%] text-white text-4xl sm:text-6xl opacity-70 animate-bounce">🎉</div>
        <div className="absolute top-[30%] right-[15%] text-teal-300 text-3xl sm:text-4xl opacity-60 animate-bounce">📚</div>
        <div className="absolute top-[50%] left-[5%] text-lime-300 text-3xl opacity-70 animate-bounce">🧠</div>
        <div className="absolute top-[50%] right-[5%] text-pink-400 text-4xl sm:text-5xl opacity-80 animate-pulse">💖</div>
        <div className="absolute bottom-[15%] left-[20%] text-blue-300 text-3xl opacity-70 animate-pulse">⚡</div>
        <div className="absolute bottom-[15%] right-[20%] text-yellow-200 text-3xl opacity-70 animate-bounce">🎵</div>
        <div className="absolute bottom-[5%] left-[10%] text-red-300 text-3xl sm:text-4xl opacity-70 animate-pulse">💡</div>
        <div className="absolute bottom-[5%] right-[10%] text-blue-400 text-4xl opacity-80 animate-pulse">🎨</div>
      </div>
    </div>
  );
};

export default HeroSection;