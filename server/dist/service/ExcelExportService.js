"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExportService = void 0;
const XLSX = __importStar(require("xlsx"));
const game_repositories_1 = require("../repositories/game.repositories");
const GameSession_1 = require("../model/GameSession");
const Quiz_1 = require("../model/Quiz");
class ExcelExportService {
    static exportSessionResults(sessionId_1) {
        return __awaiter(this, arguments, void 0, function* (sessionId, options = {}) {
            var _a, _b, _c;
            const { includeSessionOverview = true, includeSimpleSummary = true, includeDetailedAnswers = false, includeQuestionBreakdown = false, includeParticipantSummary = false } = options;
            // Fetch session data
            const session = yield GameSession_1.GameSessionModel.findById(sessionId)
                .populate('quizId')
                .populate('hostId', 'name email')
                .exec();
            if (!session) {
                throw new Error('Session not found');
            }
            const quiz = session.quizId;
            const host = session.hostId;
            // Fetch detailed results
            const results = yield game_repositories_1.GameRepository.fetchFullSessionResults(sessionId);
            if (!results || results.length === 0) {
                throw new Error('No results found for this session');
            }
            // Create workbook
            const workbook = XLSX.utils.book_new();
            // 1. Session Overview Sheet - Only if requested
            if (includeSessionOverview) {
                const overviewData = [
                    ['QUIZ RESULTS SUMMARY', ''], // Title row
                    ['', ''],
                    ['Quiz Information', ''],
                    ['Quiz Title', quiz.title || 'N/A'],
                    ['Description', quiz.description || 'N/A'],
                    ['Difficulty Level', quiz.dificulty || 'N/A'],
                    ['Total Questions', (((_a = quiz.questions) === null || _a === void 0 ? void 0 : _a.length) || 0).toString()],
                    ['', ''],
                    ['Session Information', ''],
                    ['Session ID', sessionId],
                    ['Host Name', (host === null || host === void 0 ? void 0 : host.name) || 'N/A'],
                    ['Host Email', (host === null || host === void 0 ? void 0 : host.email) || 'N/A'],
                    ['Game Mode', session.mode || 'N/A'],
                    ['Status', session.status || 'N/A'],
                    ['Started At', session.startedAt ? new Date(session.startedAt).toLocaleString() : 'N/A'],
                    ['Ended At', session.endedAt ? new Date(session.endedAt).toLocaleString() : 'N/A'],
                    ['', ''],
                    ['Performance Statistics', ''],
                    ['Total Participants', results.length.toString()],
                    ['Average Score', this.calculateAverageScore(results)],
                    ['Highest Score', this.getHighestScore(results)],
                    ['Lowest Score', this.getLowestScore(results)],
                    ['Completion Rate', this.calculateCompletionRate(results, ((_b = quiz.questions) === null || _b === void 0 ? void 0 : _b.length) || 0)]
                ];
                const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
                // Format the overview sheet
                this.formatOverviewSheet(overviewSheet);
                XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Session Overview');
            }
            // 2. Simple Summary Sheet (Clean & Easy to Read)
            if (includeSimpleSummary) {
                const simpleSummaryData = [
                    ['Rank', 'Participant Name', 'Score', 'Correct Answers', 'Total Questions', 'Percentage']
                ];
                results
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .forEach((participant, index) => {
                    var _a, _b;
                    const score = participant.score || 0;
                    const correctAnswers = ((_a = participant.detailedPerformance) === null || _a === void 0 ? void 0 : _a.filter(p => p.wasUltimatelyCorrect).length) || 0;
                    const totalQuestions = ((_b = quiz.questions) === null || _b === void 0 ? void 0 : _b.length) || 0;
                    const percentage = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) + '%' : '0%';
                    simpleSummaryData.push([
                        (index + 1).toString(), // Rank
                        participant.name || 'Anonymous',
                        score.toString(),
                        correctAnswers.toString(),
                        totalQuestions.toString(),
                        percentage
                    ]);
                });
                const simpleSummarySheet = XLSX.utils.aoa_to_sheet(simpleSummaryData);
                // Format the simple summary sheet
                this.formatSimpleSummarySheet(simpleSummarySheet, simpleSummaryData.length);
                XLSX.utils.book_append_sheet(workbook, simpleSummarySheet, 'Simple Summary');
            }
            // 3. Participant Summary Sheet
            if (includeParticipantSummary) {
                const participantData = [
                    ['Rank', 'Name', 'User ID', 'Final Score', 'Questions Answered', 'Correct Answers', 'Accuracy (%)', 'Average Response Time (s)']
                ];
                results
                    .sort((a, b) => b.score - a.score)
                    .forEach((participant, index) => {
                    var _a, _b, _c;
                    const correctAnswers = ((_a = participant.detailedPerformance) === null || _a === void 0 ? void 0 : _a.filter(p => p.wasUltimatelyCorrect).length) || 0;
                    const totalAnswers = ((_b = participant.detailedPerformance) === null || _b === void 0 ? void 0 : _b.length) || 0;
                    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers * 100).toFixed(1) : '0';
                    const avgResponseTime = ((_c = participant.detailedPerformance) === null || _c === void 0 ? void 0 : _c.length) > 0
                        ? (participant.detailedPerformance.reduce((sum, p) => sum + (p.thinkingTimeSeconds || 0), 0) / participant.detailedPerformance.length).toFixed(2)
                        : '0';
                    participantData.push([
                        (index + 1).toString(),
                        participant.name,
                        participant.participantId || 'Guest',
                        participant.score.toString(),
                        totalAnswers.toString(),
                        correctAnswers.toString(),
                        accuracy,
                        avgResponseTime
                    ]);
                });
                const participantSheet = XLSX.utils.aoa_to_sheet(participantData);
                XLSX.utils.book_append_sheet(workbook, participantSheet, 'Participant Summary');
            }
            // 4. Question Breakdown Sheet
            if (includeQuestionBreakdown) {
                const questionData = [
                    ['Question #', 'Question Text', 'Correct Answer', 'Total Responses', 'Correct Count', 'Incorrect Count', 'Success Rate %', 'Avg Response Time (s)']
                ];
                (_c = quiz.questions) === null || _c === void 0 ? void 0 : _c.forEach((question, index) => {
                    var _a, _b;
                    const questionResponses = results.flatMap(r => { var _a; return ((_a = r.detailedPerformance) === null || _a === void 0 ? void 0 : _a.filter(p => { var _a; return p.questionId === ((_a = question._id) === null || _a === void 0 ? void 0 : _a.toString()); })) || []; });
                    const totalResponses = questionResponses.length;
                    const correctCount = questionResponses.filter(p => p.wasUltimatelyCorrect).length;
                    const incorrectCount = totalResponses - correctCount;
                    const successRate = totalResponses > 0 ? ((correctCount / totalResponses) * 100).toFixed(1) : '0';
                    const avgResponseTime = questionResponses.length > 0
                        ? (questionResponses.reduce((sum, p) => sum + (p.thinkingTimeSeconds || 0), 0) / questionResponses.length).toFixed(2)
                        : '0';
                    const correctAnswerText = ((_b = (_a = question.answers) === null || _a === void 0 ? void 0 : _a.find((a) => a.isCorrect)) === null || _b === void 0 ? void 0 : _b.text) || 'N/A';
                    questionData.push([
                        (index + 1).toString(),
                        question.question || 'N/A',
                        correctAnswerText,
                        totalResponses.toString(),
                        correctCount.toString(),
                        incorrectCount.toString(),
                        successRate + '%',
                        avgResponseTime
                    ]);
                });
                const questionSheet = XLSX.utils.aoa_to_sheet(questionData);
                this.formatQuestionBreakdownSheet(questionSheet, questionData.length);
                XLSX.utils.book_append_sheet(workbook, questionSheet, 'Question Analysis');
            }
            // 5. Detailed Answers Sheet
            if (includeDetailedAnswers) {
                const detailedData = [
                    ['Participant', 'Question #', 'Question Text', 'Participant Answer', 'Correct Answer', 'Is Correct', 'Response Time (s)', 'Points Earned']
                ];
                results.forEach(participant => {
                    var _a;
                    (_a = participant.detailedPerformance) === null || _a === void 0 ? void 0 : _a.forEach(performance => {
                        var _a, _b, _c, _d, _e;
                        const question = (_a = quiz.questions) === null || _a === void 0 ? void 0 : _a.find((q) => { var _a; return ((_a = q._id) === null || _a === void 0 ? void 0 : _a.toString()) === performance.questionId; });
                        const participantAnswer = performance.selectedOptionText || 'No Answer';
                        const correctAnswer = ((_c = (_b = question === null || question === void 0 ? void 0 : question.answers) === null || _b === void 0 ? void 0 : _b.find((a) => a.isCorrect)) === null || _c === void 0 ? void 0 : _c.text) || 'N/A';
                        const questionNumber = ((_d = quiz.questions) === null || _d === void 0 ? void 0 : _d.findIndex((q) => { var _a; return ((_a = q._id) === null || _a === void 0 ? void 0 : _a.toString()) === performance.questionId; })) + 1;
                        detailedData.push([
                            participant.name || 'Anonymous',
                            questionNumber.toString() || '?',
                            performance.questionText || 'N/A',
                            participantAnswer,
                            correctAnswer,
                            performance.wasUltimatelyCorrect ? 'Yes' : 'No',
                            (performance.thinkingTimeSeconds || 0).toFixed(2),
                            ((_e = performance.finalScoreGained) === null || _e === void 0 ? void 0 : _e.toString()) || '0'
                        ]);
                    });
                });
                const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
                this.formatDetailedAnswersSheet(detailedSheet, detailedData.length);
                XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Responses');
            }
            // Generate buffer
            const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return excelBuffer;
        });
    }
    static exportQuizAnalytics(quizId, creatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield Quiz_1.QuizModel.findOne({ _id: quizId, creatorId }).exec();
            if (!quiz) {
                throw new Error('Quiz not found or access denied');
            }
            const sessions = yield GameSession_1.GameSessionModel.find({
                quizId,
                status: 'completed'
            })
                .populate('hostId', 'name email')
                .sort({ createdAt: -1 })
                .exec();
            if (sessions.length === 0) {
                throw new Error('No completed sessions found for this quiz');
            }
            const workbook = XLSX.utils.book_new();
            const overviewData = [
                ['Quiz Analytics Report'],
                ['Generated on', new Date().toISOString()],
                [],
                ['Quiz Information'],
                ['Title', quiz.title],
                ['Description', quiz.description || 'N/A'],
                ['Difficulty', quiz.dificulty],
                ['Total Questions', quiz.questions.length.toString()],
                ['Created', quiz.createdAt.toISOString()],
                [],
                ['Session Statistics'],
                ['Total Sessions', sessions.length.toString()],
                ['Total Participants', this.getTotalParticipants(sessions).toString()]
            ];
            const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
            XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Quiz Overview');
            return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        });
    }
    static calculateAverageScore(results) {
        if (results.length === 0)
            return '0.00';
        const total = results.reduce((sum, r) => sum + r.score, 0);
        return (total / results.length).toFixed(2);
    }
    static getHighestScore(results) {
        if (results.length === 0)
            return '0';
        return Math.max(...results.map(r => r.score)).toString();
    }
    static getLowestScore(results) {
        if (results.length === 0)
            return '0';
        return Math.min(...results.map(r => r.score)).toString();
    }
    static calculateCompletionRate(results, totalQuestions) {
        if (results.length === 0 || totalQuestions === 0)
            return '0%';
        const totalAnswered = results.reduce((sum, r) => { var _a; return sum + (((_a = r.detailedPerformance) === null || _a === void 0 ? void 0 : _a.length) || 0); }, 0);
        const totalPossible = results.length * totalQuestions;
        return ((totalAnswered / totalPossible) * 100).toFixed(1) + '%';
    }
    static getTotalParticipants(sessions) {
        return sessions.reduce((sum, session) => sum + session.results.length, 0);
    }
    // Helper methods for Excel formatting
    static formatSimpleSummarySheet(sheet, rowCount) {
        // Set column widths for simple summary
        sheet['!cols'] = [
            { wch: 6 }, // Rank
            { wch: 25 }, // Participant Name
            { wch: 8 }, // Score
            { wch: 15 }, // Correct Answers
            { wch: 15 }, // Total Questions
            { wch: 12 } // Percentage
        ];
        // Style header row with green theme
        for (let col = 0; col < 6; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
            if (sheet[cellRef]) {
                sheet[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                    fill: { fgColor: { rgb: "22C55E" } }, // Green header
                    alignment: { horizontal: 'center' },
                    border: {
                        top: { style: 'medium' },
                        bottom: { style: 'medium' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                };
            }
        }
        // Add borders and styling to data rows
        for (let row = 1; row < rowCount; row++) {
            for (let col = 0; col < 6; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (sheet[cellRef]) {
                    if (!sheet[cellRef].s)
                        sheet[cellRef].s = {};
                    // Alternating row colors
                    const fillColor = row % 2 === 1 ? "F0FDF4" : "FFFFFF"; // Light green alternating
                    sheet[cellRef].s.fill = { fgColor: { rgb: fillColor } };
                    // Borders
                    sheet[cellRef].s.border = {
                        top: { style: 'thin', color: { rgb: "D1D5DB" } },
                        bottom: { style: 'thin', color: { rgb: "D1D5DB" } },
                        left: { style: 'thin', color: { rgb: "D1D5DB" } },
                        right: { style: 'thin', color: { rgb: "D1D5DB" } }
                    };
                    // Center align rank, score, and percentage columns
                    if (col === 0 || col === 2 || col === 5) {
                        sheet[cellRef].s.alignment = { horizontal: 'center' };
                    }
                    // Bold font for top 3 performers
                    if (row <= 3) {
                        sheet[cellRef].s.font = { bold: true, color: { rgb: "15803D" } }; // Dark green for top performers
                    }
                }
            }
        }
    }
    static formatOverviewSheet(sheet) {
        // Set column widths
        sheet['!cols'] = [
            { wch: 25 }, // Column A (labels)
            { wch: 35 } // Column B (values)
        ];
        // Style the title row (A1)
        if (sheet['A1']) {
            sheet['A1'].s = {
                font: { bold: true, sz: 16, color: { rgb: "1F4E79" } },
                alignment: { horizontal: 'center' },
                fill: { fgColor: { rgb: "E7F3FF" } }
            };
        }
        // Style section headers
        const sectionHeaders = ['A3', 'A9', 'A18'];
        sectionHeaders.forEach(cell => {
            if (sheet[cell]) {
                sheet[cell].s = {
                    font: { bold: true, sz: 12, color: { rgb: "1F4E79" } },
                    fill: { fgColor: { rgb: "F2F8FF" } }
                };
            }
        });
        // Add borders to all non-empty cells
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:B25');
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (sheet[cellRef]) {
                    if (!sheet[cellRef].s)
                        sheet[cellRef].s = {};
                    sheet[cellRef].s.border = {
                        top: { style: 'thin', color: { rgb: "D0D0D0" } },
                        bottom: { style: 'thin', color: { rgb: "D0D0D0" } },
                        left: { style: 'thin', color: { rgb: "D0D0D0" } },
                        right: { style: 'thin', color: { rgb: "D0D0D0" } }
                    };
                }
            }
        }
    }
    static formatParticipantSheet(sheet, rowCount) {
        // Set column widths
        sheet['!cols'] = [
            { wch: 6 }, // Rank
            { wch: 20 }, // Player Name
            { wch: 25 }, // Email
            { wch: 8 }, // Score
            { wch: 12 }, // Percentage
            { wch: 12 }, // Correct
            { wch: 12 }, // Incorrect
            { wch: 15 }, // Time Taken
            { wch: 18 }, // Join Time
            { wch: 15 } // Performance Level
        ];
        // Style header row
        for (let col = 0; col < 10; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
            if (sheet[cellRef]) {
                sheet[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4472C4" } },
                    alignment: { horizontal: 'center' },
                    border: {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                };
            }
        }
        // Add borders and alternating row colors
        for (let row = 0; row < rowCount; row++) {
            const isEvenRow = row % 2 === 0;
            const fillColor = isEvenRow ? "FFFFFF" : "F8F9FA";
            for (let col = 0; col < 10; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (sheet[cellRef]) {
                    if (!sheet[cellRef].s)
                        sheet[cellRef].s = {};
                    sheet[cellRef].s.border = {
                        top: { style: 'thin', color: { rgb: "D0D0D0" } },
                        bottom: { style: 'thin', color: { rgb: "D0D0D0" } },
                        left: { style: 'thin', color: { rgb: "D0D0D0" } },
                        right: { style: 'thin', color: { rgb: "D0D0D0" } }
                    };
                    if (row > 0) { // Don't override header row fill
                        sheet[cellRef].s.fill = { fgColor: { rgb: fillColor } };
                    }
                    // Center align rank and score columns
                    if (col === 0 || col === 3 || col === 4) {
                        sheet[cellRef].s.alignment = { horizontal: 'center' };
                    }
                }
            }
        }
    }
    static formatQuestionBreakdownSheet(sheet, rowCount) {
        // Set column widths for question breakdown
        sheet['!cols'] = [
            { wch: 10 }, // Question #
            { wch: 40 }, // Question Text
            { wch: 25 }, // Correct Answer
            { wch: 15 }, // Total Responses
            { wch: 15 }, // Correct Count
            { wch: 15 }, // Incorrect Count
            { wch: 15 }, // Success Rate %
            { wch: 18 } // Avg Response Time
        ];
        // Style header row with blue theme
        for (let col = 0; col < 8; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
            if (sheet[cellRef]) {
                sheet[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                    fill: { fgColor: { rgb: "3B82F6" } }, // Blue header
                    alignment: { horizontal: 'center' },
                    border: {
                        top: { style: 'medium' },
                        bottom: { style: 'medium' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                };
            }
        }
        // Add borders and styling to data rows
        for (let row = 1; row < rowCount; row++) {
            for (let col = 0; col < 8; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (sheet[cellRef]) {
                    if (!sheet[cellRef].s)
                        sheet[cellRef].s = {};
                    // Alternating row colors
                    const fillColor = row % 2 === 1 ? "EFF6FF" : "FFFFFF"; // Light blue alternating
                    sheet[cellRef].s.fill = { fgColor: { rgb: fillColor } };
                    // Borders
                    sheet[cellRef].s.border = {
                        top: { style: 'thin', color: { rgb: "D1D5DB" } },
                        bottom: { style: 'thin', color: { rgb: "D1D5DB" } },
                        left: { style: 'thin', color: { rgb: "D1D5DB" } },
                        right: { style: 'thin', color: { rgb: "D1D5DB" } }
                    };
                    // Center align question #, counts, and percentages
                    if (col === 0 || col === 3 || col === 4 || col === 5 || col === 6 || col === 7) {
                        sheet[cellRef].s.alignment = { horizontal: 'center' };
                    }
                }
            }
        }
    }
    static formatDetailedAnswersSheet(sheet, rowCount) {
        // Set column widths for detailed answers
        sheet['!cols'] = [
            { wch: 20 }, // Participant
            { wch: 10 }, // Question #
            { wch: 35 }, // Question Text
            { wch: 25 }, // Participant Answer
            { wch: 25 }, // Correct Answer
            { wch: 12 }, // Is Correct
            { wch: 15 }, // Response Time
            { wch: 12 } // Points Earned
        ];
        // Style header row with purple theme
        for (let col = 0; col < 8; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
            if (sheet[cellRef]) {
                sheet[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                    fill: { fgColor: { rgb: "7C3AED" } }, // Purple header
                    alignment: { horizontal: 'center' },
                    border: {
                        top: { style: 'medium' },
                        bottom: { style: 'medium' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                };
            }
        }
        // Add borders and styling to data rows
        for (let row = 1; row < rowCount; row++) {
            for (let col = 0; col < 8; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (sheet[cellRef]) {
                    if (!sheet[cellRef].s)
                        sheet[cellRef].s = {};
                    // Alternating row colors
                    const fillColor = row % 2 === 1 ? "F3E8FF" : "FFFFFF"; // Light purple alternating
                    sheet[cellRef].s.fill = { fgColor: { rgb: fillColor } };
                    // Borders
                    sheet[cellRef].s.border = {
                        top: { style: 'thin', color: { rgb: "D1D5DB" } },
                        bottom: { style: 'thin', color: { rgb: "D1D5DB" } },
                        left: { style: 'thin', color: { rgb: "D1D5DB" } },
                        right: { style: 'thin', color: { rgb: "D1D5DB" } }
                    };
                    // Center align question #, is correct, time, and points
                    if (col === 1 || col === 5 || col === 6 || col === 7) {
                        sheet[cellRef].s.alignment = { horizontal: 'center' };
                    }
                    // Color code the "Is Correct" column
                    if (col === 5 && sheet[cellRef].v === 'Yes') {
                        sheet[cellRef].s.font = { bold: true, color: { rgb: "16A34A" } }; // Green for correct
                    }
                    else if (col === 5 && sheet[cellRef].v === 'No') {
                        sheet[cellRef].s.font = { bold: true, color: { rgb: "DC2626" } }; // Red for incorrect
                    }
                }
            }
        }
    }
}
exports.ExcelExportService = ExcelExportService;
