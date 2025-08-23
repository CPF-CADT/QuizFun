import React, { useState } from 'react';
import { FileText, Upload, X, Plus } from 'lucide-react';
import { quizApi } from '../../service/quizApi';
import type { IQuestion } from '../../types/quiz';

interface PDFImportForQuizProps {
    quizId: string;
    onQuestionsImported: () => void;
}

export const PDFImportForQuiz: React.FC<PDFImportForQuizProps> = ({
    quizId,
    onQuestionsImported
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedQuestions, setParsedQuestions] = useState<Omit<IQuestion, '_id'>[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isAddingQuestions, setIsAddingQuestions] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            alert('Please select a PDF file');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
    };

    const parsePDF = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await quizApi.importPDF(file);
            setParsedQuestions(response.data.data.questions);
            setErrors(response.data.data.errors);
        } catch (error: any) {
            console.error('Error parsing PDF:', error);
            alert(error.response?.data?.message || 'Failed to parse PDF');
        } finally {
            setIsUploading(false);
        }
    };

    const addQuestionsToQuiz = async () => {
        if (parsedQuestions.length === 0) return;

        setIsAddingQuestions(true);
        try {
            // Add questions one by one
            for (const question of parsedQuestions) {
                await quizApi.addQuestionToQuiz(quizId, question);
            }
            
            onQuestionsImported();
            setIsOpen(false);
            resetState();
        } catch (error: any) {
            console.error('Error adding questions:', error);
            alert(error.response?.data?.message || 'Failed to add questions');
        } finally {
            setIsAddingQuestions(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setParsedQuestions([]);
        setErrors([]);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-xl flex items-center justify-center gap-2 transform hover:scale-105'
            >
                <FileText className='w-5 h-5' />
                Import from PDF
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Import Questions from PDF</h3>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        resetState();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {!parsedQuestions.length ? (
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-600 mb-4">
                                            Select a PDF file containing quiz questions
                                        </p>
                                        <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer inline-block">
                                            Choose PDF File
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {file && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <FileText className="h-8 w-8 text-red-600 mr-3" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={parsePDF}
                                                disabled={isUploading}
                                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {isUploading ? 'Processing...' : 'Parse PDF'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800 font-medium">
                                            Found {parsedQuestions.length} questions to import
                                        </p>
                                        {errors.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-orange-800 text-sm font-medium">Warnings:</p>
                                                <ul className="list-disc list-inside text-sm text-orange-700">
                                                    {errors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="max-h-60 overflow-y-auto space-y-3">
                                        {parsedQuestions.slice(0, 3).map((question, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                <p className="font-medium text-gray-900 mb-2">
                                                    {index + 1}. {question.questionText}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {question.options.map((option, optIndex) => (
                                                        <div
                                                            key={optIndex}
                                                            className={`p-2 rounded text-sm ${
                                                                option.isCorrect
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            {String.fromCharCode(65 + optIndex)}) {option.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {parsedQuestions.length > 3 && (
                                            <p className="text-center text-gray-600 text-sm">
                                                ... and {parsedQuestions.length - 3} more questions
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            onClick={() => {
                                                setParsedQuestions([]);
                                                setErrors([]);
                                                setFile(null);
                                            }}
                                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Upload Different File
                                        </button>
                                        <button
                                            onClick={addQuestionsToQuiz}
                                            disabled={isAddingQuestions}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Plus size={16} />
                                            {isAddingQuestions ? 'Adding...' : `Add ${parsedQuestions.length} Questions`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
