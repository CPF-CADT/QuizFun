import React, { useEffect, useState, useMemo } from "react";
import type { ResultsPayload } from "../../context/GameContext";
import type { PlayerIdentifier } from "../../pages/GamePage";
import { Trophy, Crown } from "lucide-react";
import { ExcelExportButton } from "../ui/ExcelExportButton";

interface GameResultDetailsProps {
  payload: ResultsPayload;
  yourUserId: string;
  sessionId?: string;
  onExit: () => void;
  setSelectedPlayer: (player: PlayerIdentifier | null) => void;
  isHost: boolean;
}

export const GameResultDetails: React.FC<GameResultDetailsProps> = ({
  payload,
  yourUserId,
  sessionId,
  onExit,
  setSelectedPlayer,
  isHost,
}) => {
  const { results } = payload;
  const [revealedPlayers, setRevealedPlayers] = useState<number[]>([]);

  const visibleResults = useMemo(() => {
    if (isHost) {
      return [...results].sort((a, b) => b.score - a.score);
    }
    return results.filter((r) => r.participantId === yourUserId);
  }, [results, isHost, yourUserId]);

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      visibleResults.forEach((_, index) => {
        setTimeout(() => {
          setRevealedPlayers((prev) => [...prev, index]);
        }, index * 200);
      });
    }, 500);

    return () => clearTimeout(revealTimer);
  }, [visibleResults]);

  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  const handleViewDetails = (player: {
    participantId?: string;
    name: string;
  }) => {
    const isGuest = !isValidObjectId(player.participantId || "");
    if (isGuest) {
      setSelectedPlayer({ guestName: player.name });
    } else if (player.participantId) {
      setSelectedPlayer({ userId: player.participantId });
    }
  };

  const getPodiumClass = (index: number) => {
    if (!isHost)
      return "bg-gradient-to-t from-indigo-500 to-purple-500 border-purple-400 text-white"; // Special style for single player view
    switch (index) {
      case 0:
        return "bg-gradient-to-t from-yellow-500 to-yellow-300 border-yellow-400 text-yellow-900";
      case 1:
        return "bg-gradient-to-t from-gray-400 to-gray-200 border-gray-300 text-gray-800";
      case 2:
        return "bg-gradient-to-t from-orange-500 to-orange-300 border-orange-400 text-orange-900";
      default:
        return "bg-gray-700/50 border-gray-600";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 text-white relative overflow-hidden flex flex-col h-full">
      <div className="relative z-10 flex-grow flex flex-col">
        {/* Updated Header with Export Button */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            {isHost ? "Final Rankings" : "Your Result"}
          </h1>
          {isHost && sessionId && (
            <div className="flex-shrink-0">
              <ExcelExportButton
                type="session"
                sessionId={sessionId}
                buttonText="Export"
                buttonClass="flex items-center gap-2 text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                showOptions={true}
              />
            </div>
          )}
        </header>

        {/* Podium for top 3 on larger screens (only for host) */}
        {isHost && (
          <div className="hidden md:flex justify-center items-end gap-4 mb-6">
            {visibleResults.slice(0, 3).map((p, index) => (
              <div
                key={p.name}
                className={`w-1/4 p-4 rounded-t-lg text-center flex flex-col items-center ${getPodiumClass(
                  index
                )}`}
                style={{
                  order: index === 1 ? 0 : index === 0 ? 1 : 2,
                  height: index === 0 ? "180px" : "150px",
                }}
              >
                <div className="text-2xl font-bold">
                  {index === 0 ? "👑" : `#${index + 1}`}
                </div>
                <div className="font-semibold truncate w-full">{p.name}</div>
                <div className="text-xl font-bold">{p.score} pts</div>
              </div>
            ))}
          </div>
        )}

        <ul className="space-y-3 flex-grow overflow-y-auto p-2">
          {visibleResults.map((p, index) => {
            const isRevealed = revealedPlayers.includes(index);
            const canViewDetails = isHost || p.participantId === yourUserId;
            return (
              <li
                key={p.name}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-500 ${
                  isRevealed
                    ? "opacity-100 transform-none"
                    : "opacity-0 translate-x-4"
                } ${getPodiumClass(index)}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {isHost && (
                    <div className="font-bold text-lg sm:text-xl w-8 text-center">
                      {index + 1}
                    </div>
                  )}
                  <div className="font-semibold text-base sm:text-lg truncate">
                    {p.name}
                  </div>
                  {index === 0 && isHost && (
                    <Crown className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-bold text-lg sm:text-xl">
                    {p.score} pts
                  </span>
                  {canViewDetails && (
                    <button
                      onClick={() => handleViewDetails(p)}
                      className="bg-blue-500/50 hover:bg-blue-500/80 text-white font-semibold px-3 py-1 rounded-md text-xs sm:text-sm transition-colors"
                    >
                      Details
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Removed Export Button from here */}
        <footer className="mt-6 space-y-3">
          <button
            onClick={onExit}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-transform duration-300 hover:scale-105 shadow-lg"
          >
            Exit Game
          </button>
        </footer>
      </div>
    </div>
  );
};