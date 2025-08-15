import { Types } from 'mongoose';
import { GameSessionModel, IGameSession } from '../model/GameSession';
import { GameHistoryModel } from '../model/GameHistory';
import { GameSessionManager } from '../config/data/GameSession';
import { FinalResultData, DetailedAnswer } from '../sockets/type'; 
import { QuizModel } from '../model/Quiz';
interface AnswerAttemptData {
    selectedOptionId: Types.ObjectId;
    isCorrect: boolean;
    answerTimeMs: number;
}

interface GameHistoryCreationData {
    gameSessionId: Types.ObjectId;
    quizId: Types.ObjectId;
    questionId: Types.ObjectId;
    userId?: Types.ObjectId;
    guestNickname?: string;
    attempts: AnswerAttemptData[];
    isUltimatelyCorrect: boolean;
    finalScoreGained: number;
}

export interface ResultsPayload {
    viewType: 'host' | 'player' | 'guest';
    results: FinalResultData[];
}


export class GameRepository {

    // static async createGameSession(roomId: number): Promise<IGameSession | null> {
    //     const session = GameSessionManager.getSession(roomId);
    //     if (!session) {
    //         return null;
    //     }

    //     const newGameSession = await GameSessionModel.create({
    //         quizId: session.quizId,
    //         hostId: session.hostId,
    //         joinCode: roomId,
    //         status: 'in_progress',
    //         startedAt: new Date(),
    //     });

    //     session.dbId = newGameSession._id;
    //     return newGameSession;
    // }

    static async saveRoundHistory(roomId: number, scoresGained: Map<string, number>): Promise<void> {
        const session = GameSessionManager.getSession(roomId);
        // Use the new `sessionId` property which is a required string.
        if (!session || !session.sessionId || !session.questions) {
            return;
        }

        const currentQuestion = session.questions[session.currentQuestionIndex];
        if (!currentQuestion?._id) {
            return;
        }

        const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
        const historyDocsToCreate: GameHistoryCreationData[] = [];

        for (const participant of session.participants) {
            if (participant.role === 'host' || !participant.user_id) continue;

            const playerAnswers = session.answers.get(participant.user_id);
            if (!playerAnswers || playerAnswers.length === 0) continue;

            const attempts: AnswerAttemptData[] = playerAnswers.map(answer => {
                const selectedOption = currentQuestion.options[answer.optionIndex];
                return {
                    selectedOptionId: selectedOption._id as Types.ObjectId,
                    isCorrect: answer.optionIndex === correctAnswerIndex,
                    answerTimeMs: Math.round((currentQuestion.timeLimit - answer.remainingTime) * 1000),
                };
            });
            
            const lastAttempt = attempts.at(-1)!;

            const historyDoc: GameHistoryCreationData = {
                // Convert the session.sessionId string back to an ObjectId for the DB
                gameSessionId: new Types.ObjectId(session.sessionId),
                quizId: new Types.ObjectId(session.quizId),
                questionId: currentQuestion._id,
                attempts: attempts,
                isUltimatelyCorrect: lastAttempt.isCorrect,
                finalScoreGained: scoresGained.get(participant.user_id) || 0,
            };

            if (Types.ObjectId.isValid(participant.user_id)) {
                historyDoc.userId = new Types.ObjectId(participant.user_id);
                historyDoc.guestNickname = participant.user_name;
            } else {
                historyDoc.guestNickname = participant.user_name;
            }

            historyDocsToCreate.push(historyDoc);
        }

        if (historyDocsToCreate.length > 0) {
            try {
                await GameHistoryModel.insertMany(historyDocsToCreate, { ordered: false });
            } catch (error) {
                console.error(`Error batch inserting history for room ${roomId}:`, error);
            }
        }
    }

    static async finalizeGameSession(roomId: number): Promise<void> {
        const session = GameSessionManager.getSession(roomId);
        if (!session || !session.sessionId) {
            return;
        }

        const finalResults = session.participants
            .filter(p => p.role !== 'host')
            .sort((a, b) => b.score - a.score)
            .map((p, index) => ({
                userId: (p.user_id && Types.ObjectId.isValid(p.user_id))
                    ? new Types.ObjectId(p.user_id)
                    : null,
                nickname: p.user_name,
                finalScore: p.score,
                finalRank: index + 1,
            }));
            
        try {
            // Use session.sessionId to find the document to update
            await GameSessionModel.findByIdAndUpdate(session.sessionId, {
                status: 'completed',
                endedAt: new Date(),
                results: finalResults,
            });
        } catch (error) {
            console.error(`Error finalizing game session for room ${roomId}:`, error);
        }
    }
    static async updateSessionStatus(sessionId: string, status: 'in_progress' | 'completed'): Promise<void> {
        try {
            await GameSessionModel.findByIdAndUpdate(sessionId, { status });
        } catch (error) {
            console.error(`Error updating session ${sessionId} status to ${status}:`, error);
        }
    }
    static async fetchGameSessions(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            GameSessionModel.find().sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
            GameSessionModel.countDocuments()
        ]);
        return { total, limit, totalPages: Math.ceil(total / limit), currentPage: page, data };
    }

    static async fetchUserGameHistory(userId: string) {
        if (!Types.ObjectId.isValid(userId)) return [];
        return GameHistoryModel.aggregate([
            { $match: { userId: new Types.ObjectId(userId) } },
            { $lookup: { from: 'gamesessions', localField: 'gameSessionId', foreignField: '_id', as: 'gameSession' } },
            { $unwind: '$gameSession' },
            { $sort: { 'gameSession.startedAt': -1 } }
        ]);
    }

    static async findSessionById(sessionId: string): Promise<IGameSession | null> {
        if (!Types.ObjectId.isValid(sessionId)) return null;
        return GameSessionModel.findById(sessionId).lean();
    }

    static async fetchHistoryForSession(sessionId: string) {
        if (!Types.ObjectId.isValid(sessionId)) return [];
        return GameHistoryModel.find({ gameSessionId: new Types.ObjectId(sessionId) })
            .populate('userId', 'name email')
            .lean();
    }
    
    static async fetchUserPerformanceOnQuiz(userId: string, quizId: string) {
        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(quizId)) return [];
        return GameHistoryModel.aggregate([
            { $match: { userId: new Types.ObjectId(userId), quizId: new Types.ObjectId(quizId) } },
            { $lookup: { from: 'gamesessions', localField: 'gameSessionId', foreignField: '_id', as: 'gameSession' } },
            { $unwind: '$gameSession' },
            { $sort: { 'gameSession.startedAt': -1 } }
        ]);
    }

    static async addFeedback(sessionId: string, userId: string, rating: number, comment: string) {
        if (!Types.ObjectId.isValid(sessionId) || !Types.ObjectId.isValid(userId)) {
            return null;
        }
        const feedback = {
            rating: Types.Decimal128.fromString(rating.toString()),
            comment: comment,
        };
        return GameSessionModel.updateOne(
            { _id: new Types.ObjectId(sessionId), 'results.userId': new Types.ObjectId(userId) },
            { $push: { 'results.$.feedback': feedback } }
        );
    }

    static async fetchFinalResults(sessionId: string, identifier: { userId?: string; guestName?: string }): Promise<ResultsPayload | null> {
        const sessionObjectId = new Types.ObjectId(sessionId);

        const session = await GameSessionModel.findById(sessionObjectId).lean();
        if (!session) return null;

        const isHost = !!(identifier.userId && session.hostId.equals(identifier.userId));
        const viewType: 'host' | 'player' | 'guest' = isHost ? 'host' : (identifier.guestName ? 'guest' : 'player');

        const pipeline: any[] = [
            { $match: { gameSessionId: sessionObjectId } },
            {
                $group: {
                    _id: { userId: "$userId", guestNickname: "$guestNickname" },
                    name: { $first: "$guestNickname" },
                    score: { $sum: "$finalScoreGained" },
                    correctAnswers: { $sum: { $cond: [{ $eq: ["$isUltimatelyCorrect", true] }, 1, 0] } },
                    totalQuestions: { $sum: 1 },
                    totalTimeMs: { $sum: { $ifNull: [{ $last: "$attempts.answerTimeMs" }, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    participantId: "$_id.userId",
                    name: "$name",
                    score: "$score",
                    correctAnswers: "$correctAnswers",
                    totalQuestions: "$totalQuestions",
                    percentage: {
                        $cond: { if: { $gt: ["$totalQuestions", 0] }, then: { $multiply: [{ $divide: ["$correctAnswers", "$totalQuestions"] }, 100] }, else: 0 }
                    },
                    averageTime: {
                        $cond: { 
                            if: { $gt: ["$correctAnswers", 0] }, 
                            then: { $divide: ["$totalTimeMs", { $multiply: ["$correctAnswers", 1000] }] }, 
                            else: 0 
                        }
                    }
                }
            },
            { $sort: { score: -1 } }
        ];

        let allResults: FinalResultData[] = await GameHistoryModel.aggregate(pipeline);

        for (const result of allResults) {
            const isSelf = (identifier.userId && result.participantId?.toString() === identifier.userId) || (identifier.guestName && result.name === identifier.guestName);
            if (isHost || isSelf) {
                const query = result.participantId ? { userId: result.participantId } : { guestNickname: result.name };
                const historyDocs = await GameHistoryModel.find({
                    gameSessionId: sessionObjectId,
                    ...query
                }).lean();

                if (historyDocs.length === 0) {
                    result.detailedAnswers = []; 
                    continue;
                }
                const quiz = await QuizModel.findById(historyDocs[0].quizId)
                                            .select('questions') 
                                            .lean();

                const questionsMap = new Map(quiz?.questions.map(q => [q._id.toString(), q]));
                result.detailedAnswers = historyDocs.map((doc): DetailedAnswer => {
                    const question = questionsMap.get(doc.questionId.toString());
                    const detailedAttempts = doc.attempts.map(attempt => {
                        const selectedOption = question?.options.find(
                            opt => opt._id.equals(attempt.selectedOptionId)
                        );
                        return {
                            selectedOptionText: selectedOption?.text || "N/A",
                            answerTimeMs: attempt.answerTimeMs, 
                            isCorrect: attempt.isCorrect      
                        };
                    });

                    return {
                        _id: doc._id.toString(),
                        isUltimatelyCorrect: doc.isUltimatelyCorrect,
                        questionId: {
                            questionText: question?.questionText || "Question not found",
                        },
                        attempts: detailedAttempts
                    };
                });
            }
        }

        const finalResults = isHost ? allResults : allResults.filter(r =>
            (identifier.userId && r.participantId?.toString() === identifier.userId) ||
            (identifier.guestName && r.name === identifier.guestName)
        );

        return { viewType, results: finalResults };
    }
}
