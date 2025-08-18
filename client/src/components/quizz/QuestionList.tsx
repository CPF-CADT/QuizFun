// src/components/quiz/QuestionList.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import type { IQuestion } from '../../types/quiz';

interface QuestionListProps {
    questions: IQuestion[];
    editingQuestionId: string | null;
    onEdit: (question: IQuestion) => void;
    onDelete: (id: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, editingQuestionId, onEdit, onDelete }) => (
    <div className='flex-1 overflow-y-auto mb-6 pr-2'>
        <div className='space-y-4'>
            {questions.map((q, index) => (
                <div
                    key={q._id}
                    className={`bg-gradient-to-r backdrop-blur-md p-4 rounded-xl text-white border shadow-lg transition-all duration-200 group cursor-pointer ${
                        editingQuestionId === q._id
                            ? 'from-yellow-400/40 to-yellow-300/30 border-yellow-400/50'
                            : 'from-white/25 to-white/15 border-white/30 hover:from-white/30'
                    }`}
                    onClick={() => onEdit(q)}
                >
                    <div className='flex items-center justify-between mb-2'>
                        <span className='font-semibold text-sm'>Question {index + 1}</span>
                        <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                             <button
                                onClick={(e) => { e.stopPropagation(); onDelete(q._id!); }}
                                className='p-1 hover:bg-red-500/20 rounded-full transition-colors'
                            >
                                <Trash2 className='w-3 h-3 text-red-300' />
                            </button>
                        </div>
                    </div>
                    <p className='text-sm text-white/90 truncate'>{q.questionText}</p>
                </div>
            ))}
        </div>
    </div>
);
