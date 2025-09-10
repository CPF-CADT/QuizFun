import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Loader,
  ShieldAlert,
  Crown,
  Home,
  Trophy,
  Medal,
} from "lucide-react";
import { PerformanceDetailModal } from "../components/PerformanceDetailModal";
import { ExcelExportButton } from "../components/ui/ExcelExportButton";
import { gameApi, type ResultsPayload } from "../service/gameApi";
import type { PlayerIdentifier } from "../hook/usePerformanceData";
import { useAuth } from "../context/AuthContext";

type LeaderboardPlayer = ResultsPayload["results"][0];

const ResultPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessionResults, setSessionResults] = useState<ResultsPayload | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerIdentifier | null>(
    null
  );

  useEffect(() => {
    if (!sessionId || !user) {
      setIsLoading(!!user);
      return;
    }

    setIsLoading(true);
    setError(null);

    gameApi
      .getSessionResults(sessionId, { userId: user._id, view: "summary" })
      .then((res) => {
        setSessionResults(res.data);
      })
      .catch((err) => {
        console.error("Failed to load session results", err);
        setError("Could not load results.");
      })
      .finally(() => setIsLoading(false));
  }, [sessionId, user]);

  const sortedResults = useMemo(() => {
    if (!sessionResults?.results) return [];
    return [...sessionResults.results].sort((a, b) => b.score - a.score);
  }, [sessionResults]);

  const handleViewDetails = (player: LeaderboardPlayer) => {
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (player.participantId && isValidObjectId(player.participantId)) {
      setSelectedPlayer({ userId: player.participantId });
    } else {
      setSelectedPlayer({ guestName: player.name });
    }
    setModalOpen(true);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="text-gray-500 font-semibold w-5 h-5 flex items-center justify-center">
            {index + 1}
          </span>
        );
    }
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-yellow-50 border-l-4 border-yellow-400";
    if (index === 1) return "bg-gray-50 border-l-4 border-gray-400";
    if (index === 2) return "bg-amber-50 border-l-4 border-amber-400";
    return "bg-white border-l-4 border-gray-200";
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="text-sm font-semibold text-yellow-600 px-2 py-0.5 rounded-full bg-yellow-100">
            Champion
          </span>
        );
      case 1:
        return (
          <span className="text-sm font-semibold text-gray-600 px-2 py-0.5 rounded-full bg-gray-100">
            Runner-Up
          </span>
        );
      case 2:
        return (
          <span className="text-sm font-semibold text-amber-600 px-2 py-0.5 rounded-full bg-amber-100">
            Third Place
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-gray-700">
          <Loader className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-lg font-semibold">Loading Final Results...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionResults) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-sm">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">
            {error || "The requested session could not be found."}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Home size={16} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isHost = sessionResults.viewType === "host";

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isHost ? "Final Rankings" : "Your Results"}
          </h1>
          <p className="text-gray-500 text-sm">
            Quiz completed on{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-700">Leaderboard</h2>
            {isHost && sessionId && (
              <ExcelExportButton
                type="session"
                sessionId={sessionId}
                buttonText="Export"
                buttonClass="flex items-center gap-2 text-sm text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                showOptions={true} // The showOptions prop manages the dropdown visibility
                // The ExcelExportButton component should now handle its own state and positioning
              />
            )}
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {sortedResults.length > 0 ? (
              sortedResults.map((player, index) => (
                <div
                  key={player.participantId || player.name}
                  className={`flex items-center justify-between p-4 rounded-lg shadow-sm transition-shadow duration-200 hover:shadow-md ${getRankStyle(
                    index
                  )}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {player.name}
                        </span>
                        {getRankBadge(index)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {player.score.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetails(player)}
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors"
                    aria-label={`View details for ${player.name}`}
                  >
                    <Eye size={18} />
                    <span className="font-medium text-sm">Details</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Trophy className="w-10 h-10 mx-auto mb-3" />
                <p>No results available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPlayer && sessionId && (
        <PerformanceDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPlayer(null);
          }}
          sessionId={sessionId}
          playerIdentifier={selectedPlayer}
        />
      )}
    </div>
  );
};

export default ResultPage;
