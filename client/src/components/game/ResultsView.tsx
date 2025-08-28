import React, { useMemo } from "react";
import type { GameState } from "../../context/GameContext";


interface ResultsViewProps {
  gameState: GameState;
  onNextQuestion: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ gameState, onNextQuestion }) => {
    const { question, participants, yourUserId, answerCounts } = gameState;
    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    const sortedPlayers = useMemo(() => [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score), [participants]);

  if (!question) return null;

    const getResultStyle = (index: number) => {
        if (index === question.correctAnswerIndex) return 'bg-green-500 ring-4 ring-white';
        if (!isHost && question.yourAnswer && index === question.yourAnswer.optionIndex && !question.yourAnswer.wasCorrect) return 'bg-red-500';
        return 'bg-gray-700';
    };

    return (
        <div className="w-full max-w-3xl p-8 bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Round Over!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {question.options.map((opt, index) => (
                    <div key={index} className={`p-4 rounded-lg text-lg text-left relative ${getResultStyle(index)}`}>
                        <span>{opt.text}</span>
                        <span className="font-bold float-right bg-black/30 px-2 rounded">{answerCounts?.[index] || 0}</span>
                    </div>
                ))}
            </div>
            <h2 className="text-2xl font-semibold mb-3">Leaderboard</h2>
            <ul className="space-y-2 mb-8 max-h-48 overflow-y-auto p-2 bg-black/20 rounded-lg">
                {sortedPlayers.map((p, i) => (
                    <li key={p.user_id} className="flex justify-between bg-gray-700 p-3 rounded-md text-lg">
                        <span>#{i + 1} {p.user_name}</span>
                        <span className="font-bold">{p.score} pts</span>
                    </li>
                ))}
            </ul>
            {isHost && (
                <button onClick={onNextQuestion} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700">Next Question</button>
            )}
        </div>
    );
};
