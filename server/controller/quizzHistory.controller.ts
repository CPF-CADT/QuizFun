import { Request, Response } from 'express';
import { QuizHistoryRepository } from '../repositories/quizHistory.repositories';
import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     FormattedQuizHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique ID of the quiz.
 *           example: '63a5e3c1f9d4a1b2c3d4e5f6'
 *         title:
 *           type: string
 *           description: The title of the quiz.
 *           example: "Advanced Mathematics Quiz"
 *         category:
 *           type: string
 *           description: The primary category/tag of the quiz.
 *           example: "Mathematics"
 *         date:
 *           type: string
 *           format: date
 *           description: The date the user last completed the quiz.
 *           example: "2024-08-20"
 *         score:
 *           type: number
 *           description: The user's percentage score for the quiz.
 *           example: 95
 *         totalQuestions:
 *           type: number
 *           description: The total number of questions in the quiz.
 *           example: 20
 *         duration:
 *           type: string
 *           description: The estimated completion time for the quiz.
 *           example: "15 min"
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           description: The difficulty level of the quiz.
 *           example: "Hard"
 *         status:
 *           type: string
 *           description: The completion status.
 *           example: "Completed"
 *         rating:
 *           type: number
 *           description: The average user rating for the quiz (mocked value).
 *           example: 4.8
 *         participants:
 *           type: number
 *           description: The total number of participants across all sessions for this quiz.
 *           example: 1250
 *         lastUpdated:
 *           type: string
 *           description: A relative string indicating when the quiz was last updated (mocked value).
 *           example: "2 days ago"
 *         description:
 *           type: string
 *           description: A brief description of the quiz content.
 *           example: "Master advanced calculus and algebra concepts."
 *     Error:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: A message describing the error.
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * /api/user/{id}/quiz-history:
 *   get:
 *     tags:
 *       - Analytics & History
 *     summary: Get User's Formatted Quiz History (by ID)
 *     description: |
 *       Retrieves a summarized history of all unique quizzes the specified user has completed.
 *       This endpoint allows admins or external tools to fetch history by providing a user ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the formatted quiz history.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FormattedQuizHistory'
 *       400:
 *         description: Invalid user ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getUserQuizHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Get userId from path parameter instead of req.user
        const userId = req.params.id;

        // Validate that userId is a valid ObjectId before passing it to the repository
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format." });
        }

        const formattedHistory = await QuizHistoryRepository.getHostedQuizzesByUser(userId);

        return res.status(200).json(formattedHistory);

    } catch (error) {
        console.error("Error fetching user quiz history:", error);
        return res.status(500).json({ message: "An error occurred while fetching quiz history." });
    }
};
