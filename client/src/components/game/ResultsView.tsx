import React, { useMemo } from "react";
import type { GameState } from "../../context/GameContext";
import { Trophy, Crown, Medal } from "lucide-react";

interface ResultsViewProps {
  gameState: GameState;
  onNextQuestion: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ gameState, onNextQuestion }) => {
  const { question, participants, yourUserId, answerCounts } = gameState;
  const me = participants.find((p) => p.user_id === yourUserId);
  const isHost = me?.role === "host";
  const sortedPlayers = useMemo(
    () =>
      [...participants]
        .filter((p) => p.role === "player")
        .sort((a, b) => b.score - a.score),
    [participants]
  );

  if (!question) return null;

  const getResultStyle = (index: number) => {
    if (index === question.correctAnswerIndex)
      return "bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/50";
    if (
      !isHost &&
      question.yourAnswer &&
      index === question.yourAnswer.optionIndex &&
      !question.yourAnswer.wasCorrect
    )
      return "bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/40";
    return "bg-gray-700 border border-gray-600";
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400 inline-block mr-2" size={20} />;
    if (rank === 2) return <Medal className="text-gray-300 inline-block mr-2" size={20} />;
    if (rank === 3) return <Medal className="text-orange-400 inline-block mr-2" size={20} />;
    return null;
  };

  return (
    <div className="w-full max-w-4xl p-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl border border-white/10 text-white text-center">
      <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 animate-pulse">
        🎉 Round Over!
      </h1>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {question.options.map((opt, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl text-lg font-semibold text-left relative transition-all duration-300 hover:scale-105 ${getResultStyle(
              index
            )}`}
          >
            <span>{opt.text}</span>
            <span className="absolute top-2 right-2 font-bold text-sm bg-black/50 px-3 py-1 rounded-full shadow-md">
              {answerCounts?.[index] || 0} votes
            </span>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
        <Trophy className="text-yellow-400" /> Leaderboard
      </h2>
      <ul className="space-y-3 mb-10 max-h-64 overflow-y-auto p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
        {sortedPlayers.map((p, i) => (
          <li
            key={p.user_id}
            className={`flex justify-between items-center p-4 rounded-lg text-lg font-medium shadow-md transition-all duration-300 ${
              i === 0
                ? "bg-yellow-500/20 border border-yellow-400"
                : i === 1
                ? "bg-gray-400/20 border border-gray-300"
                : i === 2
                ? "bg-orange-400/20 border border-orange-400"
                : "bg-gray-700/40 border border-gray-600"
            }`}
          >
            <span>
              {getMedalIcon(i + 1)} #{i + 1} {p.user_name}
            </span>
            <span className="font-bold">{p.score} pts</span>
          </li>
        ))}
      </ul>

      {/* Host Button */}
      {isHost && (
        <button
          onClick={onNextQuestion}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
        >
          Next Question →
        </button>
      )}
    </div>
  );
};
