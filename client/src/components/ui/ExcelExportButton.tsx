import React, { useState, useRef, useEffect } from 'react';
import { ExcelExportService } from '../../service/excelExportService';
import type { ExcelExportOptions } from '../../service/excelExportService';
import { Download, ChevronDown, RefreshCcw } from 'lucide-react';

interface ExcelExportButtonProps {
    type: 'session' | 'analytics';
    sessionId?: string;
    quizId?: string;
    buttonText?: string;
    buttonClass?: string;
    showOptions?: boolean;
    disabled?: boolean;
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
    type,
    sessionId,
    quizId,
    buttonText,
    buttonClass = "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2",
    showOptions = false,
    disabled = false
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [showOptionsPanel, setShowOptionsPanel] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const [exportOptions, setExportOptions] = useState<ExcelExportOptions>({
        includeSessionOverview: false,
        includeSimpleSummary: true,
        includeDetailedAnswers: false,
        includeQuestionBreakdown: false,
        includeParticipantSummary: false
    });

    const handleExport = async () => {
        if (disabled || isExporting) return;

        try {
            setIsExporting(true);

            if (type === 'session' && sessionId) {
                await ExcelExportService.downloadSessionResults(sessionId, exportOptions);
            } else if (type === 'analytics' && quizId) {
                await ExcelExportService.downloadQuizAnalytics(quizId);
            } else {
                throw new Error('Invalid export configuration');
            }
            setShowOptionsPanel(false);
        } catch (error) {
            console.error('Export failed:', error);
            alert(error instanceof Error ? error.message : 'Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleButtonClick = () => {
        if (showOptions) {
            setShowOptionsPanel(!showOptionsPanel);
        } else {
            handleExport();
        }
    };

    const handleOptionChange = (option: keyof ExcelExportOptions) => {
        setExportOptions(prev => ({ ...prev, [option]: !prev[option] }));
    };

    const getDefaultButtonText = () => {
        if (type === 'session') return 'Export Results';
        if (type === 'analytics') return 'Export Analytics';
        return 'Export to Excel';
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setShowOptionsPanel(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!ExcelExportService.isSupported()) {
        return (
            <div className="text-sm text-gray-500">
                Excel export not supported in this browser
            </div>
        );
    }

    return (
        <div className="relative inline-block text-left" ref={exportRef}>
            <button
                onClick={handleButtonClick}
                disabled={disabled || isExporting}
                className={`${buttonClass} ${disabled || isExporting ? 'opacity-50 cursor-not-allowed' : ''} ${showOptionsPanel ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
            >
                {isExporting ? (
                    <>
                        <RefreshCcw className="animate-spin h-4 w-4" />
                        Exporting...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4" />
                        {buttonText || getDefaultButtonText()}
                        {showOptions && <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showOptionsPanel ? 'rotate-180' : 'rotate-0'}`} />}
                    </>
                )}
            </button>

            {showOptionsPanel && showOptions && (
                <div className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-4 text-sm">Choose what to include in your Excel export:</h4>
                        
                        {/* THIS IS THE FIX: The max-h-64 and overflow-y-auto classes */}
                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                            {/* Option: Session Overview */}
                            <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-150">
                                <input
                                    type="checkbox"
                                    checked={exportOptions.includeSessionOverview}
                                    onChange={() => handleOptionChange('includeSessionOverview')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Session Overview</span>
                                    <p className="text-xs text-gray-500 mt-1">Quiz information, host details, and general statistics</p>
                                </div>
                            </label>
                            {/* Option: Simple Summary (Recommended) */}
                            <label className="flex items-start cursor-pointer hover:bg-green-50 p-2 rounded-md border-2 border-green-200 transition-colors duration-150">
                                <input
                                    type="checkbox"
                                    checked={exportOptions.includeSimpleSummary}
                                    onChange={() => handleOptionChange('includeSimpleSummary')}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                                />
                                <div>
                                    <span className="text-sm font-bold text-green-700 block">📊 Simple Summary (Recommended)</span>
                                    <p className="text-xs text-green-600 mt-1 font-medium">Just participant names, scores, and correct answers count</p>
                                </div>
                            </label>
                            {/* Option: Detailed Participant Summary */}
                            <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-150">
                                <input
                                    type="checkbox"
                                    checked={exportOptions.includeParticipantSummary}
                                    onChange={() => handleOptionChange('includeParticipantSummary')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Detailed Participant Summary</span>
                                    <p className="text-xs text-gray-500 mt-1">Full rankings, scores, timing, and performance analysis</p>
                                </div>
                            </label>
                            {/* Option: Question Analysis */}
                            <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-150">
                                <input
                                    type="checkbox"
                                    checked={exportOptions.includeQuestionBreakdown}
                                    onChange={() => handleOptionChange('includeQuestionBreakdown')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Question Analysis</span>
                                    <p className="text-xs text-gray-500 mt-1">Question-by-question statistics and difficulty analysis</p>
                                </div>
                            </label>
                            {/* Option: Detailed Responses */}
                            <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-150">
                                <input
                                    type="checkbox"
                                    checked={exportOptions.includeDetailedAnswers}
                                    onChange={() => handleOptionChange('includeDetailedAnswers')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Detailed Responses</span>
                                    <p className="text-xs text-gray-500 mt-1">Individual participant answers for each question</p>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <button
                            onClick={() => setShowOptionsPanel(false)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isExporting ? (
                                <>
                                    <RefreshCcw className="animate-spin h-4 w-4" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Download
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};