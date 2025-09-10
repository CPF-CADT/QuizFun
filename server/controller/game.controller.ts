import { Request, Response } from 'express';
import { GameRepository, IParticipantResult } from '../repositories/game.repositories';
import { UserModel } from '../model/User';
import redisClient from '../config/redis';
import { GameSessionModel } from '../model/GameSession';
import { Types } from 'mongoose';
import { ExcelExportService, ExcelExportOptions } from '../service/ExcelExportService';

export class GameController {

    /**
     * @swagger
     * tags:
     *   - name: Game Sessions
     *     description: Endpoints for creating, retrieving, and managing game sessions.
     *   - name: Analytics & History
     *     description: Endpoints for fetching detailed game history and user performance data.
     */

    /**
     * @swagger
     * components:
     *   schemas:
     *     Error:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *           description: A message describing the error.
     *           example: "Internal Server Error."
     *
     *     FeedbackRequest:
     *       type: object
     *       required:
     *         - rating
     *       properties:
     *         rating:
     *           type: number
     *           format: float
     *           description: A numerical rating (e.g., 1-5).
     *           example: 4
     *         comment:
     *           type: string
     *           description: An optional text comment.
     *           example: "This was a really fun quiz!"
     *
     *     AnswerAttempt:
     *       type: object
     *       properties:
     *         selectedOptionId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         isCorrect:
     *           type: boolean
     *         answerTimeMs:
     *           type: integer
     *
     *     GameHistory:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         gameSessionId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         quizId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         questionId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         userId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         guestNickname:
     *           type: string
     *         attempts:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/AnswerAttempt'
     *         isUltimatelyCorrect:
     *           type: boolean
     *         finalScoreGained:
     *           type: integer
     *         createdAt:
     *           type: string
     *           format: date-time
     *
     *     Feedback:
     *       type: object
     *       properties:
     *         rating:
     *           type: string
     *           description: Stored as Decimal128, represented as a string in JSON.
     *           example: "4.5"
     *         comment:
     *           type: string
     *
     *     GameResult:
     *       type: object
     *       properties:
     *         userId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         nickname:
     *           type: string
     *         finalScore:
     *           type: integer
     *         finalRank:
     *           type: integer
     *         feedback:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/Feedback'
     *
     *     GameSession:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         quizId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         hostId:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         joinCode:
     *           type: integer
     *         status:
     *           type: string
     *           enum: [waiting, in_progress, completed, cancelled]
     *         results:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/GameResult'
     *         startedAt:
     *           type: string
     *           format: date-time
     *         endedAt:
     *           type: string
     *           format: date-time
     *
     *     PaginatedSessions:
     *       type: object
     *       properties:
     *         total:
     *           type: integer
     *         limit:
     *           type: integer
     *         totalPages:
     *           type: integer
     *         currentPage:
     *           type: integer
     *         data:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/GameSession'
     */

    /**
     * @swagger
     * /api/session:
     *   get:
     *     tags:
     *       - Game Sessions
     *     summary: Get Paginated Game Sessions
     *     description: Retrieves a list of all past game sessions, suitable for an admin dashboard or public lobby history.
     *     parameters:
     *       - name: page
     *         in: query
     *         schema:
     *           type: integer
     *           default: 1
     *         description: The page number to retrieve.
     *       - name: limit
     *         in: query
     *         schema:
     *           type: integer
     *           default: 10
     *         description: The number of sessions per page.
     *     responses:
     *       200:
     *         description: A paginated list of game sessions.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaginatedSessions'
     *       500:
     *         description: Internal Server Error.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */

    static async getSessions(req: Request, res: Response): Promise<Response> {
        try {
            const { page, limit } = req.query;
            const sessions = await GameRepository.fetchGameSessions(Number(page), Number(limit));
            return res.status(200).json(sessions);
        } catch (error) {
            return res.status(500).json({ message: 'Server error retrieving game sessions.' });
        }
    }


    /**
     * @swagger
     * /api/session/{id}:
     *   get:
     *     tags:
     *       - Game Sessions
     *     summary: Get Single Session Details
     *     description: Retrieves the full details of a single game session, including final results and participants.
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         description: The MongoDB ObjectId of the game session.
     *     responses:
     *       200:
     *         description: Successful response with game session details.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GameSession'
     *       404:
     *         description: Game session not found.
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


    static async getSessionDetails(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const session = await GameRepository.findSessionById(id);
            if (!session) {
                return res.status(404).json({ message: 'Game session not found.' });
            }
            return res.status(200).json(session);
        } catch (error) {
            return res.status(500).json({ message: 'Server error retrieving session details.' });
        }
    }

    /**
     * @swagger
     * /api/session/{id}/history:
     *   get:
     *     tags:
     *       - Analytics & History
     *     summary: Get Full Session History
     *     description: Retrieves the detailed, turn-by-turn history for a specific game session, including every answer attempt by every player.
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         description: The MongoDB ObjectId of the game session.
     *     responses:
     *       200:
     *         description: An array of game history records for the session.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GameHistory'
     *       500:
     *         description: Internal Server Error.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */

    static async getSessionHistory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const history = await GameRepository.fetchHistoryForSession(id);
            return res.status(200).json(history);
        } catch (error) {
            return res.status(500).json({ message: 'Server error retrieving session history.' });
        }
    }

    /**
        * @swagger
        * /api/user/{userId}/history:
        *   get:
        *     tags:
        *       - Analytics & History
        *     summary: Get User's Lifetime History
        *     description: Retrieves the complete playing history for a specific user across all games they have ever played.
        *     parameters:
        *       - name: userId
        *         in: path
        *         required: true
        *         schema:
        *           type: string
        *           pattern: "^[a-fA-F0-9]{24}$"
        *         description: The MongoDB ObjectId of the user.
        *     responses:
        *       200:
        *         description: An array of the user's game history records.
        *         content:
        *           application/json:
        *             schema:
        *               type: array
        *               items:
        *                 $ref: '#/components/schemas/GameHistory'
        *       500:
        *         description: Internal Server Error.
        *         content:
        *           application/json:
        *             schema:
        *               $ref: '#/components/schemas/Error'
        */


    static async getUserHistory(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;
            const history = await GameRepository.fetchUserGameHistory(userId);
            return res.status(200).json(history);
        } catch (error) {
            return res.status(500).json({ message: 'Server error retrieving user history.' });
        }
    }

    /**
      * @swagger
      * /api/session/{sessionId}/performance/{userId}:
      *   get:
      *     tags:
      *       - Analytics & History
      *     summary: Get Detailed User Performance in a Game Session
      *     description: Retrieves a detailed, question-by-question breakdown of a user's performance in a specific game session, including all attempts and thinking time.
      *     parameters:
      *       - name: sessionId
      *         in: path
      *         required: true
      *         description: The MongoDB ObjectId of the game session.
      *         schema:
      *           type: string
      *           pattern: "^[a-fA-F0-9]{24}$"
      *       - name: userId
      *         in: path
      *         required: true
      *         description: The MongoDB ObjectId of the user.
      *         schema:
      *           type: string
      *           pattern: "^[a-fA-F0-9]{24}$"
      *     responses:
      *       200:
      *         description: A detailed array of the user's performance for each question in the session.
      *         content:
      *           application/json:
      *             schema:
      *               type: array
      *               items:
      *                 type: object
      *                 properties:
      *                   questionId:
      *                     type: string
      *                     example: "64e8f1b9f2a3b0c4d5e6f7a8"
      *                   attempts:
      *                     type: array
      *                     items:
      *                       type: object
      *                       properties:
      *                         answer:
      *                           type: string
      *                           example: "B"
      *                         isCorrect:
      *                           type: boolean
      *                           example: false
      *                         timeTaken:
      *                           type: integer
      *                           description: Time taken in milliseconds
      *                           example: 3500
      *       404:
      *         description: No history found for this user in the specified session.
      *       500:
      *         description: Internal Server Error.
      */

    static async getUserPerformanceInSession(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, sessionId } = req.params;

            const cacheKey = `session-results:${sessionId}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                // --- CACHE HIT ---
                console.log(`[Cache] HIT for user performance: ${userId} in session ${sessionId}`);
                const fullResults: IParticipantResult[] = JSON.parse(cachedData);
                const userResult = fullResults.find(p => p.participantId === userId);

                if (!userResult) {
                    return res.status(404).json({ message: 'Performance data not found for this user in the cached session results.' });
                }

                return res.status(200).json({
                    userId: userResult.participantId,
                    username: userResult.name,
                    performance: userResult.detailedPerformance,
                });
            }

            console.log(`[Cache] MISS for user performance: ${userId}. Falling back to DB.`);
            const user = await UserModel.findById(userId).select('name');
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            const performanceDetails = await GameRepository.fetchUserPerformanceInSession(userId, sessionId);
            if (!performanceDetails || performanceDetails.length === 0) {
                return res.status(404).json({ message: 'No performance history found for this user in the specified session.' });
            }
            return res.status(200).json({
                userId,
                username: user.name,
                performance: performanceDetails
            });

        } catch (error) {
            console.error("Error fetching user session performance:", error);
            return res.status(500).json({ message: 'Server error retrieving detailed user performance.' });
        }
    }


    /**
     * @swagger
     * /api/session/{sessionId}/feedback:
     *   post:
     *     tags:
     *       - Game Sessions
     *     summary: Add Feedback to a Session
     *     description: Allows a player to submit feedback (a rating and a comment) for a game they participated in.
     *     parameters:
     *       - name: sessionId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *         description: The MongoDB ObjectId of the game session.
     *     requestBody:
     *       required: true
     *       description: Feedback object.
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FeedbackRequest'
     *     responses:
     *       200:
     *         description: Feedback submitted successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Feedback added successfully."
     *       400:
     *         description: Bad Request - Missing required fields.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: The specified user was not found in this game session.
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

    static async addFeedbackToSession(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
            // Manual validation is no longer needed
            const { rating, comment } = req.body;
            const result = await GameRepository.addFeedback(sessionId, rating, comment);

            if (!result || result.modifiedCount === 0) {
                return res.status(404).json({ message: 'Could not find the specified user in this game session to add feedback.' });
            }

            return res.status(200).json({ message: 'Feedback added successfully.' });
        } catch (error) {
            return res.status(500).json({ message: 'Server error adding feedback.' });
        }
    }
    /**
   * @swagger
   * components:
   *   schemas:
   *     ResultsPayload:
   *       type: object
   *       properties:
   *         viewType:
   *           type: string
   *           enum:
   *             - host
   *             - player
   *             - guest
   *           description: Role of the requesting user in the game session.
   *         results:
   *           type: array
   *           description: List of game result entries.
   *           items:
   *             type: object
   *             properties:
   *               participantId:
   *                 type: string
   *                 description: Unique identifier of the participant.
   *               name:
   *                 type: string
   *                 description: Name of the participant.
   *               score:
   *                 type: number
   *                 description: Total score achieved.
   *               correctAnswers:
   *                 type: number
   *                 description: Number of correct answers.
   *               totalQuestions:
   *                 type: number
   *                 description: Total number of questions asked.
   *               percentage:
   *                 type: number
   *                 description: Score percentage.
   *               averageTime:
   *                 type: number
   *                 description: Average time per question in seconds.
   *               detailedAnswers:
   *                 type: array
   *                 description: List of detailed answers.
   *                 items:
   *                   type: object
   *                   properties:
   *                     question:
   *                       type: string
   *                       description: Question text.
   *                     answer:
   *                       type: string
   *                       description: Answer given by the participant.
   *                     correct:
   *                       type: boolean
   *                       description: Whether the answer was correct.
   */

    /**
       * @swagger
       * /api/session/{sessionId}/results:
       *   get:
       *     tags:
       *       - Game Sessions
       *     summary: Get Final Aggregated Game Results by Role
       *     description: >
       *       Retrieves the final, aggregated results for a completed game session.
       *       - A **Host** receives a summary of all participants.
       *       - A **Player** receives their own detailed results.
       *       - A **Guest** receives their own detailed results.
       *       This endpoint should be called when a user clicks "View Results" after the game ends.
       *     parameters:
       *       - name: sessionId
       *         in: path
       *         required: true
       *         schema:
       *           type: string
       *           pattern: "^[a-fA-F0-9]{24}$"
       *         description: The MongoDB ObjectId of the game session.
       *       - name: userId
       *         in: query
       *         schema:
       *           type: string
       *           pattern: "^[a-fA-F0-9]{24}$"
       *         description: The ID of the authenticated user (player or host).
       *       - name: guestName
       *         in: query
       *         schema:
       *           type: string
       *         description: The name of the guest player.
       *     responses:
       *       '200':
       *         description: Successfully retrieved game results, tailored to the user's role.
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/ResultsPayload'
       *       '400':
       *         description: Bad Request - Missing identifier.
       *       '404':
       *         description: Game session not found.
       *       '500':
       *         description: Internal Server Error.
       */
    static async getSessionResults(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
            const { userId, guestName, view } = req.query as { userId?: string, guestName?: string, view?: 'summary' };

            if (!Types.ObjectId.isValid(sessionId)) {
                return res.status(400).json({ message: 'Invalid session ID.' });
            }

            const cacheKey = `session-results:${sessionId}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                console.log(`[Cache] HIT for session results: ${sessionId}`);
                const fullResults: IParticipantResult[] = JSON.parse(cachedData);

                const session = await GameSessionModel.findById(sessionId).select('hostId').lean();
                if (!session) return res.status(404).json({ message: "Session not found." });
                const isHost = !!(userId && session.hostId && session.hostId.equals(userId));
                const viewType = isHost ? 'host' : (guestName ? 'guest' : 'player');

                const finalResults = fullResults.map(result => {
                    if (view === 'summary') {
                        const { detailedPerformance, ...leaderboardData } = result as any; 
                        return leaderboardData;
                    }
                    const isSelf = (userId && result.participantId?.toString() === userId) || (guestName && result.name === guestName);
                    if (isHost || isSelf) return result;
                    const { detailedPerformance, ...leaderboardData } = result as any;
                    return leaderboardData;
                });

                return res.status(200).json({ viewType, results: finalResults });
            }

            console.log(`[Cache] MISS for session results: ${sessionId}. Falling back to DB.`);
            const resultsPayload = await GameRepository.fetchFinalResults(sessionId, { userId, guestName }, view);

            if (!resultsPayload) {
                return res.status(404).json({ message: 'Results for this game session could not be found.' });
            }
            return res.status(200).json(resultsPayload);

        } catch (error) {
            console.error("Error fetching session results:", error);
            return res.status(500).json({ message: 'Server error retrieving session results.' });
        }
    }



    /**
     * @swagger
     * /api/session/{sessionId}/performance/guest:
     *   get:
     *     tags:
     *       - Analytics & History
     *     summary: Get Detailed Guest Performance in a Game Session
     *     description: Retrieves a detailed, question-by-question breakdown of a guest user's performance in a specific game session, including all attempts and thinking time.
     *     parameters:
     *       - name: sessionId
     *         in: path
     *         required: true
     *         description: The MongoDB ObjectId of the game session.
     *         schema:
     *           type: string
     *           pattern: "^[a-fA-F0-9]{24}$"
     *       - name: name
     *         in: query
     *         required: true
     *         description: The display name of the guest.
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: A detailed array of the guest's performance for each question in the session.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   questionId:
     *                     type: string
     *                     example: "64e8f1b9f2a3b0c4d5e6f7a8"
     *                   attempts:
     *                     type: array
     *                     items:
     *                       type: object
     *                       properties:
     *                         answer:
     *                           type: string
     *                           example: "B"
     *                         isCorrect:
     *                           type: boolean
     *                           example: false
     *                         timeTaken:
     *                           type: integer
     *                           description: Time taken in milliseconds
     *                           example: 3500
     *       400:
     *         description: Guest name query parameter is required.
     *       404:
     *         description: No history found for this guest in the specified session.
     *       500:
     *         description: Internal Server Error.
     */

    static async getGuestPerformanceInSession(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
            const { name } = req.query as { name: string };

            const cacheKey = `session-results:${sessionId}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                console.log(`[Cache] HIT for guest performance: ${name} in session ${sessionId}`);
                const fullResults: IParticipantResult[] = JSON.parse(cachedData);
                const guestResult = fullResults.find(p => p.name === name && !p.participantId);

                if (!guestResult) {
                    return res.status(404).json({ message: 'Performance data not found for this guest in the cached session results.' });
                }

                return res.status(200).json({
                    username: guestResult.name,
                    performance: guestResult.detailedPerformance,
                });
            }

            console.log(`[Cache] MISS for guest performance: ${name}. Falling back to DB.`);
            const performance = await GameRepository.fetchGuestPerformanceInSession(sessionId, name);
            if (!performance || performance.length === 0) {
                return res.status(404).json({ message: 'No history found for this guest.' });
            }
            return res.status(200).json({
                username: name,
                performance: performance
            });

        } catch (error) {
            console.error("Error fetching guest performance:", error);
            return res.status(500).json({ message: 'Server error retrieving guest performance.' });
        }
    }

    /**
     * @swagger
     * /api/session/{sessionId}/export:
     *   get:
     *     tags:
     *       - Game Sessions
     *     summary: Export session results to Excel
     *     description: Download session results as an Excel file with participant summary, question breakdown, and detailed answers
     *     parameters:
     *       - in: path
     *         name: sessionId
     *         required: true
     *         schema:
     *           type: string
     *         description: The session ID
     *       - in: query
     *         name: includeDetailedAnswers
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Include detailed answers sheet
     *       - in: query
     *         name: includeQuestionBreakdown
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Include question breakdown sheet
     *       - in: query
     *         name: includeParticipantSummary
     *         schema:
     *           type: boolean
     *           default: true
     *         description: Include participant summary sheet
     *     responses:
     *       200:
     *         description: Excel file download
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Session not found or no results available
     *       500:
     *         description: Internal Server Error
     */
    static async exportSessionResults(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
            const {
                includeSessionOverview = 'true',
                includeSimpleSummary = 'true',
                includeDetailedAnswers = 'false',
                includeQuestionBreakdown = 'false',
                includeParticipantSummary = 'false'
            } = req.query;

            const options: ExcelExportOptions = {
                includeSessionOverview: includeSessionOverview === 'true',
                includeSimpleSummary: includeSimpleSummary === 'true',
                includeDetailedAnswers: includeDetailedAnswers === 'true',
                includeQuestionBreakdown: includeQuestionBreakdown === 'true',
                includeParticipantSummary: includeParticipantSummary === 'true'
            };

            const excelBuffer = await ExcelExportService.exportSessionResults(sessionId, options);

            // Get session info for filename
            const session = await GameSessionModel.findById(sessionId).populate('quizId', 'title').exec();
            const quizTitle = (session?.quizId as any)?.title || 'Quiz';
            const sanitizedTitle = quizTitle.replace(/[^a-zA-Z0-9]/g, '_');
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${sanitizedTitle}_Results_${timestamp}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', excelBuffer.length);

            return res.send(excelBuffer);

        } catch (error) {
            console.error("Error exporting session results:", error);
            if (error instanceof Error) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Server error exporting session results.' });
        }
    }
    static async getSessionAnalytics(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const sessionDetails = await GameRepository.getSessionResults(sessionId);
            if (!sessionDetails) {
                return res.status(404).json({ message: 'Session not found.' });
            }
            res.status(200).json(sessionDetails);
        } catch (error) {
            console.error("Error fetching session details:", error);
            res.status(500).json({ message: 'Error fetching session details.' });
        }
    }
    /**
 * @swagger
 * /api/session/{hostId}/{quizId}:
 *   get:
 *     tags:
 *       - Game Sessions
 *     summary: Get Session by Quiz and Host
 *     description: Retrieves the details of a game session by matching both the quiz ID and the host ID.
 *     parameters:
 *       - name: quizId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         description: The MongoDB ObjectId of the quiz.
 *       - name: hostId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         description: The MongoDB ObjectId of the host.
 *     responses:
 *       200:
 *         description: Successful response with the session details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSession'
 *       404:
 *         description: Session not found for the given quiz and host IDs.
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
  static  async getSessionByQuizAndHost (req: Request, res: Response): Promise<Response>  {
    try {
        const { quizId, hostId } = req.params;

        const session = await GameRepository.findSessionByQuizAndHost(quizId, hostId);
        if (!session) {
            return res.status(404).json({ message: "Session not found for the given quiz and host." });
        }

        return res.status(200).json(session);
    } catch (error) {
        console.error("Error fetching session by quiz and host:", error);
        return res.status(500).json({ message: "Server error retrieving session details." });
    }
};
/**
 * @swagger
 * /api/session/{userId}/quiz-history/{quizId}:
 *   get:
 *     tags:
 *       - Analytics & History
 *     summary: Get User's Quiz History for a Specific Quiz
 *     description: |
 *       Retrieves all sessions of a specific quiz that a given user has participated in,
 *       formatted for frontend consumption.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         description: The MongoDB ObjectId of the user.
 *       - name: quizId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         description: The MongoDB ObjectId of the quiz.
 *     responses:
 *       200:
 *         description: Successfully retrieved the formatted quiz history for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FormattedQuizHistory'
 *       404:
 *         description: No quiz history found for the given user and quiz.
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
static async getUserQuizHistoryForQuiz(req: Request, res: Response): Promise<Response> {
    try {
        const { userId, quizId } = req.params;
        const sessions = await GameRepository.fetchUserQuizHistoryByQuizId(userId, quizId);

        // Format each session using your formatter
        const formatted = sessions.map(session =>
            GameRepository.formatSessionToQuizHistory(
                { ...session, quiz: session.quizId }, // quiz is populated as quizId
                userId
            )
        );

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Error fetching user quiz history for quiz:", error);
        return res.status(500).json({ message: "Server error retrieving quiz history." });
    }
}

}





