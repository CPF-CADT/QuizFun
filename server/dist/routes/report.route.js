"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../controller/report.controller");
const authenicate_middleware_1 = require("../middleware/authenicate.middleware");
// import { } from '../middleware/ratelimit.middleware';
exports.reportRouter = express_1.default.Router();
// Routes for reporting and analytics
exports.reportRouter.get("/my-quizzes", authenicate_middleware_1.authenticateToken, report_controller_1.ReportController.getMyQuizzesForReport);
exports.reportRouter.get("/quiz/:quizId", authenicate_middleware_1.authenticateToken, report_controller_1.ReportController.getQuizAnalytics);
exports.reportRouter.get("/activity-feed", authenicate_middleware_1.authenticateToken, report_controller_1.ReportController.getUserActivityFeed);
exports.reportRouter.get("/quiz/:quizId/feedback", report_controller_1.ReportController.getQuizFeedback);
exports.reportRouter.post('/question', authenicate_middleware_1.optionalAuthMiddleware, report_controller_1.ReportController.submitQuestionReport);
exports.reportRouter.get("/quiz/:quizId/export", authenicate_middleware_1.authenticateToken, report_controller_1.ReportController.exportQuizAnalytics);
exports.reportRouter.get('/leaderboard', authenicate_middleware_1.optionalAuthMiddleware, report_controller_1.ReportController.getLeaderboard);
