import { Request, Response } from "express";
import { ReportRepository } from "../repositories/report.repositories";

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
      const creatorId = (req as any).user?.id;
      if (!creatorId) return res.status(401).json({ message: "Unauthorized" });

      const report = await ReportRepository.getQuizAnalytics(quizId, creatorId);
      if (!report) return res.status(404).json({ message: "Report not found or access denied" });

      return res.status(200).json(report);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error generating quiz analytics." });
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
