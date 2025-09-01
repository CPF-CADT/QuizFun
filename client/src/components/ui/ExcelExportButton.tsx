import React, { useState } from 'react';
import { ExcelExportService } from '../../service/excelExportService';
import type { ExcelExportOptions } from '../../service/excelExportService';

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
    const [exportOptions, setExportOptions] = useState<ExcelExportOptions>({
        includeSessionOverview: true,
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

        } catch (error) {
            console.error('Export failed:', error);
            alert(error instanceof Error ? error.message : 'Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleQuickExport = () => {
        if (showOptions) {
            setShowOptionsPanel(true);
        } else {
            handleExport();
        }
    };

    const getDefaultButtonText = () => {
        if (type === 'session') return 'Export Results';
        if (type === 'analytics') return 'Export Analytics';
        return 'Export to Excel';
    };

    if (!ExcelExportService.isSupported()) {
        return (
            <div className="text-sm text-gray-500">
                Excel export not supported in this browser
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={handleQuickExport}
                disabled={disabled || isExporting}
                className={`${buttonClass} ${disabled || isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isExporting ? (
                    <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Exporting...
                    </>
                ) : (
                    <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        {buttonText || getDefaultButtonText()}
                    </>
                )}
            </button>

            {/* Options Panel */}
            {showOptionsPanel && type === 'session' && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
                    <h4 className="font-semibold text-gray-800 mb-4 text-sm">Choose what to include in your Excel export:</h4>
                    
                    <div className="space-y-3">
                        <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeSessionOverview}
                                onChange={(e) => setExportOptions((prev: ExcelExportOptions) => ({
                                    ...prev,
                                    includeSessionOverview: e.target.checked
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 block">Session Overview</span>
                                <p className="text-xs text-gray-500 mt-1">Quiz information, host details, and general statistics</p>
                            </div>
                        </label>

                        <label className="flex items-start cursor-pointer hover:bg-green-50 p-2 rounded-md border-2 border-green-200">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeSimpleSummary}
                                onChange={(e) => setExportOptions((prev: ExcelExportOptions) => ({
                                    ...prev,
                                    includeSimpleSummary: e.target.checked
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                            />
                            <div>
                                <span className="text-sm font-bold text-green-700 block">📊 Simple Summary (Recommended)</span>
                                <p className="text-xs text-green-600 mt-1 font-medium">Just participant names, scores, and correct answers count</p>
                            </div>
                        </label>

                        <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeParticipantSummary}
                                onChange={(e) => setExportOptions((prev: ExcelExportOptions) => ({
                                    ...prev,
                                    includeParticipantSummary: e.target.checked
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 block">Detailed Participant Summary</span>
                                <p className="text-xs text-gray-500 mt-1">Full rankings, scores, timing, and performance analysis</p>
                            </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeQuestionBreakdown}
                                onChange={(e) => setExportOptions((prev: ExcelExportOptions) => ({
                                    ...prev,
                                    includeQuestionBreakdown: e.target.checked
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 block">Question Analysis</span>
                                <p className="text-xs text-gray-500 mt-1">Question-by-question statistics and difficulty analysis</p>
                            </div>
                        </label>
                        
                        <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeDetailedAnswers}
                                onChange={(e) => setExportOptions((prev: ExcelExportOptions) => ({
                                    ...prev,
                                    includeDetailedAnswers: e.target.checked
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5 mr-3 flex-shrink-0"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 block">Detailed Responses</span>
                                <p className="text-xs text-gray-500 mt-1">Individual participant answers for each question</p>
                            </div>
                        </label>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => setShowOptionsPanel(false)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2-2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    Export Excel
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop for options panel */}
            {showOptionsPanel && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOptionsPanel(false)}
                />
            )}
        </div>
    );
};
