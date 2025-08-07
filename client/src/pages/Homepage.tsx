import React from 'react';
import { FaPlus, FaHistory, FaChartLine } from 'react-icons/fa';

const Homepage = () => {
  return (
    <div className="min-h-screen font-sans text-white relative">
      <div className="flex justify-between items-center p-4 bg-white text-black shadow-md">
        <div className="flex items-center space-x-2">
          <img src="./image/logo.png" alt="Fun Quiz" className="h-15" />
        </div>
        <button
        className="text-white px-4 py-2 rounded hover:opacity-90 transition"
        style={{ backgroundColor: '#A24FF6' }}
        >
        Login/Sign up
        </button>

      </div>

      <div
        className="flex flex-col items-center justify-center text-center px-4 py-50 bg-cover bg-center bg-no-repeat w-full"
        style={{
            backgroundImage: "url('./image/background.jpg')",
            backgroundColor: '#A24FF6', // fallback in case image doesn't load
            backgroundSize: 'cover', // ensures the image covers the whole area
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
        }}
        >
        <h1 className="text-5xl font-extrabold mb-6">Fun Quiz</h1>
        <p className="max-w-2xl text-lg mb-12">
          Fun Quiz brings your classroom to life with exciting whole-class quiz games, smart adaptive quizzes tailored to each student’s level, and instant feedback to track progress.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="flex items-center gap-2 bg-orange-400 text-white font-semibold px-6 py-3 rounded hover:bg-orange-500 transition">
            <FaPlus /> Create Quiz
          </button>
          <button className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded hover:bg-purple-500 transition" style={{ backgroundColor: '#A24FF6' }}>
            <FaHistory /> Check History
          </button>
          <button className="flex items-center gap-2 bg-red-400 text-white font-semibold px-10 py-3 rounded hover:bg-red-500 transition">
            <FaChartLine /> Report
          </button>
          <button className="bg-blue-600 text-white font-semibold px-10 py-3 rounded hover:bg-blue-700 transition">
            Enter code
          </button>
        </div>
      </div>
      <div className=''>

      </div>
    </div>
  );
};

export default Homepage;
