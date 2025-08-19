import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import { useAuth } from "../context/AuthContext";
import { useQuizGame } from "../context/GameContext";
import { FaUsers, FaArrowRight, FaGamepad } from "../components/common/Icons";

// Helper function to generate a unique ID for guest users
const generateGuestId = () => `guest_${Math.random().toString(36).substring(2, 10)}`;

const Joingame: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
              <FaGamepad className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Join the Fun!</h1>
            <p className="text-white/80 text-lg">Enter game details to start</p>
          </div>

          <form onSubmit={handleManualJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-left">Game PIN</label>
              <input
                type="text"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter PIN"
                className="w-full px-4 py-4 rounded-xl text-gray-800 text-center text-2xl font-bold tracking-wider bg-white/95 outline-none focus:ring-4 focus:ring-yellow-400"
                required
              />
            </div>

            {/* This input only shows if the user is NOT logged in */}
            {!isAuthenticated && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-left">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your nickname"
                  className="w-full px-4 py-4 rounded-xl text-gray-800 text-center text-2xl font-bold bg-white/95 outline-none focus:ring-4 focus:ring-blue-400"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 disabled:from-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-transform transform hover:scale-105"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <FaUsers />
                  <span>Join Game</span>
                  <FaArrowRight />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Joingame;