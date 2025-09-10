import React, { useState, useEffect } from 'react';
import { quizApi } from '../../service/quizApi';
import { toast } from 'react-hot-toast';
import type { IQuiz, Dificulty } from '../../types/quiz';

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: IQuiz;
  onQuizUpdate: (updatedQuiz: IQuiz) => void;
}

const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({ isOpen, onClose, quiz, onQuizUpdate }) => {
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description || '');
  const [dificulty, setDificulty] = useState<Dificulty>(quiz.dificulty);
  const [visibility, setVisibility] = useState<'public' | 'private'>(quiz.visibility);

  // store tags as string for input, but convert to array before saving
  const [tags, setTags] = useState(
    Array.isArray(quiz.tags) ? quiz.tags.join(',') : quiz.tags || ''
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(quiz.title);
    setDescription(quiz.description || '');
    setDificulty(quiz.dificulty);
    setVisibility(quiz.visibility);
    setTags(Array.isArray(quiz.tags) ? quiz.tags.join(',') : quiz.tags || '');
  }, [quiz]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    try {
      // convert string → array
      const formattedTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const updatedQuizData = { 
        title, 
        description, 
        dificulty, 
        visibility, 
        tags: formattedTags 
      };

      const response = await quizApi.updateQuiz(quiz._id, updatedQuizData);
      onQuizUpdate(response.data.data);
      toast.success('Quiz details updated!');
      onClose();
    } catch (error) {
      console.error('Failed to update quiz', error);
      toast.error('Could not update quiz details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Quiz Settings</h2>
        <form onSubmit={handleSaveChanges} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              id="tags"
              type="text"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500 mt-1">Example: math,science,history</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="flex items-center justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:bg-violet-300 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizSettingsModal;
