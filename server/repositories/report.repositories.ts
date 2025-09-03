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
        const quizObjectId = new Types.ObjectId(quizId);
        const creatorObjectId = new Types.ObjectId(creatorId);

        const quiz = await QuizModel.findOne({
            _id: quizObjectId,
            $or: [
                { creatorId: creatorObjectId },
                { forkBy: creatorObjectId }
            ]
        }).lean();
        if (!quiz) {
            return null;
        }

        const historyAggregation = await GameHistoryModel.aggregate([
            { $match: { quizId: quizObjectId } },
            {
                $group: {
                    _id: "$userId",
                    totalCorrect: { $sum: { $cond: ["$isUltimatelyCorrect", 1, 0] } },
                    totalAnswers: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    correctnessPercentage: {
                        $cond: [{ $eq: ["$totalAnswers", 0] }, 0, { $multiply: [{ $divide: ["$totalCorrect", "$totalAnswers"] }, 100] }]
                    }
                }
            }
        ]);

        const sessionAggregation = await GameSessionModel.aggregate([
            { $match: { quizId: quizObjectId, status: 'completed' } },
            {
                $facet: {
                    "summary": [
                        { $unwind: "$results" },
                        {
                            $group: {
                                _id: null,
                                totalPlayers: { $addToSet: "$results.userId" },
                                totalSessions: { $addToSet: "$_id" },
                                averageScore: { $avg: "$results.finalScore" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                totalPlayers: { $size: "$totalPlayers" },
                                totalSessions: { $size: "$totalSessions" },
                                averageScore: { $ifNull: ["$averageScore", 0] }
                            }
                        }
                    ]
                }
            }
        ]);

        const summaryData = sessionAggregation[0]?.summary;
        const summary = (summaryData && summaryData.length > 0)
            ? summaryData[0]
            : { totalPlayers: 0, totalSessions: 0, averageScore: 0 };

        let below50 = 0, between50and70 = 0, above70 = 0;
        historyAggregation.forEach(p => {
            if (p.correctnessPercentage < 50) below50++;
            else if (p.correctnessPercentage <= 70) between50and70++;
            else above70++;
        });
        const totalParticipantsWithHistory = historyAggregation.length;

        return {
            quizId: quiz._id.toString(),
            quizTitle: quiz.title,
            totalSessions: summary.totalSessions,
            totalUniquePlayers: summary.totalPlayers,
            averageQuizScore: Math.round(summary.averageScore),
            playerPerformance: {
                averageCompletionRate: totalParticipantsWithHistory > 0 ? Math.round(historyAggregation.reduce((acc, p) => acc + p.correctnessPercentage, 0) / totalParticipantsWithHistory) : 0,
                correctnessDistribution: {
                    below50Percent: totalParticipantsWithHistory > 0 ? Math.round((below50 / totalParticipantsWithHistory) * 100) : 0,
                    between50And70Percent: totalParticipantsWithHistory > 0 ? Math.round((between50and70 / totalParticipantsWithHistory) * 100) : 0,
                    above70Percent: totalParticipantsWithHistory > 0 ? Math.round((above70 / totalParticipantsWithHistory) * 100) : 0,
                }
            },
        };
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
