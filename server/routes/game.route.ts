import express from 'express'
import { GameController } from '../controller/game.controller';
import { quizRateLimit,globalRateLimit } from '../middleware/ratelimit.middleware';
export const gameRouter = express.Router();

gameRouter.get('/',globalRateLimit, GameController.getSessions);
gameRouter.get('/:id',globalRateLimit, GameController.getSessionDetails);
gameRouter.get('/:id/history', globalRateLimit,GameController.getSessionHistory);
gameRouter.post('/:sessionId/feedback',globalRateLimit, GameController.addFeedbackToSession);

gameRouter.get('/:sessionId/results',quizRateLimit, GameController.getSessionResults);
gameRouter.get('/:sessionId/performance/guest',quizRateLimit, GameController.getGuestPerformanceInSession);
gameRouter.get('/:sessionId/performance/:userId',quizRateLimit,GameController.getUserPerformanceInSession);