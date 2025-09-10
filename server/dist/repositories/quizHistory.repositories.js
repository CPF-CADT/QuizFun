"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizHistoryRepository = void 0;
const GameSession_1 = require("../model/GameSession");
const mongoose_1 = __importDefault(require("mongoose"));
exports.QuizHistoryRepository = {
    getHostedQuizzesByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const quizzes = yield GameSession_1.GameSessionModel.aggregate([
                {
                    $match: {
                        hostId: new mongoose_1.default.Types.ObjectId(userId)
                    }
                },
                {
                    $group: {
                        _id: "$quizId",
                        lastSessionId: { $last: "$_id" },
                        lastStartedAt: { $max: "$startedAt" },
                        participants: { $sum: { $size: { $ifNull: ["$results", []] } } }
                    }
                },
                {
                    $lookup: {
                        from: "quizzes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "quizDetails"
                    }
                },
                { $unwind: "$quizDetails" },
                {
                    $project: {
                        id: { $toString: "$_id" },
                        title: "$quizDetails.title",
                        description: "$quizDetails.description",
                        category: { $ifNull: [{ $arrayElemAt: ["$quizDetails.tags", 0] }, "General"] },
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$lastStartedAt" } },
                        score: { $literal: 0 },
                        totalQuestions: { $size: "$quizDetails.questions" },
                        duration: { $concat: [{ $toString: { $divide: [{ $sum: "$quizDetails.questions.timeLimit" }, 60] } }, " min"] },
                        difficulty: "$quizDetails.dificulty",
                        status: { $literal: "Completed" },
                        rating: { $literal: 5 },
                        participants: 1,
                        lastUpdated: { $dateToString: { format: "%Y-%m-%d", date: "$quizDetails.updatedAt" } }
                    }
                }
            ]);
            return quizzes;
        });
    }
};
// Example usage:
//
// const userId = "some-user-id-from-request";
// QuizHistoryRepository.getFormattedQuizHistory(userId)
//     .then(history => {
//         console.log(history);
//     })
//     .catch(err => {
//         console.error("Failed to get quiz history:", err);
//     });
