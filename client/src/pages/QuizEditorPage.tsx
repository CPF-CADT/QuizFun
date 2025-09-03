import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizApi } from "../service/quizApi";
import type { IQuestion, IQuiz, IOption } from "../types/quiz";
import { backgroundTemplates } from "../data/templates";
import DynamicBackground from "../components/quizz/DynamicBackground";
import QuizSidebar from "../components/quizz/QuizSidebar";
import QuizSettingsModal from "../components/quizz/QuizSettingsModal";
import { QuestionEditor } from "../components/quizz/QuestionEditor";
import type { QuestionType } from "../components/quizz/QuestionConfigPanel";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useImageUpload } from "../hook/useImageUpload";
import { Menu } from "lucide-react";

// --- Debounce Hook (included for convenience) ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Main Page Component ---
const QuizEditorPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  // --- State Declarations ---
  const [quizDetails, setQuizDetails] = useState<IQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentOptions, setCurrentOptions] = useState<IOption[]>([]);
  const [currentPoints, setCurrentPoints] = useState(10);
  const [currentTimeLimit, setCurrentTimeLimit] = useState(30);
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>('Multiple Choice');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Auto-save & Dirty State
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const { isUploading, selectedFile, setSelectedFile, fileInputRef, handleSelectFileClick, handleFileSelect: originalHandleFileSelect, handleUpload, setUploadedImageUrl } = useImageUpload();

  const isFormValid = useMemo(() =>
    currentQuestionText.trim() !== "" &&
    currentOptions.some((opt) => opt.text.trim() !== "") &&
    currentOptions.some((opt) => opt.isCorrect),
    [currentQuestionText, currentOptions]
  );

  const resetForm = useCallback(() => {
    setEditingQuestionId(null);
    setCurrentQuestionText("");
    setCurrentPoints(10);
    setCurrentTimeLimit(30);
    setCurrentQuestionType('Multiple Choice');
    setCurrentImageUrl(null);
    setSelectedFile(null);
    setUploadedImageUrl(null);
    setAutoSaveStatus('idle');
    setIsDirty(false);
    setCurrentOptions([{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }]);
  }, [setSelectedFile, setUploadedImageUrl]);

  const fetchQuizData = useCallback(async () => {
    if (!quizId) return;
    setIsLoading(true);
    try {
      const response = await quizApi.getQuizById(quizId);
      setQuizDetails(response.data);
      resetForm();
    } catch (error) {
      toast.error("Could not load quiz data.");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [quizId, navigate, resetForm]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);
  
  const questionStateForSaving = useMemo(() => ({
    questionText: currentQuestionText, options: currentOptions, point: currentPoints,
    timeLimit: currentTimeLimit, imageUrl: currentImageUrl,
  }), [currentQuestionText, currentOptions, currentPoints, currentTimeLimit, currentImageUrl]);

  const debouncedQuestionState = useDebounce(questionStateForSaving, 2000);

  useEffect(() => {
    if (!isDirty || !editingQuestionId || !isFormValid) {
      return;
    }

    const performAutoSave = async () => {
      if (!quizId) return;
      setAutoSaveStatus('saving');
      const payload = { ...debouncedQuestionState, options: debouncedQuestionState.options.filter(opt => opt.text.trim() !== ""), imageUrl: debouncedQuestionState.imageUrl || undefined };
      try {
        await quizApi.updateQuestion(quizId, editingQuestionId, payload);
        setAutoSaveStatus('saved');
        setIsDirty(false);
        setQuizDetails(prev => {
            if (!prev) return null;
            const updatedQuestions = (prev.questions ?? []).map(q => 
                q._id === editingQuestionId ? { ...q, ...payload, _id: editingQuestionId, options: payload.options } as IQuestion : q
            );
            return { ...prev, questions: updatedQuestions };
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
        setAutoSaveStatus('error');
      }
    };

    performAutoSave();
  }, [debouncedQuestionState, editingQuestionId, quizId, isFormValid, isDirty]);

  const createChangeHandler = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
      setter(value);
      setIsDirty(true);
  };
  const handleQuestionTextChange = createChangeHandler(setCurrentQuestionText);
  const handleOptionTextChange = (index: number, value: string) => {
    const newOptions = [...currentOptions];
    newOptions[index].text = value;
    setCurrentOptions(newOptions);
    setIsDirty(true);
  };
  const handleCorrectOptionSelect = createChangeHandler(setCurrentOptions);
  const handlePointsChange = createChangeHandler(setCurrentPoints);
  const handleTimeLimitChange = createChangeHandler(setCurrentTimeLimit);
  const handleQuestionTypeChange = createChangeHandler(setCurrentQuestionType);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      originalHandleFileSelect(event);
      setIsDirty(true);
  };

  const handleImmediateSave = useCallback(async () => {
    if (!isFormValid || !quizId || !editingQuestionId) {
      toast.error("Cannot save, form is incomplete.");
      throw new Error("Form is invalid");
    }
    setAutoSaveStatus('saving');
    let finalImageUrl = currentImageUrl;
    if (selectedFile) {
        const newUrl = await handleUpload();
        if (newUrl) {
            finalImageUrl = newUrl;
        } else {
            setAutoSaveStatus('error');
            return; // Upload failed
        }
    }

    const payload = { questionText: currentQuestionText, options: currentOptions.filter(opt => opt.text.trim() !== ""), point: currentPoints, timeLimit: currentTimeLimit, imageUrl: finalImageUrl || undefined };
    try {
        await quizApi.updateQuestion(quizId, editingQuestionId, payload);
        setIsDirty(false);
        setAutoSaveStatus('saved');
        setCurrentImageUrl(finalImageUrl); // Ensure state reflects uploaded image
        setSelectedFile(null); // Clear selected file after upload
        toast.success("Changes saved!");
    } catch(err) {
        setAutoSaveStatus('error');
        toast.error("Failed to save changes.");
        throw err;
    }
  }, [quizId, editingQuestionId, isFormValid, currentQuestionText, currentOptions, currentPoints, currentTimeLimit, currentImageUrl, selectedFile, handleUpload]);
  
  const handleUnsavedChanges = async (action: () => void) => {
    if (!isDirty) {
      action();
      return;
    }
    const result = await Swal.fire({
      title: 'You have unsaved changes!',
      text: "Do you want to save them before continuing?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Save and Continue',
      denyButtonText: `Discard and Continue`,
      cancelButtonText: 'Stay Here',
      icon: 'warning'
    });

    if (result.isConfirmed) {
      try {
        if(editingQuestionId && isFormValid){
            await handleImmediateSave();
            action();
        } else if (!isFormValid) {
            toast.error("Cannot save, form is invalid.");
        } else {
            action(); // Not editing, just proceed
        }
      } catch (e) { /* Save failed, so we stay on the page. */ }
    } else if (result.isDenied) {
      action();
    }
  };

  const handleEditQuestion = (question: IQuestion) => {
    handleUnsavedChanges(() => {
        // FIX: Clear any lingering file selection from previous question
        setSelectedFile(null); 
        setUploadedImageUrl(null);

        setIsDirty(false);
        setEditingQuestionId(question._id!);
        setCurrentQuestionText(question.questionText);
        setCurrentPoints(question.point || 10);
        setCurrentTimeLimit(question.timeLimit || 30);
        setCurrentImageUrl(question.imageUrl || null);
        
        const isTrueFalse = question.options.length === 2 && question.options.every(o => ['true', 'false'].includes(o.text.toLowerCase()));
        const type = isTrueFalse ? 'True/False' : 'Multiple Choice';
        setCurrentQuestionType(type);

        let filledOptions = [...question.options];
        if (type === 'Multiple Choice') {
            while (filledOptions.length < 4) {
                filledOptions.push({ text: "", isCorrect: false });
            }
        }
        setCurrentOptions(filledOptions);
        setIsSidebarOpen(false);
    });
  };

  const handleCancelEdit = () => handleUnsavedChanges(() => resetForm());
  const handleNavigateBack = () => handleUnsavedChanges(() => navigate('/dashboard'));

  const handleAddOrUpdateQuestion = async () => {
    if (!isFormValid || !quizId) return;
    
    // This function is for the main "Add/Update" button in the sidebar.
    // For existing questions, it's just a manual save.
    if (editingQuestionId) {
        await handleImmediateSave();
        return;
    }

    // Logic for adding a NEW question
    const toastId = toast.loading('Adding new question...');
    let finalImageUrl = currentImageUrl;
    if (selectedFile) {
        const newUrl = await handleUpload();
        if (newUrl) {
            finalImageUrl = newUrl;
        } else {
            toast.error("Image upload failed.", { id: toastId });
            return;
        }
    }
    
    const payload = { ...questionStateForSaving, options: questionStateForSaving.options.filter(o => o.text.trim() !== ''), imageUrl: finalImageUrl || undefined };

    try {
       await quizApi.addQuestionToQuiz(quizId, payload);
       toast.success('Question added successfully!', { id: toastId });
       await fetchQuizData();
    } catch (error) {
       toast.error('Failed to add question.', { id: toastId });
    }
  };
  
  const onDeleteQuestion = async (questionId: string) => {
    if (!quizId) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the question.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await quizApi.deleteQuestion(quizId, questionId);
        toast.success("Question deleted.");
        if (editingQuestionId === questionId) {
          resetForm();
        }
        await fetchQuizData();
      } catch (error) {
        toast.error("Failed to delete question.");
      }
    }
  };
  
  const onHandleDeleteQuiz = async () => {
    if (!quizId) return;
    const result = await Swal.fire({
      title: "Delete this entire quiz?",
      text: "This action is permanent and cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await quizApi.deleteQuiz(quizId);
        toast.success("Quiz permanently deleted.");
        navigate("/dashboard");
      } catch (error) {
        toast.error("Failed to delete the quiz.");
      }
    }
  };

  const handleRemoveImage = () => {
      setCurrentImageUrl(null);
      setSelectedFile(null);
      setUploadedImageUrl(null);
      setIsDirty(true);
  };
  
  const imagePreviewUrl = selectedFile ? URL.createObjectURL(selectedFile) : currentImageUrl;
  const imageUploaderComponent = (
      <div className="mt-2 space-y-3">
          <div className="flex items-center gap-4">
              {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="w-20 h-20 rounded-md object-cover" />
              ) : (
                  <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center">No Image</div>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" disabled={isUploading} />
              <div className="flex flex-col gap-2">
                  <button type="button" onClick={handleSelectFileClick} disabled={isUploading} className="px-4 py-2 text-sm text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 disabled:opacity-50">
                      {isUploading ? "Uploading..." : (imagePreviewUrl ? 'Change Image' : 'Select Image')}
                  </button>
                  {imagePreviewUrl && (
                      <button type="button" onClick={handleRemoveImage} disabled={isUploading} className="px-4 py-2 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50">
                          Remove Image
                      </button>
                  )}
              </div>
          </div>
      </div>
  );

  if (isLoading || !quizDetails) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading Editor...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-gray-50">
      <Toaster position="top-center" />
      <DynamicBackground template={backgroundTemplates[0]} />
      
      <div className="absolute top-4 left-4 z-40 lg:hidden">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-black/30 backdrop-blur-sm rounded-md text-white shadow-lg">
          <Menu size={24} />
        </button>
      </div>

      <QuizSidebar
        template={backgroundTemplates[0]}
        quizTitle={quizDetails.title}
        questions={quizDetails.questions || []}
        editingQuestionId={editingQuestionId}
        onEditQuestion={handleEditQuestion}
        onDeleteQuestion={onDeleteQuestion}
        onAddOrUpdate={handleAddOrUpdateQuestion}
        onCancelEdit={handleCancelEdit}
        onNavigateBack={handleNavigateBack}
        isFormValid={isFormValid}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onHandleDeleteQuizz={onHandleDeleteQuiz}
        quizId={quizId}
        onQuestionsImported={fetchQuizData}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <QuestionEditor
          questionText={currentQuestionText}
          onQuestionTextChange={handleQuestionTextChange}
          options={currentOptions}
          onOptionTextChange={handleOptionTextChange}
          onCorrectOptionSelect={(index) => {
            const newOptions = currentOptions.map((opt, i) => ({ ...opt, isCorrect: i === index }));
            handleCorrectOptionSelect(newOptions);
          }}
          questionType={currentQuestionType}
          onQuestionTypeChange={handleQuestionTypeChange}
          points={currentPoints}
          onPointsChange={handlePointsChange}
          timeLimit={currentTimeLimit}
          onTimeLimitChange={handleTimeLimitChange}
          isEditing={!!editingQuestionId}
          questionNumber={(quizDetails.questions?.length || 0) + 1}
          imageUploaderComponent={imageUploaderComponent}
          autoSaveStatus={autoSaveStatus}
          isDirty={isDirty}
          isFormValid={isFormValid}
          onImmediateSave={handleImmediateSave}
        />
      </main>
      
      {quizDetails && (
        <QuizSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          quiz={quizDetails}
          onQuizUpdate={(updatedQuiz) => setQuizDetails(updatedQuiz)}
        />
      )}
    </div>
  );
};

export default QuizEditorPage;