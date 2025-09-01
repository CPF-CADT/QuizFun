// src/components/game/PerformanceDetailModal.tsx
import React, { useEffect, useState } from "react";
import {
  usePerformanceData,
  type PlayerIdentifier,
} from "../hook/usePerformanceData";
import { PerformanceView } from "./ui/PerformanceView";
import { gameApi } from "../service/gameApi";

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  playerIdentifier: PlayerIdentifier | null;
}

export const PerformanceDetailModal: React.FC<PerformanceModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  playerIdentifier,
}) => {
  const { loading, error, player, performance, summary } = usePerformanceData(
    sessionId,
    playerIdentifier
  );

  const [quizId, setQuizId] = useState<string>("");

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await gameApi.getSessionDetails(sessionId);
        if (response?.data?.quizId) {
          setQuizId(response.data.quizId);
        }
      } catch (err) {
        console.error("Failed to fetch session details:", err);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-7xl h-[90vh] bg-slate-900 text-gray-200 border border-purple-800 rounded-2xl shadow-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h1 className="text-3xl font-bold text-white">Performance Review</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {error && <p className="text-red-400 text-center text-lg">{error}</p>}

          {!loading && !error && (
            <PerformanceView
              player={player}
              performance={performance}
              summary={summary}
              defaultQuizzId={quizId}
            />
          )}
        </main>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};
