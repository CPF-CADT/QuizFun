
// src/components/quiz/AnswerOptions.tsx
import { CheckCircle } from 'lucide-react';
import type { IOption } from '../../types/quiz';

interface AnswerOptionsProps {
    options: IOption[];
    onOptionChange: (index: number, value: string) => void;
    onCorrectOptionSelect: (index: number) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({ options, onOptionChange, onCorrectOptionSelect }) => (
    <div className='grid grid-cols-2 gap-6 mt-12 px-32'>
        {options.map((option, index) => (
            <div
                key={index}
                className={`group relative bg-gradient-to-br backdrop-blur-lg p-8 shadow-xl border-2 rounded-2xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer ${
                    option.isCorrect
                        ? 'from-green-100/95 to-green-50/90 border-green-400'
                        : 'from-white/95 to-white/85 border-white/50 hover:border-purple-300'
                }`}
                onClick={() => onCorrectOptionSelect(index)}
            >
                <div className='flex items-center'>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                        option.isCorrect ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-purple-400'
                    }`}>
                        {option.isCorrect
                            ? <CheckCircle className='w-5 h-5 text-white' />
                            : <span className='text-gray-400 font-bold'>{String.fromCharCode(65 + index)}</span>
                        }
                    </div>
                    <input
                        type="text"
                        value={option.text}
                        onChange={(e) => onOptionChange(index, e.target.value)}
                        placeholder={`Answer ${String.fromCharCode(65 + index)}...`}
                        className='w-full text-lg bg-transparent outline-none placeholder-gray-400 text-gray-700 font-medium'
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        ))}
    </div>
);
