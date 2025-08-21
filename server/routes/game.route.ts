import express from 'express'
import { GameController } from '../controller/game.controller';

export const gameRouter = express.Router();

gameRouter.get('/', GameController.getSessions);
gameRouter.get('/:id', GameController.getSessionDetails);
gameRouter.get('/:id/history', GameController.getSessionHistory);
gameRouter.post('/:sessionId/feedback', GameController.addFeedbackToSession);
gameRouter.get('/:sessionId/results', GameController.getSessionResults);
gameRouter.get('/:sessionId/performance/guest', GameController.getGuestPerformanceInSession);
gameRouter.get('/:sessionId/performance/:userId', GameController.getUserPerformanceInSession);