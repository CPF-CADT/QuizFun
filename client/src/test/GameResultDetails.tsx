import React, { useState } from 'react';
import type { ResultsPayload, FinalResultData, DetailedAnswer } from '../hook/useQuizGame';

// Bonus: A reusable component for visualizing stats with a progress bar
const StatBar: React.FC<{ label: string; value: number; max: number; unit: string; color: string }> = ({ label, value, max, unit, color }) => (
    <div>
        <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <span className="text-lg font-bold text-white">{value.toFixed(0)}{unit}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
            <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }}></div>
        </div>
    </div>
);

// A card to show a single answer's result
const AnswerCard: React.FC<{ answer: DetailedAnswer }> = ({ answer }) => (
    <div className={`p-3 rounded-lg border-l-4 ${answer.isUltimatelyCorrect ? 'bg-green-900/40 border-green-500' : 'bg-red-900/40 border-red-500'}`}>
        <p className="font-semibold text-white truncate">Q: {answer.questionId?.questionText || 'Question text not available'}</p>
    </div>
);

// This view shows the detailed stats for ONE selected participant
const ParticipantDetailView: React.FC<{ result: FinalResultData }> = ({ result }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-4xl font-extrabold text-white text-center">{result.name}</h2>
            <p className="text-center text-indigo-400 text-2xl font-bold">{result.score} Points</p>
        </div>
        <div className="bg-gray-700/50 p-6 rounded-xl space-y-5">
            <StatBar label="Correct Answers" value={result.percentage} max={100} unit="%" color="bg-green-500" />
            <StatBar label="Avg. Correct Answer Time" value={result.averageTime} max={10} unit="s" color="bg-blue-500" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-3">Answer Breakdown</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {result.detailedAnswers?.map(ans => <AnswerCard key={ans._id} answer={ans} />)}
            </div>
        </div>
    </div>
);

// This is the main component that decides what to show
export const GameResultDetails: React.FC<{ payload: ResultsPayload; onExit: () => void }> = ({ payload, onExit }) => {
    const { viewType, results } = payload;
    const [selectedParticipant, setSelectedParticipant] = useState<FinalResultData | null>(
        // If not a host, pre-select the first (and only) result. Otherwise, start at the ranking view.
        viewType !== 'host' ? results[0] : null
    );

    // Host View: Show the ranking first
    if (viewType === 'host' && !selectedParticipant) {
        return (
            <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl text-white">
                <h1 className="text-3xl font-bold text-center mb-6">Game Results & Ranking</h1>
                <ul className="space-y-3">
                    {results.map((p, index) => (
                        <li key={p.participantId || p.name} onClick={() => setSelectedParticipant(p)}
                            className="flex items-center justify-between bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                            <div className="flex items-center space-x-4">
                                <span className={`text-xl font-bold w-8 text-center ${index === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>#{index + 1}</span>
                                <span className="text-lg font-medium text-white">{p.name}</span>
                            </div>
                            <span className="text-xl font-bold text-indigo-400">{p.score} pts</span>
                        </li>
                    ))}
                </ul>
                <button onClick={onExit} className="w-full bg-gray-600 font-bold py-2 px-4 rounded-md hover:bg-gray-500 mt-6">Exit to Menu</button>
            </div>
        );
    }

    // Player/Guest/Selected Host View: Show the detailed stats
    if (selectedParticipant) {
        return (
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl text-white">
                {viewType === 'host' && (
                    <button onClick={() => setSelectedParticipant(null)} className="text-indigo-400 hover:text-indigo-300 mb-4 font-semibold">&larr; Back to Ranking</button>
                )}
                <ParticipantDetailView result={selectedParticipant} />
                {viewType !== 'host' && (
                    <button onClick={onExit} className="w-full bg-gray-600 font-bold py-2 px-4 rounded-md hover:bg-gray-500 mt-6">Exit to Menu</button>
                )}
            </div>
        );
    }

    return <div className="text-white text-xl">Loading results...</div>;
};