// src/components/dashboard/CreateQuizModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi, type ICreateQuizPayload } from '../../service/quizApi';
import { backgroundTemplates } from '../../data/templates';
import { CheckCircle, X as CloseIcon } from 'lucide-react';
import type { Dificulty } from '../../types/quiz';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dificulty, setDificulty] = useState<Dificulty>('Easy');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isCreating) return;
    
    setIsCreating(true);
    
    const selectedTheme = backgroundTemplates.find(t => t.id === selectedTemplate);

    try {
      const quizData: ICreateQuizPayload = { 
        title, 
        description, 
        dificulty, 
        visibility,
        tags, 
        templateImgUrl: selectedTheme ? selectedTheme.background : undefined
      };
      
      const response = await quizApi.createQuiz(quizData);
      const newQuizId = response.data.data._id;
      
      onClose();
      navigate(`/quiz-editor/${newQuizId}`);

    } catch (error) {
      console.error("Failed to create quiz", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg animate-fade-in-up">
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
              rows={2}
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-violet-500">
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-violet-100 text-violet-800 text-sm font-medium px-2.5 py-1 rounded-full">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="text-violet-500 hover:text-violet-700 focus:outline-none"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
              ))}
              <input
                id="tags"
                type="text"
                placeholder={tags.length === 0 ? "Add tags (e.g., Science, History)" : ""}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-grow p-1 bg-transparent focus:outline-none"
              />
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2">
              {backgroundTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 group ${
                    selectedTemplate === template.id ? 'border-violet-500 shadow-md' : 'border-transparent hover:border-violet-300'
                  }`}
                >
                  <img src={template.preview} alt={template.name} className="w-full h-20 object-cover" />
                  <div className="absolute bottom-0 left-0 w-full bg-black/50 p-1">
                    <p className="text-white text-xs text-center truncate">{template.name}</p>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 bg-violet-500/50 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors">
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