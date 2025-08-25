// src/routes/game.router.ts

import express from 'express';
import { GameController } from '../controller/game.controller';
import { validate } from '../middleware/validate';
import { gameSchemas } from '../validations/game.schemas'; 
import { globalRateLimit, quizRateLimit } from '../middleware/ratelimit.middleware';

export const gameRouter = express.Router();

// Apply validation middleware to each route
gameRouter.get('/', 
    globalRateLimit,
    validate(gameSchemas.getSessions), 
    GameController.getSessions
);

gameRouter.get('/:id', 
    globalRateLimit,
    validate(gameSchemas.idParam), 
    GameController.getSessionDetails
);

gameRouter.get('/:id/history', 
    globalRateLimit,
    validate(gameSchemas.idParam), 
    GameController.getSessionHistory
);

gameRouter.post('/:sessionId/feedback', 
    globalRateLimit,
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.addFeedback),   
    GameController.addFeedbackToSession
);

gameRouter.get('/:sessionId/results', 
    quizRateLimit,
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.getSessionResults),
    GameController.getSessionResults
);

gameRouter.get('/:sessionId/performance/guest',
    quizRateLimit,
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.getGuestPerformance),
    GameController.getGuestPerformanceInSession
);

gameRouter.get('/:sessionId/performance/:userId', 
    quizRateLimit,
    validate(gameSchemas.userPerformanceParams), 
    GameController.getUserPerformanceInSession
);
