import type { IQuestion } from '../../types/quiz';
import { Trash2, Edit } from 'lucide-react';

interface QuestionListProps {
    questions: IQuestion[];
    editingQuestionId: string | null;
    onEdit: (question: IQuestion) => void;
    onDelete: (id: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, editingQuestionId, onEdit, onDelete }) => {
    return (
        <div className="flex-grow overflow-y-auto pr-2 mr-2 mb-5 space-y-2 max-h-[550px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {questions.map((q, index) => (
                <div
                    key={q._id}
                    className={`p-3 rounded-lg transition-all duration-200 flex justify-between items-center ${
                        editingQuestionId === q._id
                            ? 'bg-white text-violet-800 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                >
                    <span className="font-medium text-sm truncate pr-2">
                        {index + 1}. {q.questionText}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => onEdit(q)}
                            className="p-1 rounded-full hover:bg-white/20"
                            aria-label="Edit question"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(q._id!)}
                            className="p-1 rounded-full hover:bg-red-500/50 text-white"
                            aria-label="Delete question"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
