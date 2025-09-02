"use strict";
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
exports.ReportController = void 0;
const report_repositories_1 = require("../repositories/report.repositories");
const Quiz_1 = require("../model/Quiz");
const GameSession_1 = require("../model/GameSession");
const QuestionReport_1 = require("../model/QuestionReport");
const ExcelExportService_1 = require("../service/ExcelExportService");
const MIN_REPORTS = 50;
const REPORT_PERCENTAGE = 0.7; // 70%
/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting and analytics for quizzes
 */
class ReportController {
    /**
     * @swagger
     * /api/reports/my-quizzes:
     *   get:
     *     summary: Get a list of quizzes owned by the current user for reporting
     *     tags: [Reports]
     *     responses:
     *       200:
     *         description: A list of the user's quizzes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/ReportQuizListItem'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    static getMyQuizzesForReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!creatorId)
                    return res.status(401).json({ message: "Unauthorized" });
                const quizzes = yield report_repositories_1.ReportRepository.findQuizzesByCreator(creatorId);
                return res.status(200).json(quizzes);
            }
            catch (error) {
                return res.status(500).json({ message: "Server error fetching quizzes for report." });
            }
        });
    }
    /**
     * @swagger
     * /api/reports/quiz/{quizId}:
     *   get:
     *     summary: Get aggregated analytics and recommendations for a specific quiz
     *     tags: [Reports]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the quiz
     *     responses:
     *       200:
     *         description: Detailed quiz analytics and recommendations
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/QuizAnalytics'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Quiz not found or user does not have permission
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    static getQuizAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { quizId } = req.params;
                const creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!creatorId)
                    return res.status(401).json({ message: "Unauthorized" });
                const report = yield report_repositories_1.ReportRepository.getQuizAnalytics(quizId, creatorId);
                if (!report) {
                    return res.status(404).json({ message: "Report not found or access denied" });
                }
                return res.status(200).json(report);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error generating quiz analytics." });
            }
        });
    }
    /**
     * @swagger
     * /api/reports/activity-feed:
     *   get:
     *     summary: Get paginated user activity feed (sessions played/hosted)
     *     tags: [Reports]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Number of items per page
     *       - in: query
     *         name: roleFilter
     *         schema:
     *           type: string
     *           enum: [all, host, player]
     *           default: all
     *         description: Filter activities by user's role (all, host, or player)
     *     responses:
     *       200:
     *         description: Paginated user activity feed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 activities:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ActivitySession'
     *                 total:
     *                   type: integer
     *                 page:
     *                   type: integer
     *                 totalPages:
     *                   type: integer
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Server error
     */
    static getUserActivityFeed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const page = parseInt(req.query.page, 10) || 1;
                const limit = parseInt(req.query.limit, 10) || 10;
                const roleFilter = req.query.roleFilter;
                const validFilters = ['all', 'host', 'player'];
                const filter = validFilters.includes(roleFilter) ? roleFilter : 'all';
                const activityFeedData = yield report_repositories_1.ReportRepository.fetchUserActivityFeed(userId, page, limit, filter);
                return res.status(200).json(activityFeedData);
            }
            catch (error) {
                console.error("Error fetching user activity feed:", error);
                return res.status(500).json({ message: "Server error fetching activity feed." });
            }
        });
    }
    /**
   * @swagger
   * /api/reports/quiz/{quizId}/feedback:
   *   get:
   *     summary: Get paginated feedback for a quiz
   *     tags: [Reports]
   *     parameters:
   *       - in: path
   *         name: quizId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quiz
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 5
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Paginated quiz feedback
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 feedbacks:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Feedback'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 limit:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   *                 hasNext:
   *                   type: boolean
   *                 hasPrev:
   *                   type: boolean
   *       404:
   *         description: Quiz not found or no feedback
   *       500:
   *         description: Server error
   */
    /**
     * @swagger
     * components:
     *   schemas:
     *     Feedback:
     *       type: object
     *       properties:
     *         rating:
     *           type: integer
     *           minimum: 1
     *           maximum: 5
     *           example: 4
     *         comment:
     *           type: string
     *           example: "Great quiz, but some questions were tricky!"
     */
    static getQuizFeedback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { quizId } = req.params;
                let page = parseInt(req.query.page, 10) || 1;
                let limit = parseInt(req.query.limit, 10) || 5;
                const feedbackData = yield report_repositories_1.ReportRepository.fetchQuizFeedback(quizId, page, limit);
                return res.status(200).json(feedbackData);
            }
            catch (error) {
                console.error("Error fetching user feedback:", error);
                return res.status(500).json({ message: "Server error fetching feedback." });
            }
        });
    }
    /**
   * @swagger
   * /api/reports/quiz/submit:
   *   post:
   *     summary: Submit a report for a quiz question
   *     tags: [Reports]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quizId
   *               - questionId
   *               - reason
   *             properties:
   *               quizId:
   *                 type: string
   *                 description: The ID of the quiz
   *                 example: "64f8b8a2c9f1b2d3e4f56789"
   *               questionId:
   *                 type: string
   *                 description: The ID of the question being reported
   *                 example: "64f8b8a2c9f1b2d3e4f56790"
   *               reason:
   *                 type: string
   *                 description: Reason for reporting
   *                 enum: [incorrect_answer, unclear_wording, inappropriate_content, other]
   *                 example: "incorrect_answer"
   *               comment:
   *                 type: string
   *                 description: Optional comment for the report
   *                 example: "The correct answer seems wrong based on the reference material."
   *     responses:
   *       201:
   *         description: Report submitted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Report submitted successfully. Thank you for your feedback!"
   *       400:
   *         description: Missing required fields
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Missing required fields."
   *       409:
   *         description: User already reported this question
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "You have already reported this question."
   *       500:
   *         description: Server error while submitting report
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Server error while submitting report."
   */
    static submitQuestionReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { quizId, questionId, reason, comment } = req.body;
            const reporterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!quizId || !questionId || !reason) {
                return res.status(400).json({ message: 'Missing required fields.' });
            }
            try {
                // 1. Create and save the new report
                const existingReport = yield QuestionReport_1.QuestionReportModel.findOne({ questionId, reporterId });
                if (existingReport) {
                    return res.status(409).json({ message: 'You have already reported this question.' });
                }
                const newReport = new QuestionReport_1.QuestionReportModel({
                    quizId,
                    questionId,
                    reporterId,
                    reason,
                    comment,
                });
                yield newReport.save();
                // 2. Trigger the dynamic flagging logic
                yield checkAndFlagQuestion(quizId, questionId);
                return res.status(201).json({ message: 'Report submitted successfully. Thank you for your feedback!' });
            }
            catch (error) {
                return res.status(500).json({ message: 'Server error while submitting report.' });
            }
        });
    }
    /**
  * @swagger
  * /api/reports/users:
  *   get:
  *     summary: Get paginated report statistics by user
  *     tags: [Reports]
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: query
  *         name: page
  *         schema:
  *           type: integer
  *           default: 1
  *         description: Page number for pagination
  *       - in: query
  *         name: limit
  *         schema:
  *           type: integer
  *           default: 10
  *         description: Number of items per page
  *     responses:
  *       200:
  *         description: Paginated list of users with their report count
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 data:
  *                   type: array
  *                   items:
  *                     type: object
  *                     properties:
  *                       userId:
  *                         type: string
  *                       username:
  *                         type: string
  *                       userEmail:
  *                         type: string
  *                       profileUrl:
  *                         type: string
  *                       totalReports:
  *                         type: integer
  *                 page:
  *                   type: integer
  *                 limit:
  *                   type: integer
  *                 totalDocuments:
  *                   type: integer
  *                 totalPages:
  *                   type: integer
  *                 hasNext:
  *                   type: boolean
  *                 hasPrev:
  *                   type: boolean
  *       500:
  *         description: Server error
  */
    static getReportsByUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.max(parseInt(req.query.limit) || 10, 1);
            const skip = (page - 1) * limit;
            try {
                const results = yield QuestionReport_1.QuestionReportModel.aggregate([
                    // Stage 1: Group by reporterId
                    {
                        $group: { _id: "$reporterId", totalReports: { $sum: 1 } }
                    },
                    // Stage 2: Join with users collection
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "reporterInfo"
                        }
                    },
                    // Stage 3: Unwind with preserve nulls
                    {
                        $unwind: { path: "$reporterInfo", preserveNullAndEmptyArrays: true }
                    },
                    // Stage 4: Project necessary fields
                    {
                        $project: {
                            _id: 0,
                            userId: "$_id",
                            profileUrl: "$reporterInfo.profileUrl",
                            totalReports: 1
                        }
                    },
                    // Stage 5: Sort by totalReports descending
                    { $sort: { totalReports: -1 } },
                    // Stage 6: Facet for pagination
                    {
                        $facet: {
                            metadata: [{ $count: "totalDocuments" }],
                            data: [{ $skip: skip }, { $limit: limit }]
                        }
                    }
                ]);
                const data = ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.data) || [];
                const totalDocuments = ((_c = (_b = results[0]) === null || _b === void 0 ? void 0 : _b.metadata[0]) === null || _c === void 0 ? void 0 : _c.totalDocuments) || 0;
                const totalPages = Math.ceil(totalDocuments / limit);
                return res.status(200).json({
                    data,
                    page,
                    limit,
                    totalDocuments,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                });
            }
            catch (error) {
                console.error('Error fetching reports by user:', error);
                return res.status(500).json({ message: 'Server error while fetching reports.' });
            }
        });
    }
    /**
     * @swagger
     * /api/reports/quiz/{quizId}/export:
     *   get:
     *     summary: Export quiz analytics to Excel
     *     tags: [Reports]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the quiz
     *     responses:
     *       200:
     *         description: Excel file download
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Quiz not found or access denied
     *       500:
     *         description: Server error
     */
    static exportQuizAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { quizId } = req.params;
                const creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!creatorId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const excelBuffer = yield ExcelExportService_1.ExcelExportService.exportQuizAnalytics(quizId, creatorId);
                // Get quiz info for filename
                const quiz = yield Quiz_1.QuizModel.findOne({ _id: quizId, creatorId }).select('title').exec();
                const quizTitle = (quiz === null || quiz === void 0 ? void 0 : quiz.title) || 'Quiz';
                const sanitizedTitle = quizTitle.replace(/[^a-zA-Z0-9]/g, '_');
                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `${sanitizedTitle}_Analytics_${timestamp}.xlsx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Length', excelBuffer.length);
                return res.send(excelBuffer);
            }
            catch (error) {
                console.error("Error exporting quiz analytics:", error);
                if (error instanceof Error) {
                    return res.status(404).json({ message: error.message });
                }
                return res.status(500).json({ message: 'Server error exporting quiz analytics.' });
            }
        });
    }
    /**
   * @swagger
   * /api/reports/leaderboard:
   *   get:
   *     summary: Get the system-wide player leaderboard (cached for 15 mins)
   *     tags: [Reports]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: The number of top players to retrieve.
   *     responses:
   *       200:
   *         description: An object containing the top players and the current user's rank.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 leaderboard:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/LeaderboardPlayer'
   *                 userRank:
   *                   $ref: '#/components/schemas/LeaderboardPlayer'
   *                   description: The current user's rank. Only present if the user is authenticated and not in the main leaderboard list.
   *       400:
   *         description: Invalid limit. Limit must be between 1 and 100.
   *       500:
   *         description: Server error
   *       503:
   *         description: Cache service is unavailable
   */
    static getLeaderboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const limit = parseInt(req.query.limit, 10) || 10;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the user ID from the authenticated request
                if (limit <= 0 || limit > 100) {
                    return res.status(400).json({ message: "Limit must be between 1 and 100." });
                }
                const leaderboardData = yield report_repositories_1.ReportRepository.getLeaderboardAndUserRank(limit, userId);
                return res.status(200).json(leaderboardData);
            }
            catch (error) {
                console.error("Error fetching leaderboard:", error);
                if (error instanceof Error && error.message.includes('Redis')) {
                    return res.status(503).json({ message: "Cache service is unavailable." });
                }
                return res.status(500).json({ message: "Server error fetching leaderboard." });
            }
        });
    }
}
exports.ReportController = ReportController;
/**
 * @swagger
 * components:
 *   schemas:
 *     ReportQuizListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64d8f9d3f1234a5678b90123"
 *         title:
 *           type: string
 *           example: "Basic Math Quiz"
 *         difficulty:
 *           type: string
 *           enum: [Hard, Medium, Easy]
 *           example: "Medium"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-23T07:00:00Z"
 *     Feedback:
 *       type: object
 *       properties:
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         comment:
 *           type: string
 *           example: "Good quiz but some questions were tricky."
 *     QuizAnalytics:
 *       type: object
 *       properties:
 *         quizId:
 *           type: string
 *           example: "64d8f9d3f1234a5678b90123"
 *         quizTitle:
 *           type: string
 *           example: "Basic Math Quiz"
 *         totalSessions:
 *           type: integer
 *           example: 25
 *         totalUniquePlayers:
 *           type: integer
 *           example: 20
 *         averageQuizScore:
 *           type: number
 *           format: float
 *           example: 78.5
 *         playerPerformance:
 *           type: object
 *           properties:
 *             averageCompletionRate:
 *               type: number
 *               format: float
 *               example: 0.85
 *             correctnessDistribution:
 *               type: object
 *               properties:
 *                 below50Percent:
 *                   type: integer
 *                   example: 3
 *                 between50And70Percent:
 *                   type: integer
 *                   example: 10
 *                 above70Percent:
 *                   type: integer
 *                   example: 12
 *         recommendations:
 *           type: object
 *           properties:
 *             feedback:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Unauthorized"
 */
// --- Helper function for dynamic logic ---
function checkAndFlagQuestion(quizId, questionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const totalReports = yield QuestionReport_1.QuestionReportModel.countDocuments({ questionId });
            const uniquePlayers = yield GameSession_1.GameSessionModel.distinct('results.userId', {
                quizId: quizId,
                status: 'completed'
            });
            const totalParticipants = uniquePlayers.length;
            console.log(`Checking question ${questionId}: ${totalReports} reports / ${totalParticipants} players.`);
            const requiredReports = Math.max(MIN_REPORTS, Math.ceil(totalParticipants * REPORT_PERCENTAGE));
            if (totalReports >= requiredReports) {
                yield Quiz_1.QuizModel.updateOne({ "_id": quizId, "questions._id": questionId }, { "$set": { "questions.$.status": "under_review" } });
                console.log(`Question ${questionId} automatically flagged for review.`);
            }
        }
        catch (error) {
            console.error('Error in checkAndFlagQuestion:', error);
        }
    });
}
