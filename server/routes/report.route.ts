import express from "express";
import { ReportController } from "../controller/report.controller";
import { authenticateToken, optionalAuthMiddleware } from "../middleware/authenicate.middleware";
// import { } from '../middleware/ratelimit.middleware';
export const reportRouter = express.Router();

// Routes for reporting and analytics
reportRouter.get("/my-quizzes", authenticateToken,ReportController.getMyQuizzesForReport);
reportRouter.get("/quiz/:quizId", authenticateToken,ReportController.getQuizAnalytics);
reportRouter.get("/activity-feed", authenticateToken,ReportController.getUserActivityFeed);
reportRouter.get("/quiz/:quizId/feedback",ReportController.getQuizFeedback);
reportRouter.post('/question', optionalAuthMiddleware, ReportController.submitQuestionReport);
reportRouter.get("/quiz/:quizId/export", authenticateToken, ReportController.exportQuizAnalytics);
reportRouter.get('/leaderboard',optionalAuthMiddleware, ReportController.getLeaderboard);