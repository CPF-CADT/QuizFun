
// src/components/quiz/QuizSidebar.tsx
import { useNavigate } from 'react-router-dom';
import type { IQuizTemplate, IQuestion } from '../../types/quiz';
import { ArrowLeft } from 'lucide-react';
import { QuestionList } from './QuestionList';
import { SidebarActions } from './SidebarActions';

interface QuizSidebarProps {
    template: IQuizTemplate;
    quizTitle: string;
    questions: IQuestion[];
    editingQuestionId: string | null;
    onEditQuestion: (question: IQuestion) => void;
    onDeleteQuestion: (id: string) => void;
    onAddOrUpdate: () => void;
    onCancelEdit: () => void;
    isFormValid: boolean;
}

const QuizSidebar: React.FC<QuizSidebarProps> = (props) => {
    const navigate = useNavigate();

    return (
        <div className={`bg-gradient-to-b ${props.template.sidebarGradient} backdrop-blur-lg p-8 shadow-2xl border border-white/30 w-1/5 relative z-10 flex flex-col`}>
            <div className='text-center mb-8'>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
                <h1 className='text-2xl text-white font-bold tracking-wide break-words'>{props.quizTitle}</h1>
            </div>

            <QuestionList
                questions={props.questions}
                editingQuestionId={props.editingQuestionId}
                onEdit={props.onEditQuestion}
                onDelete={props.onDeleteQuestion}
            />

            <SidebarActions
                isEditing={!!props.editingQuestionId}
                isFormValid={props.isFormValid}
                onAddOrUpdate={props.onAddOrUpdate}
                onCancelEdit={props.onCancelEdit}
            />
        </div>
    );
};

export default QuizSidebar;
