// src/components/dashboard/CreateQuizModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi, type ICreateQuizPayload } from '../../service/quizApi'; // Assuming ICreateQuizPayload is defined in your api service
import { type Dificulty } from '../../service/quizApi'; 

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dificulty, setDificulty] = useState<Dificulty>('Easy');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const quizData: ICreateQuizPayload = { 
        title, 
        description, 
        dificulty, 
        visibility 
      };
      const response = await quizApi.createQuiz(quizData);
      const newQuizId = response.data.data._id;
      
      onClose();
      navigate(`/quiz-editor/${newQuizId}`);

    } catch (error) {
      console.error("Failed to create quiz", error);
      // Optionally, show an error message to the user
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Quiz</h2>
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., 'World Capitals'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              placeholder="(Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              id="difficulty"
              value={dificulty}
              onChange={(e) => setDificulty(e.target.value as Dificulty)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isCreating || !title.trim()} className="px-6 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:bg-violet-300 transition-colors">
              {isCreating ? 'Creating...' : 'Create & Edit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;
