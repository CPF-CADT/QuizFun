// src/routes/game.router.ts

import express from 'express';
import { GameController } from '../controller/game.controller';
import { validate } from '../middleware/validate';
import { gameSchemas } from '../validations/game.schemas'; 

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
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.getSessionResults),
    GameController.getSessionResults
);

gameRouter.get('/:sessionId/performance/guest', 
    validate(gameSchemas.sessionIdParam),
    validate(gameSchemas.getGuestPerformance),
    GameController.getGuestPerformanceInSession
);

gameRouter.get('/:sessionId/performance/:userId', 
    validate(gameSchemas.userPerformanceParams), 
    GameController.getUserPerformanceInSession
);