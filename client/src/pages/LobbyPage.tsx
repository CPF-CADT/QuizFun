import React from "react";
import { FaUsers, FaCrown, FaHourglassHalf, FaHome, FaQuestionCircle, FaGamepad } from "react-icons/fa";

interface Player {
  id: string;
  name: string;
  isHost?: boolean;
}

interface LobbyPageProps {
  gamePin: string;
  players: Player[];
  hostName: string;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ gamePin, players, hostName }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-md text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <FaGamepad className="h-10 w-10 text-white" />
          <span className="text-2xl font-bold hidden sm:block">Fun Quiz</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-all" style={{ backgroundColor: "#A24FF6" }}>
            <FaQuestionCircle />
            <span className="hidden sm:inline">Help</span>
          </button>
          <button onClick={() => (window.location.href = "/")} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all" style={{ backgroundColor: "#A24FF6" }}>
            <FaHome />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>

      {/* Lobby Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
            
            {/* Lobby Info */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse">
              <FaUsers className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">You're in the Lobby!</h1>
            <p className="text-white/80 text-lg">Waiting for the game to begin...</p>

            <div className="mt-6 flex justify-around text-center">
              <div className="bg-white/10 p-4 rounded-xl flex-1 mx-2">
                <span className="block text-sm font-semibold text-white/90 mb-1">Game PIN</span>
                <p className="text-3xl font-bold tracking-wider">{gamePin}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl flex-1 mx-2">
                <span className="block text-sm font-semibold text-white/90 mb-1">Host</span>
                <p className="text-xl font-bold flex items-center justify-center">
                  <FaCrown className="mr-2 text-yellow-400" />
                  {hostName}
                </p>
              </div>
            </div>

            {/* Player List */}
            <div className="mt-8 bg-white/10 p-4 rounded-xl max-h-64 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-white">Players in Lobby ({players.length})</h2>
              <ul className="space-y-3 text-left">
                {players.map((player) => (
                  <li key={player.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaUsers className="text-blue-300" />
                      <span className="font-medium text-lg">{player.name}</span>
                    </div>
                    {player.isHost && <span className="text-xs text-yellow-300 bg-white/10 px-2 py-1 rounded-full">Host</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* Waiting Indicator */}
            <div className="mt-8 flex items-center justify-center space-x-2 text-xl font-semibold">
              <FaHourglassHalf className="animate-pulse text-yellow-300" />
              <span>Waiting for game to start...</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
