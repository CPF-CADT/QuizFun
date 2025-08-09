import { Request, Response } from 'express';
import { GameRepositoy } from '../repositories/game.repositories';
import { Types } from 'mongoose';
import { generateRandomNumber } from '../service/generateRandomNumber';
import {GameSessionManager} from '../config/data/GameSession'
/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Quiz Management
 */


/**
 * @swagger
 * /api/game/host:
 *   post:
 *     summary: Host a new game session
 *     tags:
 *       - Game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *               - hostId
 *             properties:
 *               quizId:
 *                 type: string
 *                 description: MongoDB ObjectId of the quiz to play
 *               hostId:
 *                 type: string
 *                 description: MongoDB ObjectId of the host user
 *               startedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional start date/time of the game
 *     responses:
 *       200:
 *         description: Game hosted successfully with join code
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
 *                   example: Host successful
 *                 joinCode:
 *                   type: string
 *                   description: The generated join code for the game session
 *                   example: ABC123
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Quiz not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


export async function hostGame(req:Request,res:Response):Promise<void>{
    const { quizId, hostId ,startedAt} = req.body;
    const gameSession= await GameRepositoy.hostNewGame({quizId: new Types.ObjectId(quizId),hostId:new Types.ObjectId(hostId),startedAt:startedAt})
    if(!gameSession){
        res.status(404).json({ message: "Quizz not found" })
        return
    }
    let joinCode = generateRandomNumber(6);
    while(GameSessionManager.isSessionActive(joinCode)){
        joinCode=generateRandomNumber(6);
    }
    GameSessionManager.addSession(joinCode, { game_id: gameSession._id.toString(), hostId, quizId });
    res.status(200).json({ success: true, message: 'Host successful', joinCode });
    return
}
