import { GameHistoryModel,IGameHistory } from '../model/GameHistory'; 
import { GameSessionModel } from '../model/GameSession';

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



export const QuizHistoryRepository = {
  async getHostedQuizzesByUser(userId: string): Promise<IFormattedQuizHistory[]> {
    const quizzes = await GameSessionModel.aggregate([
      {
        $match: {
          hostId: new mongoose.Types.ObjectId(userId)
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
    return quizzes as IFormattedQuizHistory[];
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