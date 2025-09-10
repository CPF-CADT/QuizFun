// src/routes/game.router.ts

import express from 'express';
import { GameController } from '../controller/game.controller';
import { validate } from '../middleware/validate';
import { gameSchemas } from '../validations/game.schemas'; 
// import  quizRateLimit } from '../middleware/ratelimit.middleware';
import { getUserQuizHistory } from '../controller/quizzHistory.controller';

export const gameRouter = express.Router();

// Apply validation middleware to each route
gameRouter.get('/', 
    validate(gameSchemas.getSessions), 
    GameController.getSessions
);

gameRouter.get('/:id', 
    validate(gameSchemas.idParam), 
    GameController.getSessionDetails
);

gameRouter.get('/:id/history', 
    validate(gameSchemas.idParam), 
    GameController.getSessionHistory
);

gameRouter.post('/:sessionId/feedback', 
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.addFeedback),   
    GameController.addFeedbackToSession
);

gameRouter.get('/:sessionId/results', 
    // quizRateLimit,
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.getSessionResults),
    GameController.getSessionResults
);

gameRouter.get('/:sessionId/performance/guest',
    // quizRateLimit,
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.getGuestPerformance),
    GameController.getGuestPerformanceInSession
);
gameRouter.get('/:sessionId/export',
    validate(gameSchemas.sessionIdParam),
    GameController.exportSessionResults
);

gameRouter.get('/:sessionId/performance/:userId', 
    // quizRateLimit,
    validate(gameSchemas.userPerformanceParams), 
    GameController.getUserPerformanceInSession
);

gameRouter.get('/:sessionId/analytics',
    validate(gameSchemas.sessionIdParam),
    GameController.getSessionAnalytics
);
gameRouter.get('/:userId/quiz-history', 
    getUserQuizHistory
);
gameRouter.get('/:hostId/:quizId',GameController.getSessionByQuizAndHost);
gameRouter.get('/:userId/quiz-history/:quizId',GameController.getUserQuizHistoryForQuiz);
