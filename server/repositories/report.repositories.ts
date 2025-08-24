import { Types } from 'mongoose';
import { GameSessionModel } from '../model/GameSession';
import { GameHistoryModel } from '../model/GameHistory';
import { QuizModel } from '../model/Quiz';
import { IReportQuizListItem, IQuizAnalytics, IFeedback } from '../dto/ReportDTOs';

export class ReportRepository {

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

        // First, verify the user owns the quiz
        const quiz = await QuizModel.findOne({ _id: quizObjectId, creatorId: creatorObjectId }).lean();
        if (!quiz) {
            return null; // Or throw an error for "not found or not authorized"
        }

        // Aggregate data from GameHistory
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

        // Aggregate data from GameSessions
        const sessionAggregation = await GameSessionModel.aggregate([
            { $match: { quizId: quizObjectId, status: 'completed' } },
            {
                $facet: {
                    "summary": [
                        // This part is correct and remains unchanged
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
                    ],
                    "feedback": [
                        { $unwind: "$results" },
                        // FIX: Add a second $unwind stage for the feedback array itself.
                        // This correctly filters out players with empty feedback arrays.
                        { $unwind: "$results.feedback" },
                        // Now, $replaceRoot will only receive actual feedback objects.
                        { $replaceRoot: { newRoot: "$results.feedback" } }
                    ]
                }
            }
        ]);


        const summaryData = sessionAggregation[0]?.summary;
        const summary = (summaryData && summaryData.length > 0)
            ? summaryData[0]
            : { totalPlayers: 0, totalSessions: 0, averageScore: 0 };
        const feedback: IFeedback[] = sessionAggregation[0]?.feedback || [];

        let below50 = 0;
        let between50and70 = 0;
        let above70 = 0;
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

            recommendations: {
                feedback
            }
        };
    }
    static async fetchUserActivityFeed(userId: string, page: number, limit: number) {
        const userObjectId = new Types.ObjectId(userId);
        const skip = (page - 1) * limit;

        const [sessions, total] = await Promise.all([
            GameSessionModel.aggregate([
                // 1. Initial match for the user's sessions
                {
                    $match: {
                        status: "completed",
                        $or: [{ hostId: userObjectId }, { "results.userId": userObjectId }]
                    }
                },
                // 2. Sort and Paginate
                { $sort: { endedAt: -1 } },
                { $skip: skip },
                { $limit: limit },

                // 3. Deconstruct the results array to process each participant individually
                { $unwind: "$results" },

                // 4. Lookup each participant's correct answers from the gamehistories collection
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

                // 5. Add the count of correct answers to each participant's data
                {
                    $addFields: {
                        "results.correctAnswers": {
                            $ifNull: [{ $first: "$correctAnswersLookup.count" }, 0]
                        }
                    }
                },

                // 6. Group the participants back into a single session document
                {
                    $group: {
                        _id: "$_id",
                        hostId: { $first: "$hostId" },
                        quizId: { $first: "$quizId" },
                        endedAt: { $first: "$endedAt" },
                        results: { $push: "$results" }
                    }
                },

                // 7. Now, lookup the quiz details (like before)
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

                // 8. Final projection with the correct data
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
                                            in: {
                                                $multiply: [{ $divide: ["$$r.correctAnswers", "$totalQuestions"] }, 100]
                                            }
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
            // Total count for pagination
            GameSessionModel.countDocuments({
                status: "completed",
                $or: [{ hostId: userObjectId }, { "results.userId": userObjectId }]
            })
        ]);

        return {
            sessions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total
        };
    }
}
