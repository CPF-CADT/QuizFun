import { Request, Response } from "express";
import { IActivityFeedResponse, ReportRepository } from "../repositories/report.repositories";

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting and analytics for quizzes
 */
export class ReportController {
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
  static async getMyQuizzesForReport(req: Request, res: Response): Promise<Response> {
    try {
      const creatorId = (req as any).user?.id;
      if (!creatorId) return res.status(401).json({ message: "Unauthorized" });

      const quizzes = await ReportRepository.findQuizzesByCreator(creatorId);
      return res.status(200).json(quizzes);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching quizzes for report." });
    }
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
  static async getQuizAnalytics(req: Request, res: Response): Promise<Response> {
    try {
      const { quizId } = req.params;
      const creatorId = req.user?.id;
      if (!creatorId) return res.status(401).json({ message: "Unauthorized" });

      const report = await ReportRepository.getQuizAnalytics(quizId, creatorId);
      if (!report) {
        return res.status(404).json({ message: "Report not found or access denied" });
      }

      return res.status(200).json(report);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error generating quiz analytics." });
    }
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

  static async getUserActivityFeed(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Authenticate the user (this part is good)
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // 2. Sanitize and validate query parameters
      let page = parseInt(req.query.page as string, 10);
      let limit = parseInt(req.query.limit as string, 10);

      // Set default values and ensure they are positive
      if (isNaN(page) || page < 1) {
        page = 1;
      }
      if (isNaN(limit) || limit < 1 || limit > 50) { // Added a max limit
        limit = 5;
      }

      const activityFeedData: IActivityFeedResponse = await ReportRepository.fetchUserActivityFeed(userId, page, limit);

      // 4. Simply return the data from the repository
      return res.status(200).json(activityFeedData);

    } catch (error) {
      console.error("Error fetching user activity feed:", error);
      return res.status(500).json({ message: "Server error fetching activity feed." });
    }
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


  static async getQuizFeedback(req: Request, res: Response): Promise<Response> {
    try {
      const { quizId } = req.params;
      let page = parseInt(req.query.page as string, 10) || 1;
      let limit = parseInt(req.query.limit as string, 10) || 5;

      const feedbackData = await ReportRepository.fetchQuizFeedback(quizId, page, limit);

      return res.status(200).json(feedbackData);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      return res.status(500).json({ message: "Server error fetching feedback." });
    }
  }
}


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
