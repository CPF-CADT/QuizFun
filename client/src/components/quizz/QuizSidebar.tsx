import { useNavigate } from 'react-router-dom';
import type { IQuizTemplate, IQuestion } from '../../types/quiz';
import { ArrowLeft, Settings } from 'lucide-react'; // Import Settings icon
import { QuestionList } from './QuestionList';
import { SidebarActions } from './SidebarActions';

interface QuizSidebarProps {
    template: IQuizTemplate;
    quizTitle: string;
    questions: IQuestion[];
    editingQuestionId: string | null;
    onEditQuestion: (question: IQuestion) => void;
    onHandleDeleteQuizz: () => void;
    onDeleteQuestion: (id: string) => void;
    onAddOrUpdate: () => void;
    onCancelEdit: () => void;
    onOpenSettings: () => void; // Add this prop
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

            {/* Settings Button */}
            <button 
              onClick={props.onOpenSettings} 
              className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Settings size={18} />
              Quiz Settings
            </button>

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
                onHandleDeleteQuizz={props.onHandleDeleteQuizz}
            />
        </div>
    );
};

export default QuizSidebar;