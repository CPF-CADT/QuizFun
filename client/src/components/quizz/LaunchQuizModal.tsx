import React, { useState } from 'react';
import { X, ChevronDown, Users, Shield, Rocket } from 'lucide-react';

interface LaunchQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for user's quizzes and teams
const userQuizzes = [
  { id: 'q1', title: 'Advanced React Hooks' },
  { id: 'q2', title: 'TypeScript Deep Dive' },
  { id: 'q3', title: 'CSS Flexbox & Grid' },
];

const userTeams = [
  { id: 't1', name: 'Frontend Wizards' },
  { id: 't2', name: 'API Avengers' },
];

export const LaunchQuizModal: React.FC<LaunchQuizModalProps> = ({ isOpen, onClose }) => {
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg border border-gray-200 shadow-xl">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Launch Multiplayer Quiz</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </header>

        <div className="space-y-6">
          <div>
            <label htmlFor="quiz-select" className="block mb-2 font-medium text-gray-600">1. Select a Quiz</label>
            <div className="relative">
              <select
                id="quiz-select"
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="" disabled>Choose from your library...</option>
                {userQuizzes.map(quiz => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="team-select" className="block mb-2 font-medium text-gray-600">2. Restrict to a Team</label>
            <div className="relative">
              <select
                id="team-select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="" disabled>Assign to a team...</option>
                {userTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <Shield size={20} className="text-indigo-500 flex-shrink-0" />
              <span>Only members of the selected team will be able to join this quiz session.</span>
            </div>
          </div>
        </div>

        <footer className="mt-8 flex justify-end">
          <button 
            disabled={!selectedQuiz || !selectedTeam}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Rocket size={18} /> Launch Session
          </button>
        </footer>
      </div>
    </div>
  );
};
