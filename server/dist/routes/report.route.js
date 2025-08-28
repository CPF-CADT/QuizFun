"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../controller/report.controller");
const authenicate_middleware_1 = require("../middleware/authenicate.middleware");
const ratelimit_middleware_1 = require("../middleware/ratelimit.middleware");
exports.reportRouter = express_1.default.Router();
// Routes for reporting and analytics
exports.reportRouter.get("/my-quizzes", ratelimit_middleware_1.globalRateLimit, authenicate_middleware_1.authenticateToken, report_controller_1.ReportController.getMyQuizzesForReport);
exports.reportRouter.get("/quiz/:quizId", ratelimit_middleware_1.globalRateLimit, authenicate_middleware_1.authenticateToken, report_controller_1.ReportController.getQuizAnalytics);
exports.reportRouter.get("/activity-feed", ratelimit_middleware_1.globalRateLimit, authenicate_middleware_1.authenticateToken, report_controller_1.ReportController.getUserActivityFeed);
exports.reportRouter.get("/quiz/:quizId/feedback", report_controller_1.ReportController.getQuizFeedback);
