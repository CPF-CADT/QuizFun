// src/components/quiz/SidebarActions.tsx
import { Plus, X, Trash } from "lucide-react";
import { PDFImportForQuiz } from './PDFImportForQuiz';

interface SidebarActionsProps {
  onAddOrUpdate: () => void;
  onCancelEdit: () => void;
  onHandleDeleteQuizz: () => void;
  isEditing: boolean;
  isFormValid: boolean;
    quizId?: string;
    onQuestionsImported?: () => void;
}

export const SidebarActions: React.FC<SidebarActionsProps> = ({ 
    onAddOrUpdate, 
    onCancelEdit, 
    isEditing, 
    isFormValid, 
    quizId, 
    onQuestionsImported ,
    onHandleDeleteQuizz
}) => (
    <div className='space-y-3'>
        <button
            onClick={onAddOrUpdate}
            className='w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!isFormValid}
        >
            <Plus className='w-5 h-5' />
            {isEditing ? 'Update Question' : 'Add Question'}
        </button>

        {isEditing && (
            <button
                onClick={onCancelEdit}
                className='w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-xl flex items-center justify-center gap-2 transform hover:scale-105'
            >
                <X className='w-5 h-5' />
                Cancel Edit
            </button>
        )}

        {quizId && onQuestionsImported && (
            <PDFImportForQuiz 
                quizId={quizId}
                onQuestionsImported={onQuestionsImported}
            />
        )}

    <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
        onClick={onHandleDeleteQuizz}
    >
      <Trash className="w-5 h-5" />
      Delete Quiz
    </button>
  </div>
);
