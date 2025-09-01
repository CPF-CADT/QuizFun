import React, { useState, useEffect } from 'react';
import { X, ChevronDown, BookPlus, Users, User } from 'lucide-react';
import { teamApi } from '../../service/teamApi';
import { quizApi, type IQuiz } from '../../service/quizApi';

interface AssignQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    onQuizAssigned: () => void; // Callback to refresh the list
}

export const AssignQuizModal: React.FC<AssignQuizModalProps> = ({ isOpen, onClose, teamId, onQuizAssigned }) => {
    const [myQuizzes, setMyQuizzes] = useState<IQuiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>('');
    const [mode, setMode] = useState<'solo' | 'multiplayer'>('multiplayer'); // ✅ ADDED: State for the mode
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setSelectedQuizId('');
            setMode('multiplayer');
            setError(null);
            
            quizApi.getAllQuizzes({ page: 1, limit: 100, owner: 'me' })
                .then(res => setMyQuizzes(res.data.quizzes))
                .catch(() => setMyQuizzes([]));
        }
    }, [isOpen]);

    const handleAssignQuiz = async () => {
        if (!selectedQuizId) return;
        setIsAssigning(true);
        setError(null);
        try {
            // ✅ FIXED: Using the correct API function `addQuizToTeam` and passing the selected mode
            await teamApi.addQuizToTeam(teamId, selectedQuizId, mode);
            onQuizAssigned(); // Refresh the list on the parent page
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to assign quiz.");
        } finally {
            setIsAssigning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg border shadow-xl">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Assign Quiz to Team</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                        <X size={20} />
                    </button>
                </header>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="quiz-select" className="block mb-2 font-medium text-gray-700">1. Select a quiz</label>
                        <div className="relative">
                            <select 
                                id="quiz-select" 
                                value={selectedQuizId} 
                                onChange={(e) => setSelectedQuizId(e.target.value)} 
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="" disabled>Choose from your library...</option>
                                {myQuizzes.map(quiz => <option key={quiz._id} value={quiz._id}>{quiz.title}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-400" />
                        </div>
                    </div>

                    {/* ✅ ADDED: UI for selecting the quiz mode */}
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">2. Select a mode</label>
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button 
                                onClick={() => setMode('multiplayer')} 
                                className={`w-full flex items-center justify-center gap-2 p-2 rounded-md font-semibold transition-colors ${mode === 'multiplayer' ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                <Users size={16} /> Multiplayer
                            </button>
                            <button 
                                onClick={() => setMode('solo')} 
                                className={`w-full flex items-center justify-center gap-2 p-2 rounded-md font-semibold transition-colors ${mode === 'solo' ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                <User size={16} /> Solo
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                </div>

                <footer className="mt-8 flex justify-end">
                    <button 
                        onClick={handleAssignQuiz} 
                        disabled={!selectedQuizId || isAssigning} 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <BookPlus size={18} /> {isAssigning ? 'Assigning...' : 'Assign Quiz'}
                    </button>
                </footer>
            </div>
        </div>
    );
};