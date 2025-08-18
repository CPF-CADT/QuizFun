// src/components/quiz/QuestionForm.tsx
import React from 'react';

interface QuestionFormProps {
    question: string;
    onQuestionChange: (value: string) => void;
    isEditing: boolean;
    questionNumber: number;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ question, onQuestionChange, isEditing, questionNumber }) => (
    <div className='bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg p-10 shadow-2xl border border-white/40 mx-32 mt-10 rounded-2xl'>
        <h2 className='text-xl font-semibold text-gray-700 mb-6'>
            {isEditing ? `Editing Question` : `Question ${questionNumber}`}
        </h2>
        <input
            type="text"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="Enter your question here..."
            className='w-full text-center text-2xl bg-transparent outline-none placeholder-gray-400 font-medium text-gray-800 border-b-2 border-gray-200 focus:border-purple-500 transition-colors pb-4'
        />
    </div>
);
