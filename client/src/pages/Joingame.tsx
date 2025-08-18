import React, { useState } from "react";
import { FaGamepad, FaUsers, FaArrowRight, FaHome, FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Joingame: React.FC = () => {
  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinGame = () => {
    if (gamePin && playerName) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);

        // Navigate to Lobby and pass data
        navigate("/lobby", {
          state: {
            gamePin,
            hostName: "Quiz Master", // Example host name
            players: [
              { id: "1", name: playerName }, // Current player
              { id: "2", name: "Player2" },  // Demo player
            ],
          },
        });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-md text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src="./image/logo.png" alt="Fun Quiz" className="h-12" />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-all" style={{ backgroundColor: "#A24FF6" }}>
            <FaQuestionCircle />
            <span className="hidden sm:inline">Help</span>
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all" style={{ backgroundColor: "#A24FF6" }}
          >
            <FaHome />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse">
                <FaGamepad className="text-3xl text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Join the Fun!</h1>
              <p className="text-white/80 text-lg">Enter your game details to start playing</p>
            </div>

            {/* Game PIN */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-white/90">
                Game PIN
              </label>
              <input
                type="text"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value.replace(/\D/g, "").slice(0, 7))}
                placeholder="Enter 6-7 digit PIN"
                className="w-full px-4 py-4 rounded-xl text-gray-800 text-center text-2xl font-bold tracking-wider bg-white/95 outline-none focus:ring-4 focus:ring-yellow-400"
                maxLength={7}
              />
            </div>

            {/* Player Name */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2 text-white/90">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                placeholder="Enter your nickname"
                className="w-full px-4 py-4 rounded-xl text-gray-800 text-center text-2xl font-bold tracking-wider bg-white/95 outline-none focus:ring-4 focus:ring-blue-400"
                maxLength={20}
              />
              <p className="text-white/60 text-xs mt-1">{playerName.length}/20 characters</p>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinGame}
              disabled={!gamePin || gamePin.length < 6 || !playerName || isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Joingame;
