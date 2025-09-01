import { saveAs } from 'file-saver';
import { apiClient } from './api';

export interface ExcelExportOptions {
    includeSessionOverview?: boolean;
    includeSimpleSummary?: boolean;
    includeDetailedAnswers?: boolean;
    includeQuestionBreakdown?: boolean;
    includeParticipantSummary?: boolean;
}

export class ExcelExportService {
    /**
     * Download session results as Excel file
     */
    static async downloadSessionResults(
        sessionId: string, 
        options: ExcelExportOptions = {}
    ): Promise<void> {
        try {
            const queryParams = new URLSearchParams();
            
            if (options.includeSessionOverview !== undefined) {
                queryParams.append('includeSessionOverview', options.includeSessionOverview.toString());
            }
            if (options.includeSimpleSummary !== undefined) {
                queryParams.append('includeSimpleSummary', options.includeSimpleSummary.toString());
            }
            if (options.includeDetailedAnswers !== undefined) {
                queryParams.append('includeDetailedAnswers', options.includeDetailedAnswers.toString());
            }
            if (options.includeQuestionBreakdown !== undefined) {
                queryParams.append('includeQuestionBreakdown', options.includeQuestionBreakdown.toString());
            }
            if (options.includeParticipantSummary !== undefined) {
                queryParams.append('includeParticipantSummary', options.includeParticipantSummary.toString());
            }

            const url = `/session/${sessionId}/export${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await apiClient.get(url, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            // Extract filename from response headers
            const contentDisposition = response.headers['content-disposition'];
            let filename = `quiz_results_${sessionId}_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create blob and download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            
            saveAs(blob, filename);
            
        } catch (error) {
            console.error('Error downloading session results:', error);
            throw new Error('Failed to download session results. Please try again.');
        }
    }

    /**
     * Download quiz analytics as Excel file
     */
    static async downloadQuizAnalytics(quizId: string): Promise<void> {
        try {
            const response = await apiClient.get(`/reports/quiz/${quizId}/export`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            // Extract filename from response headers
            const contentDisposition = response.headers['content-disposition'];
            let filename = `quiz_analytics_${quizId}_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create blob and download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            
            saveAs(blob, filename);
            
        } catch (error) {
            console.error('Error downloading quiz analytics:', error);
            throw new Error('Failed to download quiz analytics. Please try again.');
        }
    }

    /**
     * Check if Excel export is supported by the browser
     */
    static isSupported(): boolean {
        return typeof Blob !== 'undefined' && typeof URL !== 'undefined';
    }
}
