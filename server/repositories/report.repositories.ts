import { PipelineStage, Types } from 'mongoose';
import { GameSessionModel } from '../model/GameSession';
import { GameHistoryModel } from '../model/GameHistory';
import { QuizModel } from '../model/Quiz';
import { IReportQuizListItem, IQuizAnalytics, IFeedback, IFeedbackResponse } from '../dto/ReportDTOs';
import redisClient from '../config/redis';
export interface IActivitySession {
    _id: Types.ObjectId;
    quizTitle: string;
    quizzId: Types.ObjectId;
    endedAt: Date;
    role: 'host' | 'player';
    playerCount: number;
    averageScore: number;
    playerResult?: {
        finalScore: number;
        finalRank: number;
    };
}

export interface IActivityFeedResponse {
    activities: IActivitySession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ILeaderboardPlayer {
    _id: string | object;
    rank: number;
    isGuest: boolean;
    name: string;
    profileUrl?: string;
    totalGamesPlayed: number;
    totalScore: number;
    averageScore: number;
    averageAccuracy: number;
}

export interface ILeaderboardResponse {
    leaderboard: ILeaderboardPlayer[];
    userRank?: ILeaderboardPlayer | null;
}
export class ReportRepository {

    static async getLeaderboardAndUserRank(limit: number, userId?: string): Promise<ILeaderboardResponse> {
        const pipeline: PipelineStage[] = [
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

        const allPlayers = await GameSessionModel.aggregate(pipeline);

        const leaderboard = allPlayers.slice(0, limit);
        let userRank: ILeaderboardPlayer | null = null;

        if (userId) {
            const userIdStr = new Types.ObjectId(userId).toString();
            userRank = allPlayers.find(
                p => p._id?.toString?.() === userIdStr || p._id === userIdStr
            ) || null;
        }

        return { leaderboard, userRank };
    }


    static async findQuizzesByCreator(creatorId: string): Promise<IReportQuizListItem[]> {
        const results = await QuizModel.find({ creatorId: new Types.ObjectId(creatorId) })
            .select('title dificulty createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return results.map(quiz => ({
            _id: quiz._id.toString(),
            title: quiz.title,
            dificulty: quiz.dificulty,
            createdAt: quiz.createdAt,
        }));
    }

    static async getQuizAnalytics(quizId: string, creatorId: string): Promise<IQuizAnalytics | null> {
        try {
            const quizObjectId = new Types.ObjectId(quizId);
            const creatorObjectId = new Types.ObjectId(creatorId);

            const quiz = await QuizModel.findOne({
                _id: quizObjectId,
                $or: [{ creatorId: creatorObjectId }, { forkBy: creatorObjectId }]
            }).select('title questions').lean();

            if (!quiz) {
                return null;
            }

            const totalQuestions = quiz.questions?.length || 0;
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

            const questionTimeLimits = new Map<string, number>();
            quiz.questions?.forEach(q => {
                if (q.timeLimit) {
                    questionTimeLimits.set(q._id.toString(), q.timeLimit * 1000 * 0.5); // 50% in milliseconds
                }
            });

            const detailedHistory = await GameHistoryModel.find({ quizId: quizObjectId }).lean();

            const playerMetricsMap = new Map<string, {
                totalCorrect: number;
                totalAnswered: number;
                fastResponsesCount: number;
                totalQuestions: number;
            }>();

            detailedHistory.forEach(historyItem => {
                const playerId = historyItem.userId ? historyItem.userId.toString() : historyItem.guestNickname;
                if (!playerId) return;

                if (!playerMetricsMap.has(playerId)) {
                    playerMetricsMap.set(playerId, { totalCorrect: 0, totalAnswered: 0, fastResponsesCount: 0, totalQuestions: totalQuestions });
                }

                const metrics = playerMetricsMap.get(playerId)!;

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
            const totalSessions = await GameHistoryModel.distinct('gameSessionId', { quizId: quizObjectId }).then(ids => ids.length);

            let passed = 0;
            let failed = 0;
            let fastThinkers = 0;
            const allCorrectnessPercentages: number[] = [];
            const fastThinkerThreshold = Math.floor(totalQuestions * 0.5);

            const scoreDist: IQuizAnalytics['playerPerformance']['scoreDistribution'] = {
                '0-49%': 0, '50-69%': 0, '70-89%': 0, '90-100%': 0
            };

            playerMetrics.forEach(p => {
                const correctnessPercentage = p.totalQuestions > 0 ? (p.totalCorrect / p.totalQuestions) * 100 : 0;
                allCorrectnessPercentages.push(correctnessPercentage);

                // Check if player is a "fast thinker"
                if (p.fastResponsesCount > fastThinkerThreshold) {
                    fastThinkers++;
                }

                if (correctnessPercentage >= 50) { passed++; } else { failed++; }
                if (correctnessPercentage >= 90) { scoreDist['90-100%']++; }
                else if (correctnessPercentage >= 70) { scoreDist['70-89%']++; }
                else if (correctnessPercentage >= 50) { scoreDist['50-69%']++; }
                else { scoreDist['0-49%']++; }
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
        } catch (error) {
            console.error("Error in getQuizAnalytics:", error);
            return null;
        }
    }

    static async fetchUserActivityFeed(userId: string, page: number, limit: number, roleFilter: string): Promise<IActivityFeedResponse> {
        const userObjectId = new Types.ObjectId(userId);
        const skip = (page - 1) * limit;

        // --- DYNAMIC MATCH QUERY ---
        const matchQuery: any = {
            status: "completed",
        };

        const playerCondition = { "results.userId": userObjectId };
        const hostCondition = { hostId: userObjectId, mode: { $ne: "solo" } };

        if (roleFilter === 'player') {
            matchQuery.$or = [playerCondition];
        } else if (roleFilter === 'host') {
            matchQuery.$or = [hostCondition];
        } else { // 'all' is the default
            matchQuery.$or = [playerCondition, hostCondition];
        }
        // --- END DYNAMIC MATCH QUERY ---

        const [sessions, total] = await Promise.all([
            GameSessionModel.aggregate([
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
            GameSessionModel.countDocuments(matchQuery)
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
    }
    static async fetchQuizFeedback(
        quizId: string,
        page: number,
        limit: number
    ): Promise<IFeedbackResponse> {
        const quizObjectId = new Types.ObjectId(quizId);
        const skip = (page - 1) * limit;

        const [pagedFeedbacks, totalResult] = await Promise.all([
            GameSessionModel.aggregate([
                { $match: { quizId: quizObjectId, status: "completed", "feedback.0": { $exists: true } } },
                { $sort: { createdAt: -1 } },
                { $project: { feedback: 1, _id: 0 } },
                { $unwind: "$feedback" },
                { $replaceRoot: { newRoot: "$feedback" } },
                { $skip: skip },
                { $limit: limit }
            ]),
            GameSessionModel.aggregate([
                { $match: { quizId: quizObjectId, status: "completed", "feedback.0": { $exists: true } } },
                { $unwind: "$feedback" },
                { $count: "total" }
            ])
        ]);

        const total = totalResult[0]?.total || 0;
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
    }
}
