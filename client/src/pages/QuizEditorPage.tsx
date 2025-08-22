import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizApi } from "../service/quizApi";
import type { IQuestion, IQuiz, IOption } from "../types/quiz";
import { backgroundTemplates } from "../data/templates";
import DynamicBackground from "../components/quizz/DynamicBackground";
import QuizSidebar from "../components/quizz/QuizSidebar";
import QuizSettingsModal from "../components/quizz/QuizSettingsModal";
import { QuestionEditor } from "../components/quizz/QuestionEditor";
import type { QuestionType } from "../components/quizz/QuestionConfigPanel";
import { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

const QuizEditorPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quizDetails, setQuizDetails] = useState<IQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentOptions, setCurrentOptions] = useState<IOption[]>([]);
  const [currentPoints, setCurrentPoints] = useState(10);
  const [currentTimeLimit, setCurrentTimeLimit] = useState(30);
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>('Multiple Choice');

  const isFormValid =
    currentQuestionText.trim() !== "" &&
    currentOptions.some((opt) => opt.text.trim() !== "") &&
    currentOptions.some((opt) => opt.isCorrect);
  
  const resetForm = useCallback(() => {
    setEditingQuestionId(null);
    setCurrentQuestionText("");
    setCurrentPoints(10);
    setCurrentTimeLimit(30);
    setCurrentQuestionType('Multiple Choice');
    setCurrentOptions([
      { text: "", isCorrect: true }, { text: "", isCorrect: false },
      { text: "", isCorrect: false }, { text: "", isCorrect: false },
    ]);
  }, []);

  const fetchQuizData = useCallback(async () => {
    if (!quizId) return;
    try {
      const response = await quizApi.getQuizById(quizId);
      setQuizDetails(response.data);
      resetForm(); 
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [quizId, navigate, resetForm]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);
  
  useEffect(() => {
    if (currentQuestionType === 'True/False' && editingQuestionId === null) {
      setCurrentOptions([
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ]);
    }
  }, [currentQuestionType, editingQuestionId]);

  const handleAddOrUpdateQuestion = async () => {
    if (!isFormValid || !quizId) return;

    const questionPayload = {
      questionText: currentQuestionText,
      options: currentOptions.filter((opt) => opt.text.trim() !== ""),
      point: currentPoints,
      timeLimit: currentTimeLimit,
    };

    try {
      if (editingQuestionId) {
        await quizApi.updateQuestion(quizId, editingQuestionId, questionPayload);
      } else {
        await quizApi.addQuestionToQuiz(quizId, questionPayload);
      }
      await fetchQuizData();
    } catch (error) {
      console.error("Failed to save question", error);
    }
  };

  const handleEditQuestion = (question: IQuestion) => {
    setEditingQuestionId(question._id!);
    setCurrentQuestionText(question.questionText);
    setCurrentPoints(question.point || 10);
    setCurrentTimeLimit(question.timeLimit || 30);
    
    const isTrueFalse = question.options.length === 2 && question.options.every(o => ['true', 'false'].includes(o.text.toLowerCase()));
    const type = isTrueFalse ? 'True/False' : 'Multiple Choice';
    setCurrentQuestionType(type);

    if (type === 'Multiple Choice') {
        const filledOptions = [...question.options];
        while (filledOptions.length < 4) {
          filledOptions.push({ text: "", isCorrect: false });
        }
        setCurrentOptions(filledOptions);
    } else {
        setCurrentOptions(question.options);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizId) return;
    try {
      await quizApi.deleteQuestion(quizId, questionId);
      if (editingQuestionId === questionId) {
        resetForm();
      }
      await fetchQuizData();
    } catch (error) {
      console.error("Failed to delete question", error);
    }
  };
  
  const onHandleDeleteQuiz = async () => {
    if (!quizId) return;
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the quiz.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
        try {
            await quizApi.deleteQuiz(quizId);
            Swal.fire("Deleted!", "The quiz has been deleted.", "success");
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to delete quiz", error);
            Swal.fire("Error", "Failed to delete quiz.", "error");
        }
    }
  };

  if (isLoading || !quizDetails) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="backdrop-blur-md min-h-screen flex relative overflow-hidden">
      <Toaster position="top-center" />
      <DynamicBackground template={backgroundTemplates[0]} />
      <QuizSidebar
        // FIX: Added the required 'template' prop below
        template={backgroundTemplates[0]} 
        quizTitle={quizDetails.title}
        questions={quizDetails.questions || []}
        editingQuestionId={editingQuestionId}
        onEditQuestion={handleEditQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onAddOrUpdate={handleAddOrUpdateQuestion}
        onCancelEdit={resetForm}
        isFormValid={isFormValid}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onHandleDeleteQuizz={onHandleDeleteQuiz}
        quizId={quizId}
        onQuestionsImported={fetchQuizData}
      />
      <div className="flex-1 flex flex-col items-center">
        <QuestionEditor
          questionText={currentQuestionText}
          onQuestionTextChange={setCurrentQuestionText}
          options={currentOptions}
          onOptionTextChange={(index, value) => {
            const newOptions = [...currentOptions];
            newOptions[index].text = value;
            setCurrentOptions(newOptions);
          }}
          onCorrectOptionSelect={(index) => {
            setCurrentOptions(
              currentOptions.map((opt, i) => ({ ...opt, isCorrect: i === index }))
            );
          }}
          questionType={currentQuestionType}
          onQuestionTypeChange={setCurrentQuestionType}
          points={currentPoints}
          onPointsChange={setCurrentPoints}
          timeLimit={currentTimeLimit}
          onTimeLimitChange={setCurrentTimeLimit}
          isEditing={!!editingQuestionId}
          questionNumber={(quizDetails.questions?.length || 0) + 1}
        />
      </div>
      <QuizSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        quiz={quizDetails}
        onQuizUpdate={(updatedQuiz) => setQuizDetails(updatedQuiz)}
      />
    </div>
  );
};

export default QuizEditorPage;