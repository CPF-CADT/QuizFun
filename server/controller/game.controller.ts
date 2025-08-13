import { Request, Response } from 'express';
import { GameRepository } from '../repositories/game.repositories';

export class GameController {
  /**
   * @swagger
   * /games:
   *   post:
   *     summary: Host a new game session
   *     tags: [Game]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           example:
   *             quizId: "64f9a7a5cba7a0c8e0f97b21"
   *             hostId: "64f9a7a5cba7a0c8e0f97b22"
   *             joinCode: "ABC123"
   *     responses:
   *       201:
   *         description: Game created successfully
   */
  // static async hostNewGame(req: Request, res: Response) {
  //   try {
  //     const game = await GameRepository.hostNewGame(req.body);
  //     res.status(201).json(game);
  //   } catch (err) {
  //     res.status(500).json({ error: (err as Error).message });
  //   }
  // }

  /**
   * @swagger
   * /games/{gameId}/players:
   *   post:
   *     summary: Add a player to a game
   *     tags: [Game]
   *     parameters:
   *       - in: path
   *         name: gameId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           example:
   *             userId: "64f9a7a5cba7a0c8e0f97b25"
   *             nickname: "Player 1"
   *             finalScore: 50
   *             finalRank: 1
   *     responses:
   *       200:
   *         description: Player added successfully
   */
  // static async addPlayer(req: Request, res: Response) {
  //   try {
  //     const { gameId } = req.params;
  //     const success = await GameRepository.addPlayerAndResultInGame(gameId, req.body);
  //     if (success) {
  //       res.json({ message: 'Player added successfully' });
  //     } else {
  //       res.status(404).json({ error: 'Game not found' });
  //     }
  //   } catch (err) {
  //     res.status(500).json({ error: (err as Error).message });
  //   }
  // }

  /**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get paginated list of game sessions
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: List of game sessions with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Game sessions fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameSession'
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *       500:
 *         description: Server error
 */
  // static async getAllGames(req: Request, res: Response) {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = parseInt(req.query.limit as string) || 10;

      
      
  //     // Call repository
  //     const result = await GameRepository.fetchGameSession(page, limit);

  //     res.status(200).json({
  //       success: true,
  //       message: "Game sessions fetched successfully",
  //       ...result // contains data, total, totalPages, currentPage
  //     });
  //   } catch (err) {
  //     res.status(500).json({ error: (err as Error).message });
  //   }
  // }

  /**
   * @swagger
   * /api/games/games-history:
   *   get:
   *     summary: Get all games with history
   *     tags: [Game]
   *     responses:
   *       200:
   *         description: List of games with history
   */
  // static async getGamesWithHistory(req: Request, res: Response) {
  //   try {
  //     const data = await GameRepository.fetchGameSessionWithHistory();
  //     res.json(data);
  //   } catch (err) {
  //     res.status(500).json({ error: (err as Error).message });
  //   }
  // }

  /**
   * @swagger
   * /users/{userId}/game-history:
   *   get:
   *     summary: Get game history for a user
   *     tags: [Game]
   */
  static async getUserGameHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const data = await GameRepository.fetchUserGameHistory(userId);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * @swagger
   * /users/{userId}/join-history:
   *   get:
   *     summary: Get join history for a user
   *     tags: [Game]
   */
  // static async getUserJoinHistory(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.params;
  //     const data = await GameRepository.fetchUserJoinHistory(userId);
  //     res.json(data);
  //   } catch (err) {
  //     res.status(500).json({ error: (err as Error).message });
  //   }
  // }
}
