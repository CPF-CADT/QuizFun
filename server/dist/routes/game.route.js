"use strict";
// src/routes/game.router.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRouter = void 0;
const express_1 = __importDefault(require("express"));
const game_controller_1 = require("../controller/game.controller");
const validate_1 = require("../middleware/validate");
const game_schemas_1 = require("../validations/game.schemas");
// import  quizRateLimit } from '../middleware/ratelimit.middleware';
const quizzHistory_controller_1 = require("../controller/quizzHistory.controller");
exports.gameRouter = express_1.default.Router();
// Apply validation middleware to each route
exports.gameRouter.get('/', (0, validate_1.validate)(game_schemas_1.gameSchemas.getSessions), game_controller_1.GameController.getSessions);
exports.gameRouter.get('/:id', (0, validate_1.validate)(game_schemas_1.gameSchemas.idParam), game_controller_1.GameController.getSessionDetails);
exports.gameRouter.get('/:id/history', (0, validate_1.validate)(game_schemas_1.gameSchemas.idParam), game_controller_1.GameController.getSessionHistory);
exports.gameRouter.post('/:sessionId/feedback', (0, validate_1.validate)(game_schemas_1.gameSchemas.sessionIdParam), (0, validate_1.validate)(game_schemas_1.gameSchemas.addFeedback), game_controller_1.GameController.addFeedbackToSession);
exports.gameRouter.get('/:sessionId/results', 
// quizRateLimit,
(0, validate_1.validate)(game_schemas_1.gameSchemas.sessionIdParam), (0, validate_1.validate)(game_schemas_1.gameSchemas.getSessionResults), game_controller_1.GameController.getSessionResults);
exports.gameRouter.get('/:sessionId/performance/guest', 
// quizRateLimit,
(0, validate_1.validate)(game_schemas_1.gameSchemas.sessionIdParam), (0, validate_1.validate)(game_schemas_1.gameSchemas.getGuestPerformance), game_controller_1.GameController.getGuestPerformanceInSession);
exports.gameRouter.get('/:sessionId/export', (0, validate_1.validate)(game_schemas_1.gameSchemas.sessionIdParam), game_controller_1.GameController.exportSessionResults);
exports.gameRouter.get('/:sessionId/performance/:userId', 
// quizRateLimit,
(0, validate_1.validate)(game_schemas_1.gameSchemas.userPerformanceParams), game_controller_1.GameController.getUserPerformanceInSession);
exports.gameRouter.get('/:sessionId/analytics', (0, validate_1.validate)(game_schemas_1.gameSchemas.sessionIdParam), game_controller_1.GameController.getSessionAnalytics);
exports.gameRouter.get('/:userId/quiz-history', quizzHistory_controller_1.getUserQuizHistory);
exports.gameRouter.get('/:hostId/:quizId', game_controller_1.GameController.getSessionByQuizAndHost);
exports.gameRouter.get('/:userId/quiz-history/:quizId', game_controller_1.GameController.getUserQuizHistoryForQuiz);
