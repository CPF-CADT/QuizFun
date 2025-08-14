import React, { useState } from 'react';
import { FaGamepad, FaUsers, FaArrowRight, FaHome, FaQuestionCircle } from 'react-icons/fa';

const Joingame: React.FC = () => {
  const [gamePin, setGamePin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinGame = () => {
    if (gamePin && playerName) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        console.log('Joining game with pin:', gamePin, 'and name:', playerName);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-orange-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-40 w-12 h-12 bg-teal-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-60 right-60 w-14 h-14 bg-rose-300 rounded-full opacity-20 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white backdrop-blur-md text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src="./image/logo.png" alt="Fun Quiz" className="h-12" />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg  hover:opacity-90 transition-all transform hover:scale-105 shadow-lg" style={{ backgroundColor: "#A24FF6" }}>
            <FaQuestionCircle />
            <span className="hidden sm:inline">Help</span>
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg " style={{ backgroundColor: "#A24FF6" }}
          >
            <FaHome />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md relative z-10">
          {/* Welcome Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Icon and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse">
                <FaGamepad className="text-3xl text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Join the Fun!</h1>
              <p className="text-white/80 text-lg">Enter your game details to start playing</p>
            </div>

            {/* Game Pin Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-white/90">
                Game PIN
              </label>
              <input
                type="text"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value.replace(/\D/g, '').slice(0, 7))}
                placeholder="Enter 6 digit PIN"
                className="w-full px-4 py-4 rounded-xl text-gray-800 text-center text-2xl font-bold tracking-wider bg-white/95 backdrop-blur-sm outline-none focus:ring-4 focus:ring-yellow-400 focus:bg-white transition-all placeholder-gray-400"
                maxLength={7}
              />
              {/* {gamePin && gamePin.length < 6 && (
                <p className="text-yellow-300 text-sm mt-2 flex items-center">
                  <FaQuestionCircle className="mr-1" />
                  PIN should be 6-7 digits
                </p>
              )} */}
            </div>

            {/* Player Name Input */}
            {/* <div className="mb-8">
              <label className="block text-sm font-semibold mb-2 text-white/90">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                placeholder="Enter your nickname"
                className="w-full px-4 py-3 rounded-xl text-gray-800 bg-white/95 backdrop-blur-sm outline-none focus:ring-4 focus:ring-blue-400 focus:bg-white transition-all placeholder-gray-400"
                maxLength={20}
              />
              <p className="text-white/60 text-xs mt-1">
                {playerName.length}/20 characters
              </p>
            </div> */}

            {/* Join Button */}
            <button
              onClick={handleJoinGame}
              disabled={!gamePin || gamePin.length < 6 || !playerName || isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Joining Game...</span>
                </>
              ) : (
                <>
                  <FaUsers />
                  <span>Join Game</span>
                  <FaArrowRight />
                </>
              )}
            </button>

            {/* Additional Info */}
            {/* <div className="mt-6 text-center">
              <p className="text-white/70 text-sm mb-2">
                Don't have a game PIN?
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="text-yellow-300 hover:text-yellow-200 font-semibold underline transition-colors"
              >
                Create your own quiz
              </button>
            </div> */}
          </div>

          {/* Tips Card */}
          <div className="mt-6 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="font-bold mb-3 flex items-center">
              <FaQuestionCircle className="mr-2 text-yellow-300" />
              Quick Tips
            </h3>
            <ul className="text-sm text-white/80 space-y-2">
              <li>• Ask your teacher/host for the game PIN</li>
              <li>• Use a fun nickname that's appropriate</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• Get ready to have fun learning!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Terms & Privacy */}
      <div className="text-center py-6 px-4 bg-black/20">
        <p className="text-sm text-white/70">
          By joining, you accept our{' '}
          <a href="#" className="text-blue-300 hover:text-blue-200 underline transition-colors">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-300 hover:text-blue-200 underline transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Floating decorative emojis */}
      <div className="absolute top-24 left-16 text-4xl opacity-60 animate-bounce">🎮</div>
      <div className="absolute top-32 right-24 text-3xl opacity-60 animate-pulse">🎯</div>
      <div className="absolute bottom-32 left-12 text-4xl opacity-60 animate-bounce">🏆</div>
      <div className="absolute bottom-24 right-16 text-3xl opacity-60 animate-pulse">⭐</div>
      <div className="absolute top-48 left-1/2 text-2xl opacity-60 animate-bounce">🎉</div>
    </div>
  );
};

export default Joingame;