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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
const mongoose_1 = require("mongoose");
const GameSession_1 = require("../model/GameSession");
const GameHistory_1 = require("../model/GameHistory");
const Quiz_1 = require("../model/Quiz");
class ReportRepository {
    static getLeaderboardAndUserRank(limit, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                // 1) Only completed games
                { $match: { status: "completed", "results.0": { $exists: true } } },
                // 2) Unwind participants
                { $unwind: "$results" },
                // 3) Group by userId (or nickname for guest)
                {
                    $group: {
                        _id: {
                            id: { $ifNull: ["$results.userId", "$results.nickname"] },
                            type: { $cond: { if: "$results.userId", then: "user", else: "guest" } }
                        },
                        name: { $first: "$results.nickname" },
                        userId: { $first: "$results.userId" },
                        totalGamesPlayed: { $sum: 1 },
                        totalScore: { $sum: "$results.finalScore" }
                    }
                },
                // 4) Compute average points per game
                {
                    $addFields: {
                        averageScore: {
                            $cond: [
                                { $gt: ["$totalGamesPlayed", 0] },
                                { $round: [{ $divide: ["$totalScore", "$totalGamesPlayed"] }, 0] },
                                0
                            ]
                        }
                    }
                },
                // 5) Sort purely by totalScore (descending)
                { $sort: { totalScore: -1 } },
                // 6) Group to prepare ranking
                { $group: { _id: null, players: { $push: "$$ROOT" } } },
                { $unwind: { path: "$players", includeArrayIndex: "rank" } },
                // 7) Lookup user profile (optional)
                {
                    $lookup: {
                        from: "users",
                        localField: "players.userId",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                // 8) Final output
                {
                    $project: {
                        _id: "$players._id.id",
                        rank: { $add: ["$rank", 1] }, // 1-based
                        name: { $ifNull: [{ $first: "$userData.name" }, "$players.name"] },
                        profileUrl: { $ifNull: [{ $first: "$userData.profileUrl" }, null] },
                        totalGamesPlayed: "$players.totalGamesPlayed",
                        totalScore: "$players.totalScore",
                        averageScore: "$players.averageScore",
                        isGuest: { $eq: ["$players._id.type", "guest"] }
                    }
                }
            ];
            const allPlayers = yield GameSession_1.GameSessionModel.aggregate(pipeline);
            const leaderboard = allPlayers.slice(0, limit);
            let userRank = null;
            if (userId) {
                const userIdStr = new mongoose_1.Types.ObjectId(userId).toString();
                userRank = allPlayers.find(p => { var _a, _b; return ((_b = (_a = p._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) === userIdStr || p._id === userIdStr; }) || null;
            }
            return { leaderboard, userRank };
        });
    }
    static findQuizzesByCreator(creatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Quiz_1.QuizModel.find({ creatorId: new mongoose_1.Types.ObjectId(creatorId) })
                .select('title dificulty createdAt')
                .sort({ createdAt: -1 })
                .lean();
            return results.map(quiz => ({
                _id: quiz._id.toString(),
                title: quiz.title,
                dificulty: quiz.dificulty,
                createdAt: quiz.createdAt,
            }));
        });
    }
    static getQuizAnalytics(quizId, creatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const quizObjectId = new mongoose_1.Types.ObjectId(quizId);
                const creatorObjectId = new mongoose_1.Types.ObjectId(creatorId);
                const quiz = yield Quiz_1.QuizModel.findOne({
                    _id: quizObjectId,
                    $or: [{ creatorId: creatorObjectId }, { forkBy: creatorObjectId }]
                }).select('title questions').lean();
                if (!quiz) {
                    return null;
                }
                const totalQuestions = ((_a = quiz.questions) === null || _a === void 0 ? void 0 : _a.length) || 0;
                if (totalQuestions === 0) {
                    return {
                        quizId: quiz._id.toString(),
                        quizTitle: quiz.title,
                        totalSessions: 0,
                        totalUniquePlayers: 0,
                        averageQuizScore: 0,
                        playerPerformance: {
                            passOrFail: { passed: 0, failed: 0 },
                            scoreDistribution: { '0-49%': 0, '50-69%': 0, '70-89%': 0, '90-100%': 0 },
                            fastResponses: 0,
                        },
                        engagementMetrics: {
                            uniquePlayers: 0,
                            totalSessions: 0,
                            averageCompletionRate: 0,
                        }
                    };
                }
                const questionTimeLimits = new Map();
                (_b = quiz.questions) === null || _b === void 0 ? void 0 : _b.forEach(q => {
                    if (q.timeLimit) {
                        questionTimeLimits.set(q._id.toString(), q.timeLimit * 1000 * 0.5); // 50% in milliseconds
                    }
                });
                const detailedHistory = yield GameHistory_1.GameHistoryModel.find({ quizId: quizObjectId }).lean();
                const playerMetricsMap = new Map();
                detailedHistory.forEach(historyItem => {
                    const playerId = historyItem.userId ? historyItem.userId.toString() : historyItem.guestNickname;
                    if (!playerId)
                        return;
                    if (!playerMetricsMap.has(playerId)) {
                        playerMetricsMap.set(playerId, { totalCorrect: 0, totalAnswered: 0, fastResponsesCount: 0, totalQuestions: totalQuestions });
                    }
                    const metrics = playerMetricsMap.get(playerId);
                    if (historyItem.isUltimatelyCorrect) {
                        metrics.totalCorrect++;
                    }
                    if (historyItem.attempts && historyItem.attempts.length > 0) {
                        const lastAttempt = historyItem.attempts[historyItem.attempts.length - 1];
                        metrics.totalAnswered++;
                        const questionId = historyItem.questionId.toString();
                        const timeLimit = questionTimeLimits.get(questionId);
                        if (timeLimit !== undefined && lastAttempt.answerTimeMs <= timeLimit) {
                            metrics.fastResponsesCount++;
                        }
                    }
                });
                const playerMetrics = Array.from(playerMetricsMap.values());
                const totalUniquePlayers = playerMetrics.length;
                const totalSessions = yield GameHistory_1.GameHistoryModel.distinct('gameSessionId', { quizId: quizObjectId }).then(ids => ids.length);
                let passed = 0;
                let failed = 0;
                let fastThinkers = 0;
                const allCorrectnessPercentages = [];
                const fastThinkerThreshold = Math.floor(totalQuestions * 0.5);
                const scoreDist = {
                    '0-49%': 0, '50-69%': 0, '70-89%': 0, '90-100%': 0
                };
                playerMetrics.forEach(p => {
                    const correctnessPercentage = p.totalQuestions > 0 ? (p.totalCorrect / p.totalQuestions) * 100 : 0;
                    allCorrectnessPercentages.push(correctnessPercentage);
                    // Check if player is a "fast thinker"
                    if (p.fastResponsesCount > fastThinkerThreshold) {
                        fastThinkers++;
                    }
                    if (correctnessPercentage >= 50) {
                        passed++;
                    }
                    else {
                        failed++;
                    }
                    if (correctnessPercentage >= 90) {
                        scoreDist['90-100%']++;
                    }
                    else if (correctnessPercentage >= 70) {
                        scoreDist['70-89%']++;
                    }
                    else if (correctnessPercentage >= 50) {
                        scoreDist['50-69%']++;
                    }
                    else {
                        scoreDist['0-49%']++;
                    }
                });
                const averageQuizScore = totalUniquePlayers > 0
                    ? allCorrectnessPercentages.reduce((sum, score) => sum + score, 0) / totalUniquePlayers
                    : 0;
                const averageCompletionRate = totalUniquePlayers > 0
                    ? playerMetrics.reduce((sum, p) => sum + (p.totalAnswered / p.totalQuestions) * 100, 0) / totalUniquePlayers
                    : 0;
                return {
                    quizId: quiz._id.toString(),
                    quizTitle: quiz.title,
                    totalSessions: totalSessions,
                    totalUniquePlayers: totalUniquePlayers,
                    averageQuizScore: parseFloat(averageQuizScore.toFixed(2)),
                    playerPerformance: {
                        passOrFail: { passed, failed },
                        scoreDistribution: scoreDist,
                        fastResponses: fastThinkers,
                    },
                    engagementMetrics: {
                        uniquePlayers: totalUniquePlayers,
                        totalSessions: totalSessions,
                        averageCompletionRate: parseFloat(averageCompletionRate.toFixed(2)),
                    }
                };
            }
            catch (error) {
                console.error("Error in getQuizAnalytics:", error);
                return null;
            }
        });
    }
    static fetchUserActivityFeed(userId, page, limit, roleFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = new mongoose_1.Types.ObjectId(userId);
            const skip = (page - 1) * limit;
            // --- DYNAMIC MATCH QUERY ---
            const matchQuery = {
                status: "completed",
            };
            const playerCondition = { "results.userId": userObjectId };
            const hostCondition = { hostId: userObjectId, mode: { $ne: "solo" } };
            if (roleFilter === 'player') {
                matchQuery.$or = [playerCondition];
            }
            else if (roleFilter === 'host') {
                matchQuery.$or = [hostCondition];
            }
            else { // 'all' is the default
                matchQuery.$or = [playerCondition, hostCondition];
            }
            // --- END DYNAMIC MATCH QUERY ---
            const [sessions, total] = yield Promise.all([
                GameSession_1.GameSessionModel.aggregate([
                    { $match: matchQuery },
                    { $sort: { endedAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $unwind: "$results" },
                    {
                        $lookup: {
                            from: "gamehistories",
                            let: { sessionId: "$_id", participantId: "$results.userId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$gameSessionId", "$$sessionId"] },
                                                { $eq: ["$userId", "$$participantId"] },
                                                { $eq: ["$isUltimatelyCorrect", true] }
                                            ]
                                        }
                                    }
                                },
                                { $count: "count" }
                            ],
                            as: "correctAnswersLookup"
                        }
                    },
                    {
                        $addFields: {
                            "results.correctAnswers": { $ifNull: [{ $first: "$correctAnswersLookup.count" }, 0] }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            hostId: { $first: "$hostId" },
                            quizId: { $first: "$quizId" },
                            endedAt: { $first: "$endedAt" },
                            results: { $push: "$results" }
                        }
                    },
                    { $sort: { endedAt: -1 } },
                    {
                        $lookup: {
                            from: "quizzes",
                            localField: "quizId",
                            foreignField: "_id",
                            as: "quiz"
                        }
                    },
                    { $unwind: "$quiz" },
                    {
                        $addFields: {
                            totalQuestions: { $size: "$quiz.questions" }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            quizTitle: "$quiz.title",
                            quizzId: "$quiz._id",
                            endedAt: 1,
                            role: { $cond: { if: { $eq: ["$hostId", userObjectId] }, then: "host", else: "player" } },
                            playerCount: { $size: "$results" },
                            averageScore: {
                                $cond: {
                                    if: { $and: [{ $gt: ["$totalQuestions", 0] }, { $gt: [{ $size: "$results" }, 0] }] },
                                    then: {
                                        $avg: {
                                            $map: {
                                                input: "$results",
                                                as: "r",
                                                in: { $multiply: [{ $divide: ["$$r.correctAnswers", "$totalQuestions"] }, 100] }
                                            }
                                        }
                                    },
                                    else: 0
                                }
                            },
                            playerResult: {
                                $first: {
                                    $map: {
                                        input: { $filter: { input: "$results", as: "r", cond: { $eq: ["$$r.userId", userObjectId] } } },
                                        as: "self",
                                        in: {
                                            finalScore: "$$self.finalScore",
                                            finalRank: "$$self.finalRank"
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]),
                // Count documents using the same dynamic query for accurate pagination
                GameSession_1.GameSessionModel.countDocuments(matchQuery)
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                activities: sessions,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        });
    }
    static fetchQuizFeedback(quizId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const quizObjectId = new mongoose_1.Types.ObjectId(quizId);
            const skip = (page - 1) * limit;
            const [pagedFeedbacks, totalResult] = yield Promise.all([
                GameSession_1.GameSessionModel.aggregate([
                    { $match: { quizId: quizObjectId, status: "completed", "feedback.0": { $exists: true } } },
                    { $sort: { createdAt: -1 } },
                    { $project: { feedback: 1, _id: 0 } },
                    { $unwind: "$feedback" },
                    { $replaceRoot: { newRoot: "$feedback" } },
                    { $skip: skip },
                    { $limit: limit }
                ]),
                GameSession_1.GameSessionModel.aggregate([
                    { $match: { quizId: quizObjectId, status: "completed", "feedback.0": { $exists: true } } },
                    { $unwind: "$feedback" },
                    { $count: "total" }
                ])
            ]);
            const total = ((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            const totalPages = Math.ceil(total / limit);
            return {
                feedbacks: pagedFeedbacks,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        });
    }
}
exports.ReportRepository = ReportRepository;
