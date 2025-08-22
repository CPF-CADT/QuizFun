import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../service/quizApi';
import type { IQuestion, IQuiz, IOption } from '../types/quiz'; 
import { backgroundTemplates } from '../data/templates';
import DynamicBackground from '../components/quizz/DynamicBackground';
import QuizSidebar from '../components/quizz/QuizSidebar';
import QuizMainContent from '../components/quizz/QuizMainContent';
import QuizSettingsModal from '../components/quizz/QuizSettingsModal'; 
import { Toaster } from 'react-hot-toast';

const QuizEditorPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [quizDetails, setQuizDetails] = useState<IQuiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // State for the modal
    
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [options, setOptions] = useState<IOption[]>([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    
    const isFormValid = currentQuestion.trim() !== '' && options.some(opt => opt.text.trim() !== '') && options.some(opt => opt.isCorrect);

    const fetchQuizData = useCallback(async () => {
        if (!quizId) {
            navigate('/dashboard');
            return;
        }
        try {
            const response = await quizApi.getQuizById(quizId);
            setQuizDetails(response.data);
        } catch (error) {
            console.error("Failed to fetch quiz:", error);
            navigate('/dashboard'); 
        } finally {
            setIsLoading(false);
        }
    }, [quizId, navigate]);

    useEffect(() => {
        fetchQuizData();
    }, [fetchQuizData]);

    const resetForm = () => {
        setCurrentQuestion('');
        setOptions([
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]);
        setEditingQuestionId(null);
    };

    const handleAddOrUpdateQuestion = async () => {
        if (!isFormValid || !quizId) return;

        const questionPayload = {
            questionText: currentQuestion,
            options: options.filter(opt => opt.text.trim() !== ''),
            point: 10, 
            timeLimit: 30,
        };

        try {
            if (editingQuestionId) {
                await quizApi.updateQuestion(quizId, editingQuestionId, questionPayload);
            } else {
                await quizApi.addQuestionToQuiz(quizId, questionPayload);
            }
            fetchQuizData();
            resetForm();
        } catch (error) {
            console.error("Failed to save question", error);
        }
    };
    
    const handleEditQuestion = (question: IQuestion) => {
        setEditingQuestionId(question._id!);
        setCurrentQuestion(question.questionText);
        
        const filledOptions = [...question.options];
        while (filledOptions.length < 4) {
            filledOptions.push({ text: '', isCorrect: false });
        }
        setOptions(filledOptions);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!quizId) return;
        try {
            await quizApi.deleteQuestion(quizId, questionId);
            fetchQuizData();
            if (editingQuestionId === questionId) {
                resetForm();
            }
        } catch (error) {
            console.error("Failed to delete question", error);
        }
    };

    if (isLoading || !quizDetails) {
        return <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-700">Loading Quiz Editor...</div>;
    }

    return (
        <div className='backdrop-blur-md min-h-screen flex relative overflow-hidden'>
            <Toaster position="top-center" />
            <DynamicBackground template={backgroundTemplates[0]} />
            <QuizSidebar
                template={backgroundTemplates[0]}
                quizTitle={quizDetails.title}
                questions={quizDetails.questions || []}
                editingQuestionId={editingQuestionId}
                onEditQuestion={handleEditQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onAddOrUpdate={handleAddOrUpdateQuestion}
                onCancelEdit={resetForm}
                onOpenSettings={() => setIsSettingsModalOpen(true)} // Open modal
                isFormValid={isFormValid}
                quizId={quizId}
                onQuestionsImported={fetchQuizData}
            />
            <QuizMainContent
                question={currentQuestion}
                onQuestionChange={setCurrentQuestion}
                options={options}
                onOptionChange={(index, value) => {
                    const newOptions = [...options];
                    newOptions[index].text = value;
                    setOptions(newOptions);
                }}
                onCorrectOptionSelect={(index) => {
                    setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === index })));
                }}
                isEditing={!!editingQuestionId}
                questionNumber={(quizDetails.questions?.length || 0) + 1}
            />
            <QuizSettingsModal
              isOpen={isSettingsModalOpen}
              onClose={() => setIsSettingsModalOpen(false)}
              quiz={quizDetails}
              onQuizUpdate={(updatedQuiz) => {
                setQuizDetails(updatedQuiz);
              }}
            />
        </div>
    );
};

export default QuizEditorPage;