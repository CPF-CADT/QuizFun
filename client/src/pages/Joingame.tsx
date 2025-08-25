import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import { useAuth } from "../context/AuthContext";
import { useQuizGame } from "../context/GameContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaArrowLeft,FaStar,FaLightbulb,FaTrophy,FaRocket,FaPlay,FaUsers, FaArrowRight, FaCrown  } from "react-icons/fa";
// Helper function to generate a unique ID for guest users
const generateGuestId = () => `guest_${Math.random().toString(36).substring(2, 10)}`;
const Joingame: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { joinRoom, gameState } = useQuizGame();
  const [searchParams] = useSearchParams(); // Hook to read URL query params

  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // This effect runs when the component loads to handle the URL parameter
  useEffect(() => {
    const roomCodeFromUrl = searchParams.get("joinRoomCode");

    if (roomCodeFromUrl) {
      // 1. Pre-fill the game pin input from the URL
      setGamePin(roomCodeFromUrl);

      // 2. If the user is already logged in, join the game automatically
      if (isAuthenticated && user) {
        setIsLoading(true);
        const joinData = {
          roomId: parseInt(roomCodeFromUrl),
          username: user.name,
          userId: user._id,
        };
        console.log("Authenticated user detected. Auto-joining with data:", joinData);
        joinRoom(joinData);
      }
    }
  }, [searchParams, isAuthenticated, user, joinRoom]);


  // This function handles the form submission for guests or manual entries
  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isAuthenticated && !playerName) || !gamePin) return;

    setIsLoading(true);

    const joinData = {
      roomId: parseInt(gamePin),
      username: isAuthenticated ? user!.name : playerName,
      userId: isAuthenticated ? user!._id : generateGuestId(),
    };

    console.log("Attempting to join manually with data:", joinData);
    joinRoom(joinData);
  };

  // If a server error occurs, stop the loading indicator
  useEffect(() => {
    if (gameState.error) {
      setIsLoading(false);
    }
  }, [gameState.error]);

  return (
<div 
  className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
  style={{ 
    background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 25%, #C084FC 50%, #9b92c6ff 75%, #8B5CF6 100%)',
  }}
>
  {/* Floating Game Elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-16 animate-bounce opacity-30" style={{ animationDelay: '0s' }}>
      <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4 shadow-lg">
        <FaStar className="text-2xl text-white" />
      </div>
    </div>
    <div className="absolute top-40 right-20 animate-bounce opacity-25" style={{ animationDelay: '1s' }}>
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-4 shadow-lg">
        <FaLightbulb className="text-2xl text-white" />
      </div>
    </div>
    <div className="absolute bottom-32 left-12 animate-bounce opacity-30" style={{ animationDelay: '2s' }}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 shadow-lg">
        <FaTrophy className="text-2xl text-white" />
      </div>
    </div>
    <div className="absolute bottom-16 right-16 animate-bounce opacity-25" style={{ animationDelay: '3s' }}>
      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full p-4 shadow-lg">
        <FaRocket className="text-2xl text-white" />
      </div>
    </div>
    <div className="absolute top-1/2 left-8 animate-bounce opacity-20" style={{ animationDelay: '1.5s' }}>
      <div className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full p-3 shadow-lg">
        <FaCrown className="text-lg text-white" />
      </div>
    </div>
    <div className="absolute top-3/4 right-8 animate-bounce opacity-25" style={{ animationDelay: '2.5s' }}>
      <div className="bg-gradient-to-r from-pink-400 to-red-500 rounded-full p-3 shadow-lg">
        <FaPlay className="text-lg text-white" />
      </div>
    </div>
  </div>

  {/* Back Button */}
  <button 
    onClick={() => navigate('/')}
    className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 hover:scale-105 z-20"
  >
    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
      <FaArrowLeft />
    </div>
    <span className="hidden sm:inline font-medium">Back to Home</span>
  </button>

  {/* Rest of your content goes here... */}
      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-purple-600/90 via-purple-500/90 to-indigo-800/90 
                backdrop-blur-xl w-full max-w-md mx-4 p-8 rounded-3xl shadow-2xl 
                border border-white/20 relative z-10 transform hover:scale-[1.02] 
                transition-all duration-300">
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            ></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="relative inline-block mb-6">
                <Link to="/">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-all duration-300 bg-white">
                  <img src="/image/logo1.png" alt="Logo" className="w-22 h-22" />
                </div>
                </Link>
                {/* Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full "></div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                <div className="absolute top-1 -right-4 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="text-5xl font-black mb-3 text-white">
                Join the Fun!
              </h1>
              <p className="text-gray-300 text-xl font-medium">Enter game details to start your adventure</p>
              
              {/* Decorative Line */}
              <div className="flex items-center justify-center mt-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-24"></div>
                <div className="mx-4 text-2xl"></div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-24"></div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-8">
              {/* Game PIN */}
              <div>
                <label className="block text-sm font-bold mb-4 text-white uppercase tracking-wider">
                  Game PIN
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={gamePin}
                    onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter PIN"
                    className="w-full px-6 py-6 rounded-2xl text-gray-800 text-center text-3xl font-black tracking-[0.3em] bg-gray-50 outline-none focus:ring-4 focus:ring-purple-300/50 transition-all duration-300 border-2 border-gray-200 focus:border-purple-400 focus:bg-white shadow-lg"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-indigo-100/50 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Player Name */}
              {!isAuthenticated && (
                <div>
                  <label className="block text-sm font-bold mb-4 text-white uppercase tracking-wider">
                    Your Nickname
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your awesome name"
                      className="w-full px-6 py-6 rounded-2xl text-gray-800 text-center text-2xl font-bold bg-gray-50 outline-none focus:ring-4 focus:ring-cyan-300/50 transition-all duration-300 border-2 border-gray-200 focus:border-cyan-400 focus:bg-white shadow-lg"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-100/50 via-teal-100/50 to-emerald-100/50 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              )}

              {/* Join Button */}
              <button
                onClick={handleManualJoin}
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-black py-6 px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl active:scale-95 group"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                
                <div className="relative flex items-center justify-center space-x-4">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-7 w-7 border-4 border-white border-t-transparent"></div>
                      <span className="text-xl font-bold">Joining Game...</span>
                    </>
                  ) : (
                    <>
                      <FaUsers className="text-2xl group-hover:animate-pulse" />
                      <span className="text-2xl font-black tracking-wide">JOIN GAME</span>
                      <FaArrowRight className="text-xl group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Bottom Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-white text-sm font-medium">
                 <span className="text-purple-900 font-bold">Pro Tip:</span> Get ready for some brain-teasing challenges!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Joingame;