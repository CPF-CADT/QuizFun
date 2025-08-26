import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { quizApi } from '../../service/quizApi';
import type { IQuestion, Dificulty } from '../../types/quiz';

interface PDFImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: (quiz: any) => void;
}

interface ImportedData {
    questions: Omit<IQuestion, '_id'>[];
    title?: string;
    errors: string[];
}

export const PDFImportModal: React.FC<PDFImportModalProps> = ({
    isOpen,
    onClose,
    onImportSuccess
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [importedData, setImportedData] = useState<ImportedData | null>(null);
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
    
    // Quiz creation form data
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('private');
    const [difficulty, setDifficulty] = useState<Dificulty>('Medium');

    const resetState = () => {
        setFile(null);
        setImportedData(null);
        setQuizTitle('');
        setQuizDescription('');
        setVisibility('private');
        setDifficulty('Medium');
    };

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile.type !== 'application/pdf') {
            alert('Please select a PDF file');
            return;
        }
        
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        // Auto-fill title from filename if not set
        if (!quizTitle) {
            const fileName = selectedFile.name.replace('.pdf', '');
            setQuizTitle(fileName);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            handleFileSelect(droppedFiles[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFileSelect(selectedFiles[0]);
        }
    };

    const uploadAndParsePDF = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await quizApi.importPDF(file);
            setImportedData(response.data.data);
        } catch (error: any) {
            console.error('Error uploading PDF:', error);
            alert(error.response?.data?.message || 'Failed to process PDF file');
        } finally {
            setIsUploading(false);
        }
    };

    const createQuizFromImport = async () => {
        if (!importedData || !quizTitle.trim()) return;

        setIsCreatingQuiz(true);
        try {
            const response = await quizApi.createQuizFromImport({
                title: quizTitle.trim(),
                description: quizDescription.trim() || undefined,
                visibility,
                dificulty: difficulty,
                questions: importedData.questions
            });

            onImportSuccess(response.data.data);
            onClose();
            resetState();
        } catch (error: any) {
            console.error('Error creating quiz:', error);
            alert(error.response?.data?.message || 'Failed to create quiz');
        } finally {
            setIsCreatingQuiz(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Import Quiz from PDF</h2>
                        <button
                            onClick={() => {
                                onClose();
                                resetState();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Step 1: File Upload */}
                    {!importedData && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Upload PDF File</h3>
                                <p className="text-gray-600 mb-4">
                                    Upload a PDF containing quiz questions. Supported formats:
                                </p>
                                <div className="text-sm text-gray-500 space-y-1 mb-6">
                                    <p>• Q1: Question? A) Option B) Option Answer: A</p>
                                    <p>• 1. Question? a) Option b) Option Correct Answer: a</p>
                                </div>
                            </div>

                            {/* File Drop Zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    isDragging
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Drop your PDF file here
                                </p>
                                <p className="text-gray-600 mb-4">or</p>
                                <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer inline-block">
                                    Choose File
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileInput}
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
                                        onClick={uploadAndParsePDF}
                                        disabled={isUploading}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? 'Processing...' : 'Parse PDF'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Review and Create Quiz */}
                    {importedData && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Review and Create Quiz</h3>
                            </div>

                            {/* Import Results */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="font-medium text-gray-900">
                                        {importedData.questions.length} questions found
                                    </span>
                                </div>
                                
                                {importedData.errors.length > 0 && (
                                    <div className="mt-3">
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                                            <span className="font-medium text-orange-900">Warnings:</span>
                                        </div>
                                        <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                                            {importedData.errors.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Quiz Creation Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quiz Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter quiz title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as Dificulty)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={quizDescription}
                                        onChange={(e) => setQuizDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter quiz description"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Visibility
                                    </label>
                                    <select
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="private">Private</option>
                                        <option value="public">Public</option>
                                    </select>
                                </div>
                            </div>

                            {/* Questions Preview */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Questions Preview (First 3)</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {importedData.questions.slice(0, 3).map((question, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <p className="font-medium text-gray-900 mb-2">
                                                {index + 1}. {question.questionText}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {question.options.map((option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-2 rounded text-sm ${
                                                            option.isCorrect
                                                                ? 'bg-green-100 text-green-800 font-medium'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {String.fromCharCode(65 + optIndex)}) {option.text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {importedData.questions.length > 3 && (
                                        <p className="text-sm text-gray-600 text-center">
                                            ... and {importedData.questions.length - 3} more questions
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => {
                                        setImportedData(null);
                                        setFile(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Upload Different File
                                </button>
                                <button
                                    onClick={createQuizFromImport}
                                    disabled={!quizTitle.trim() || isCreatingQuiz}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreatingQuiz ? 'Creating Quiz...' : 'Create Quiz'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
