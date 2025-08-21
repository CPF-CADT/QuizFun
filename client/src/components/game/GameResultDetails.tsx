import React, { useMemo } from 'react';
import type { ResultsPayload } from '../../context/GameContext';
import type { PlayerIdentifier } from '../../pages/GamePage';

interface GameResultDetailsProps {
    payload: ResultsPayload;
    sessionId: string;
    yourUserId: string;
    onExit: () => void;
    setSelectedPlayer: (player: PlayerIdentifier | null) => void;
}

export const GameResultDetails: React.FC<GameResultDetailsProps> = ({ payload, sessionId, yourUserId, onExit, setSelectedPlayer }) => {
    const { viewType, results } = payload;
    const sortedResults = useMemo(() => [...results].sort((a, b) => b.score - a.score), [results]);

    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    const handleViewDetails = (player: { participantId?: string; name: string }) => {
        const isGuest = !isValidObjectId(player.participantId || ' ');
        if (isGuest) {
            setSelectedPlayer({ guestName: player.name });
        } else {
            if (!player.participantId) return;
            setSelectedPlayer({ userId: player.participantId });
        }
    };

    return (
        <div className="w-full max-w-2xl p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white">
            <h1 className="text-3xl font-bold text-center mb-6">Final Rankings</h1>
            <ul className="space-y-3 mb-6 max-h-96 overflow-y-auto p-2 bg-black/20 rounded-lg">
                {sortedResults.map((p, index) => {
                    const canViewDetails = viewType === 'host' || p.participantId === yourUserId;
                    return (
                        <li key={p.name} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <span className={`text-xl font-bold w-8 text-center ${index === 0 ? 'text-yellow-300' : 'text-gray-400'}`}>#{index + 1}</span>
                                <span className="text-lg font-medium">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-xl font-bold text-indigo-400">{p.score} pts</span>
                               {canViewDetails && (
                                  <button
                                    onClick={() => handleViewDetails(p)}
                                    className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    Details
                                  </button>
                               )}
                            </div>
                        </li>
                    );
                })}
            </ul>
            <button onClick={onExit} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700">Exit</button>
        </div>
    );
};