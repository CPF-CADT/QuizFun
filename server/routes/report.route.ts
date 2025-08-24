import express from "express";
import { ReportController } from "../controller/report.controller";

export const reportRouter = express.Router();

// Routes for reporting and analytics
reportRouter.get("/my-quizzes",ReportController.getMyQuizzesForReport);
reportRouter.get("/quiz/:quizId",ReportController.getQuizAnalytics);
reportRouter.get("/activity-feed",ReportController.getUserActivityFeed);
reportRouter.get("/quiz/:quizId/feedback",ReportController.getQuizFeedback);
