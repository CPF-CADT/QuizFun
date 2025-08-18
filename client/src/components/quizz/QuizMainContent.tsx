import type { IOption } from "../../types/quiz";
import { AnswerOptions } from "./AnswerOptions";
import { QuestionForm } from "./QuestionForm";


// src/components/quiz/QuizMainContent.tsx
interface QuizMainContentProps {
    question: string;
    onQuestionChange: (value: string) => void;
    options: IOption[];
    onOptionChange: (index: number, value: string) => void;
    onCorrectOptionSelect: (index: number) => void;
    isEditing: boolean;
    questionNumber: number;
}

const QuizMainContent: React.FC<QuizMainContentProps> = (props) => (
    <div className='flex-1 relative z-10'>
        <QuestionForm
            question={props.question}
            onQuestionChange={props.onQuestionChange}
            isEditing={props.isEditing}
            questionNumber={props.questionNumber}
        />
        <AnswerOptions
            options={props.options}
            onOptionChange={props.onOptionChange}
            onCorrectOptionSelect={props.onCorrectOptionSelect}
        />
    </div>
);

export default QuizMainContent;
