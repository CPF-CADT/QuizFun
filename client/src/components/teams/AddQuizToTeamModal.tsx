import React, { useState, useEffect } from 'react';
import { X, ChevronDown, BookPlus } from 'lucide-react';
import { teamApi } from '../../service/teamApi'; // Adjust path
import { quizApi, type IQuiz } from '../../service/quizApi'; // Adjust path

interface AddQuizToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onQuizAdded: () => void;
}

export const AddQuizToTeamModal: React.FC<AddQuizToTeamModalProps> = ({ isOpen, onClose, teamId, onQuizAdded }) => {
    const [myQuizzes, setMyQuizzes] = useState<IQuiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>('');
    const [mode, setMode] = useState<'solo' | 'multiplayer'>('multiplayer');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Fetch user's own quizzes to populate the dropdown
            quizApi.getAllQuizzes({ page: 1, limit: 100, owner: 'me' })
                .then(res => setMyQuizzes(res.data.quizzes))
                .catch(() => setMyQuizzes([]));
        }
    }, [isOpen]);

    const handleAddQuiz = async () => {
        if (!selectedQuizId) return;
        setIsAdding(true);
        setError(null);
        try {
            await teamApi.addQuizToTeam(teamId, selectedQuizId, mode);
            onQuizAdded();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add quiz.");
        } finally {
            setIsAdding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg border">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add Quiz to Team</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                </header>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="quiz-select" className="block mb-2 font-medium">Select a quiz</label>
                        <div className="relative">
                            <select id="quiz-select" value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)} className="w-full bg-gray-50 border rounded-lg p-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="" disabled>Choose from your library...</option>
                                {myQuizzes.map(quiz => <option key={quiz._id} value={quiz._id}>{quiz.title}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Select Mode</label>
                        <div className="flex gap-2">
                            <button onClick={() => setMode('multiplayer')} className={`flex-1 p-3 rounded-lg border-2 font-semibold transition-colors ${mode === 'multiplayer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>Multiplayer</button>
                            <button onClick={() => setMode('solo')} className={`flex-1 p-3 rounded-lg border-2 font-semibold transition-colors ${mode === 'solo' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>Solo</button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <footer className="mt-8 flex justify-end">
                    <button onClick={handleAddQuiz} disabled={!selectedQuizId || isAdding} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        <BookPlus size={18} /> {isAdding ? 'Adding...' : 'Add Quiz'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
