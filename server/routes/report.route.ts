import express from "express";
import { ReportController } from "../controller/report.controller";
import { authenticateToken } from "../middleware/authenicate.middleware";

export const reportRouter = express.Router();

// Routes for reporting and analytics
reportRouter.get("/my-quizzes", authenticateToken,ReportController.getMyQuizzesForReport);
reportRouter.get("/quiz/:quizId", authenticateToken,ReportController.getQuizAnalytics);
