import { GameHistoryModel,IGameHistory } from '../model/GameHistory'; 
import { IQuestion,QuizModel } from '../model/Quiz';
import mongoose, { Types } from 'mongoose';

export interface IFormattedQuizHistory {
    id: string;
    title: string;
    category: string;
    date: string; // ISO format
    score: number; // Percentage
    totalQuestions: number;
    duration: string; 
    difficulty: 'Hard' | 'Medium' | 'Easy';
    status: "Completed";
    rating: number; // Will be mocked for now
    participants: number;
    lastUpdated: string; // Will be derived from the date
    description: string;
}

const calculateTotalPossiblePoints = (questions: IQuestion[]): number => {
    return questions.reduce((acc, q) => acc + q.point, 0);
};

const calculateTotalDuration = (questions: IQuestion[]): number => {
    const totalSeconds = questions.reduce((acc, q) => acc + q.timeLimit, 0);
    return Math.round(totalSeconds / 60);
};


export const QuizHistoryRepository = {

    async getFormattedQuizHistory(userId: string): Promise<IFormattedQuizHistory[]> {

        const completedQuizzes = await GameHistoryModel.aggregate([

            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            },

            {
                $group: {
                    _id: "$quizId",
                    totalScoreGained: { $sum: "$finalScoreGained" },
                    lastPlayedDate: { $first: "$createdAt" },
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

            {
                $unwind: "$quizDetails"
            },

            {
                $lookup: {
                    from: "gamesessions", 
                    localField: "_id",
                    foreignField: "quizId",
                    as: "sessions"
                }
            },
            {
                $project: {
                    _id: 0, 
                    id: "$_id",
                    title: "$quizDetails.title",
                    description: "$quizDetails.description",
                    category: { $ifNull: [{ $arrayElemAt: ["$quizDetails.tags", 0] }, "General"] },
                    date: "$lastPlayedDate",
                    totalPossiblePoints: { $sum: "$quizDetails.questions.point" },
                    totalScoreGained: "$totalScoreGained",
                    totalQuestions: { $size: "$quizDetails.questions" },
                    totalDurationSeconds: { $sum: "$quizDetails.questions.timeLimit" },
                    difficulty: "$quizDetails.dificulty",
                    participants: { $sum: { $size: "$sessions.results" } },
                }
            },
             {
                $project: {
                    id: { $toString: "$id" },
                    title: 1,
                    description: 1,
                    category: 1,
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    score: {
                        $cond: {
                            if: { $gt: ["$totalPossiblePoints", 0] },
                            then: { 
                                $round: [
                                    { $multiply: [{ $divide: ["$totalScoreGained", "$totalPossiblePoints"] }, 100] },
                                    0
                                ]
                            },
                            else: 0
                        }
                    },
                    totalQuestions: 1,
                    duration: { $concat: [{ $toString: { $round: [{ $divide: ["$totalDurationSeconds", 60] }, 0] } }, " min"] },
                    difficulty: 1,
                    status: "Completed", 
                    participants: 1,

                    rating: { $add: [3.5, { $multiply: [{ $rand: {} }, 1.5] }] },
                    lastUpdated: "a few days ago", 
                }
            }
        ]);

        return completedQuizzes;
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