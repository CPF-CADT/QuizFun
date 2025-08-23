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
}