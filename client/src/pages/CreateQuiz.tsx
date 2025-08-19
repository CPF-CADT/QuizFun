import React, { useState } from 'react';
import { Plus, Save, Eye, Trash2, Settings, CheckCircle, Palette, X, Edit2 } from 'lucide-react';

const CreateQuiz: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
    const [questionCount, setQuestionCount] = useState(1);
    const [savedQuestions, setSavedQuestions] = useState<Array<{id: number, question: string, answers: string[], correctAnswer: number}>>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(0);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

    // Background templates
    const backgroundTemplates = [
        {
            id: 0,
            name: "Theme 1",
            preview: "./image/theme1.jpg",
            background: "./image/theme1.jpg",
            gradient: "from-purple-900/20 via-transparent to-blue-900/20",
            sidebarGradient: "from-purple-600/90 to-purple-800/90"
        },
        {
            id: 1,
            name: "Theme 2",
            preview: "./image/theme2.jpg",
            background: "./image/theme2.jpg",
            gradient: "from-blue-900/20 via-transparent to-cyan-900/20",
            sidebarGradient: "from-blue-600/90 to-blue-800/90"
        },
        {
            id: 2,
            name: "Theme 3",
            preview: "./image/theme3.jpg",
            background: "./image/theme3.jpg",
            gradient: "from-orange-900/20 via-transparent to-pink-900/20",
            sidebarGradient: "from-orange-600/90 to-pink-700/90"
        },
        {
            id: 3,
            name: "Theme 4",
            preview: "./image/theme4.jpg",
            background: "./image/theme4.jpg",
            gradient: "from-green-900/20 via-transparent to-emerald-900/20",
            sidebarGradient: "from-green-600/90 to-emerald-800/90"
        }
    ];

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSaveQuestion = () => {
        if (question.trim() && answers.some(answer => answer.trim()) && correctAnswer !== null) {
            if (editingQuestionId !== null) {
                // Update existing question
                setSavedQuestions(prev => prev.map(q => 
                    q.id === editingQuestionId 
                        ? { ...q, question: question.trim(), answers: answers.filter(a => a.trim()), correctAnswer }
                        : q
                ));
                setEditingQuestionId(null);
            } else {
                // Add new question
                const newQuestion = {
                    id: questionCount,
                    question: question.trim(),
                    answers: answers.filter(a => a.trim()),
                    correctAnswer
                };
                setSavedQuestions(prev => [...prev, newQuestion]);
                setQuestionCount(prev => prev + 1);
            }
            
            // Reset form
            setQuestion('');
            setAnswers(['', '', '', '']);
            setCorrectAnswer(null);
        }
    };

    const handleEditQuestion = (questionToEdit: any) => {
        setQuestion(questionToEdit.question);
        const paddedAnswers = [...questionToEdit.answers];
        while (paddedAnswers.length < 4) {
            paddedAnswers.push('');
        }
        setAnswers(paddedAnswers);
        setCorrectAnswer(questionToEdit.correctAnswer);
        setEditingQuestionId(questionToEdit.id);
    };

    const handleDeleteQuestion = (questionId: number) => {
        setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
        if (editingQuestionId === questionId) {
            setQuestion('');
            setAnswers(['', '', '', '']);
            setCorrectAnswer(null);
            setEditingQuestionId(null);
        }
    };

    const handleCancelEdit = () => {
        setQuestion('');
        setAnswers(['', '', '', '']);
        setCorrectAnswer(null);
        setEditingQuestionId(null);
    };

    const handleClearAll = () => {
        setSavedQuestions([]);
        setQuestion('');
        setAnswers(['', '', '', '']);
        setCorrectAnswer(null);
        setQuestionCount(1);
    };

    const handleTemplateSelect = (templateId: number) => {
        setSelectedTemplate(templateId);
        setShowTemplateModal(false);
    };

    const currentTemplate = backgroundTemplates[selectedTemplate];

    return (
        <div className='backdrop-blur-md min-h-screen flex relative overflow-hidden'>
            {/* Dynamic Background */}
            <div className='absolute inset-0'>
                <img 
                    src={currentTemplate.background}
                    alt="Background" 
                    className='absolute inset-0 object-cover w-full h-full opacity-90' 
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${currentTemplate.gradient}`}></div>
            </div>
            
            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
                    <div className='bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl'>
                        <div className='flex items-center justify-between mb-8'>
                            <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-3'>
                                <Palette className='w-7 h-7 text-purple-600' />
                                Choose Background Template
                            </h2>
                            <button 
                                onClick={() => setShowTemplateModal(false)}
                                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                            >
                                <X className='w-6 h-6 text-gray-600' />
                            </button>
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {backgroundTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template.id)}
                                    className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                                        selectedTemplate === template.id 
                                            ? 'border-purple-500 shadow-lg' 
                                            : 'border-gray-200 hover:border-purple-300'
                                    }`}
                                >
                                    <div className='h-32 w-full relative'>
                                        <img 
                                            src={template.preview}
                                            alt={template.name}
                                            className='w-full h-full object-cover'
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient}`}></div>
                                    </div>
                                    <div className='p-4 bg-white'>
                                        <h3 className='font-semibold text-gray-800 text-center'>{template.name}</h3>
                                        {selectedTemplate === template.id && (
                                            <div className='flex items-center justify-center mt-2'>
                                                <CheckCircle className='w-5 h-5 text-purple-500' />
                                                <span className='text-purple-500 text-sm ml-1'>Selected</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Enhanced Left Sidebar */}
            <div className={`bg-gradient-to-b ${currentTemplate.sidebarGradient} backdrop-blur-lg p-8 shadow-2xl border border-white/30 w-1/5 relative z-10 flex flex-col`}>
                <div className='text-center mb-8 justify-center items-center flex flex-col'>
                    <a href='/dashboard'>
                        <h1 className='text-center text-4xl text-white font-bold tracking-wide'>Fun Quiz</h1>
                    </a>
                    
                    {/* Template Selection Button */}
                    <button 
                        onClick={() => setShowTemplateModal(true)}
                        className='mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold backdrop-blur-sm border border-white/30 transition-all duration-200 flex items-center gap-2'
                    >
                        <Palette className='w-4 h-4' />
                        Change Theme
                    </button>
                    
                   
                </div>
                
                {/* Questions List */}
                <div className='flex-1 overflow-y-auto mb-6'>
                    <div className='space-y-4'>
                        {savedQuestions.map((q, index) => (
                            <div 
                                key={q.id} 
                                className={`bg-gradient-to-r backdrop-blur-md p-4 rounded-xl text-white border shadow-lg transition-all duration-200 group cursor-pointer ${
                                    editingQuestionId === q.id 
                                        ? 'from-yellow-400/40 to-yellow-300/30 border-yellow-400/50 shadow-yellow-200/50' 
                                        : 'from-white/25 to-white/15 border-white/30 hover:from-white/30 hover:to-white/20'
                                }`}
                                onClick={() => handleEditQuestion(q)}
                            >
                                <div className='flex items-center justify-between mb-2'>
                                    <div className='flex items-center'>
                                        <div className={`rounded-full w-6 h-6 flex items-center justify-center mr-3 ${
                                            editingQuestionId === q.id ? 'bg-yellow-500' : 'bg-purple-500'
                                        }`}>
                                            <span className='text-white font-bold text-xs'>{index + 1}</span>
                                        </div>
                                        <span className='font-semibold text-sm'>Question {index + 1}</span>
                                    </div>
                                    <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                        {editingQuestionId === q.id && (
                                            <span className='text-yellow-300 text-xs bg-yellow-500/20 px-2 py-1 rounded-full'>
                                                Editing
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditQuestion(q);
                                            }}
                                            className='p-1 hover:bg-white/20 rounded-full transition-colors'
                                        >
                                            <Edit2 className='w-3 h-3' />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteQuestion(q.id);
                                            }}
                                            className='p-1 hover:bg-red-500/20 rounded-full transition-colors'
                                        >
                                            <Trash2 className='w-3 h-3 text-red-300' />
                                        </button>
                                    </div>
                                </div>
                                <p className='text-sm text-white/90 truncate mb-2'>{q.question}</p>
                                <div className='text-xs text-white/70'>
                                    {q.answers.length} answers • Correct: {String.fromCharCode(65 + q.correctAnswer)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='space-y-3'>
                    <button 
                        onClick={handleSaveQuestion}
                        className='w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold backdrop-blur-sm border border-purple-400 transition-all duration-200 shadow-xl flex items-center justify-center gap-2 transform hover:scale-105'
                        disabled={!question.trim() || !answers.some(a => a.trim()) || correctAnswer === null}
                    >
                        <Plus className='w-5 h-5' />
                        {editingQuestionId !== null ? 'Update Question' : 'Add Question'}
                    </button>
                    
                    {editingQuestionId !== null && (
                        <button 
                            onClick={handleCancelEdit}
                            className='w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-xl font-semibold backdrop-blur-sm border border-gray-400 transition-all duration-200 shadow-xl flex items-center justify-center gap-2 transform hover:scale-105'
                        >
                            <X className='w-5 h-5' />
                            Cancel Edit
                        </button>
                    )}
                    
                    <button 
                        className='w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold backdrop-blur-sm border border-orange-400 transition-all duration-200 shadow-xl flex items-center justify-center gap-2 transform hover:scale-105' 
                        onClick={handleClearAll}
                    >
                        <Trash2 className='w-5 h-5' />
                        Clear All
                    </button>
                    <button className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-xl transform hover:scale-105 flex items-center justify-center gap-2'>
                        <Save className='w-5 h-5' />
                        Save Quiz
                    </button>
                    <button className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-xl transform hover:scale-105 flex items-center justify-center gap-2'>
                        <Eye className='w-5 h-5' />
                        Preview
                    </button>
                </div>
            </div>

            {/* Enhanced Main Content */}
            <div className='flex-1 relative z-10'>
                {/* Question Input Section */}
                <div className='bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg p-10 shadow-2xl border border-white/40 mx-32 mt-10 rounded-2xl hover:shadow-3xl transition-all duration-300'>
                    <div className='flex items-center mb-6'>
                        <div className='bg-purple-500 rounded-full p-2 mr-4'>
                            <span className='text-white font-bold text-sm'>
                                {editingQuestionId !== null ? `Edit Q${savedQuestions.find(q => q.id === editingQuestionId)?.id || ''}` : `Q${questionCount}`}
                            </span>
                        </div>
                        <h2 className='text-xl font-semibold text-gray-700'>
                            {editingQuestionId !== null ? 'Edit Question' : 'Question'}
                        </h2>
                        {editingQuestionId !== null && (
                            <div className='ml-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium'>
                                Editing Mode
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question here..."
                        className='w-full text-center text-2xl bg-transparent outline-none placeholder-gray-400 font-medium text-gray-800 border-b-2 border-gray-200 focus:border-purple-500 transition-colors duration-200 pb-4'
                    />
                    <div className='mt-4 text-center'>
                        <span className='text-sm text-gray-500'>{question.length}/200 characters</span>
                    </div>
                </div>

                {/* Enhanced Answer Options */}
                <div className='grid grid-cols-2 gap-6 mt-12 px-32'>
                    {answers.map((answer, index) => (
                        <div key={index} className='group relative'>
                            <div className={`bg-gradient-to-br backdrop-blur-lg p-8 shadow-xl border-2 rounded-2xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer ${
                                correctAnswer === index 
                                    ? 'from-green-100/95 to-green-50/90 border-green-400 shadow-green-200' 
                                    : 'from-white/95 to-white/85 border-white/50 hover:border-purple-300'
                            }`}
                            onClick={() => setCorrectAnswer(index)}
                            >
                                <div className='flex items-center mb-4'>
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200 ${
                                        correctAnswer === index 
                                            ? 'bg-green-500 border-green-500' 
                                            : 'border-gray-300 group-hover:border-purple-400'
                                    }`}>
                                        {correctAnswer === index ? (
                                            <CheckCircle className='w-5 h-5 text-white' />
                                        ) : (
                                            <span className='text-gray-400 font-bold'>{String.fromCharCode(65 + index)}</span>
                                        )}
                                    </div>
                                    <span className={`font-semibold ${correctAnswer === index ? 'text-green-700' : 'text-gray-600'}`}>
                                        Answer {String.fromCharCode(65 + index)}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    placeholder={`Enter answer ${String.fromCharCode(65 + index)}...`}
                                    className='w-full text-center text-lg bg-transparent outline-none placeholder-gray-400 text-gray-700 font-medium'
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {correctAnswer === index && (
                                    <div className='absolute top-2 right-2'>
                                        <div className='bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
                                            Correct
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className='mt-10 px-32'>
                    <button 
                        className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl font-semibold backdrop-blur-sm border border-red-400 transition-all duration-200 shadow-xl flex items-center justify-center gap-2 transform hover:scale-105' 
                        onClick={handleClearAll}
                    >
                        <Trash2 className='w-5 h-5' />
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateQuiz;