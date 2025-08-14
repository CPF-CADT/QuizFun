import express from 'express'
import { GameController } from '../controller/game.controller';

export const gameRouter = express.Router();

gameRouter.get('/', GameController.getSessions);
gameRouter.get('/:id', GameController.getSessionDetails);
gameRouter.get('/:id/history', GameController.getSessionHistory);
gameRouter.post('/:sessionId/feedback', GameController.addFeedbackToSession);
gameRouter.get('/:userId/history', GameController.getUserHistory);
gameRouter.get('/:userId/performance/:quizId', GameController.getUserPerformanceOnQuiz);
