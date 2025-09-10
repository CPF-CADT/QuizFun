import type { IQuizTemplate, IQuestion } from '../../types/quiz';
import { ArrowLeft, Settings, X } from 'lucide-react';
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
    onOpenSettings: () => void;
    onNavigateBack: () => void; // New prop for safe navigation
    isFormValid: boolean;
    quizId?: string;
    onQuestionsImported?: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const QuizSidebar: React.FC<QuizSidebarProps> = (props) => {
    return (
        <>
            {/* Overlay for mobile */}
            <div 
              onClick={() => props.setIsOpen(false)} 
              className={`fixed inset-0 bg-black/50 z-30 transition-opacity lg:hidden ${props.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            />

            <aside className={`fixed lg:relative top-0 left-0 h-full bg-gradient-to-b ${props.template.sidebarGradient} backdrop-blur-lg p-6 shadow-2xl border-r border-white/20 w-80 sm:w-96 lg:w-[22rem] z-40 flex flex-col transition-transform duration-300 ease-in-out ${props.isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex justify-between items-center text-center mb-6">
                    <button onClick={props.onNavigateBack} className="flex items-center gap-2 text-white/80 hover:text-white">
                        <ArrowLeft size={18} />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </button>
                    <button onClick={() => props.setIsOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <h1 className='text-2xl text-white font-bold tracking-wide break-words text-center mb-4'>{props.quizTitle}</h1>

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
                    quizId={props.quizId}
                    onQuestionsImported={props.onQuestionsImported}
                    onHandleDeleteQuizz={props.onHandleDeleteQuizz}
                />
            </aside>
        </>
    );
};

export default QuizSidebar;