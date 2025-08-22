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
    username?: string,
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
        const session = await GameSessionManager.getSession(roomId);
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
                historyDoc.username = participant.user_name;
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
        const session = await GameSessionManager.getSession(roomId);
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

    static async fetchGuestPerformanceInSession(sessionId: string, guestName: string) {
        if (!Types.ObjectId.isValid(sessionId)) return null;
        return GameHistoryModel.aggregate([
            {
                $match: {
                    guestNickname: guestName,
                    gameSessionId: new Types.ObjectId(sessionId),
                    userId: { $exists: false }
                }
            },
            {
                $lookup: {
                    from: 'gamesessions',
                    localField: 'gameSessionId',
                    foreignField: '_id',
                    as: 'sessionInfo'
                }
            },
            { $unwind: '$sessionInfo' },

            {
                $lookup: {
                    from: 'quizzes',
                    localField: 'sessionInfo.quizId',
                    foreignField: '_id',
                    as: 'quizInfo'
                }
            },
            { $unwind: '$quizInfo' },
            {
                $project: {
                    attempts: 1, // field is now 'attempts'
                    finalScoreGained: 1, // field is now 'finalScoreGained'
                    isUltimatelyCorrect: 1, // field is now 'isUltimatelyCorrect'
                    questionId: 1,
                    questionDetails: {
                        $first: {
                            $filter: {
                                input: '$quizInfo.questions',
                                as: 'q',
                                cond: { $eq: ['$$q._id', '$questionId'] }
                            }
                        }
                    }
                }
            },

            // Stage 5: Shape the final, detailed output (UPDATED for your models)
            {
                $project: {
                    _id: 0,
                    questionId: '$questionId',
                    questionText: '$questionDetails.questionText',
                    finalScoreGained: '$finalScoreGained',
                    wasUltimatelyCorrect: '$isUltimatelyCorrect', // Use the stored value

                    // Analyze the attempts
                    changedAnswer: { $gt: [{ $size: '$attempts' }, 1] },
                    numberOfAttempts: { $size: '$attempts' },
                    thinkingTimeSeconds: {
                        // Your model stores the answer time directly, which is great!
                        $round: [
                            { $divide: [{ $last: '$attempts.answerTimeMs' }, 1000] }, 2
                        ]
                    },

                    // Map over all attempts to provide full details for each one
                    attempts: {
                        $map: {
                            input: '$attempts',
                            as: 'attempt',
                            in: {
                                // Find the option text using selectedOptionId instead of an index
                                selectedOptionText: {
                                    $let: {
                                        vars: {
                                            matchedOption: {
                                                $first: {
                                                    $filter: {
                                                        input: '$questionDetails.options',
                                                        as: 'option',
                                                        cond: { $eq: ['$$option._id', '$$attempt.selectedOptionId'] }
                                                    }
                                                }
                                            }
                                        },
                                        in: '$$matchedOption.text'
                                    }
                                },
                                isCorrect: '$$attempt.isCorrect',
                                answerTimeMs: '$$attempt.answerTimeMs'
                            }
                        }
                    }
                }
            }]);
    }

    static async fetchUserPerformanceInSession(userId: string, sessionId: string) {
        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(sessionId)) {
            return null;
        }

        return GameHistoryModel.aggregate([
            // Stage 1 & 2: Match records and join with 'gamesessions' (No changes here)
            {
                $match: {
                    userId: new Types.ObjectId(userId),
                    gameSessionId: new Types.ObjectId(sessionId)
                }
            },
            {
                $lookup: {
                    from: 'gamesessions',
                    localField: 'gameSessionId',
                    foreignField: '_id',
                    as: 'sessionInfo'
                }
            },
            { $unwind: '$sessionInfo' },

            // Stage 3 & 4: Join with 'quizzes' and find the matching question details (No changes here)
            {
                $lookup: {
                    from: 'quizzes',
                    localField: 'sessionInfo.quizId',
                    foreignField: '_id',
                    as: 'quizInfo'
                }
            },
            { $unwind: '$quizInfo' },
            {
                $project: {
                    attempts: 1, // field is now 'attempts'
                    finalScoreGained: 1, // field is now 'finalScoreGained'
                    isUltimatelyCorrect: 1, // field is now 'isUltimatelyCorrect'
                    questionId: 1,
                    questionDetails: {
                        $first: {
                            $filter: {
                                input: '$quizInfo.questions',
                                as: 'q',
                                cond: { $eq: ['$$q._id', '$questionId'] }
                            }
                        }
                    }
                }
            },

            // Stage 5: Shape the final, detailed output (UPDATED for your models)
            {
                $project: {
                    _id: 0,
                    questionId: '$questionId',
                    questionText: '$questionDetails.questionText',
                    finalScoreGained: '$finalScoreGained',
                    wasUltimatelyCorrect: '$isUltimatelyCorrect', // Use the stored value

                    // Analyze the attempts
                    changedAnswer: { $gt: [{ $size: '$attempts' }, 1] },
                    numberOfAttempts: { $size: '$attempts' },
                    thinkingTimeSeconds: {
                        // Your model stores the answer time directly, which is great!
                        $round: [
                            { $divide: [{ $last: '$attempts.answerTimeMs' }, 1000] }, 2
                        ]
                    },

                    // Map over all attempts to provide full details for each one
                    attempts: {
                        $map: {
                            input: '$attempts',
                            as: 'attempt',
                            in: {
                                // Find the option text using selectedOptionId instead of an index
                                selectedOptionText: {
                                    $let: {
                                        vars: {
                                            matchedOption: {
                                                $first: {
                                                    $filter: {
                                                        input: '$questionDetails.options',
                                                        as: 'option',
                                                        cond: { $eq: ['$$option._id', '$$attempt.selectedOptionId'] }
                                                    }
                                                }
                                            }
                                        },
                                        in: '$$matchedOption.text'
                                    }
                                },
                                isCorrect: '$$attempt.isCorrect',
                                answerTimeMs: '$$attempt.answerTimeMs'
                            }
                        }
                    }
                }
            }
        ]);
    }


    static async addFeedback(sessionId: string, userId: string, rating: number, comment: string) {
        if (!Types.ObjectId.isValid(sessionId) || !Types.ObjectId.isValid(userId)) {
            return null;
        }
        const feedback = {
            rating: rating,
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
                    name: { $first: { $ifNull: ["$username", "$guestNickname"] } },
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

    static async getLeaderboardForQuiz(quizId: string) {
        if (!Types.ObjectId.isValid(quizId)) {
            throw new Error("Invalid quiz ID");
        }

        const leaderboard = await GameSessionModel.aggregate([
            // Stage 1: Filter for completed game sessions for the specific quiz.
            {
                $match: {
                    quizId: new Types.ObjectId(quizId),
                    status: 'completed'
                }
            },
            // Stage 2: Deconstruct the results array to process each player's result.
            {
                $unwind: "$results"
            },
            // Stage 3: Group by player to find their highest score.
            // We group by userId for registered users and nickname for guests.
            {
                $group: {
                    _id: {
                        userId: "$results.userId",
                        nickname: "$results.nickname"
                    },
                    maxScore: { $max: "$results.finalScore" },
                    // Keep the userId for the lookup stage
                    userId: { $first: "$results.userId" }
                }
            },
            // Stage 4: Sort by the highest score in descending order.
            {
                $sort: {
                    maxScore: -1
                }
            },
            // Stage 5: Limit to the top 20 players.
            {
                $limit: 20
            },
            // Stage 6: Populate user details for registered players.
            {
                $lookup: {
                    from: 'users', // The name of the users collection
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            // Stage 7: Shape the final output.
            {
                $project: {
                    _id: 0,
                    score: "$maxScore",
                    // Conditionally choose the name from the userDetails or the guest nickname
                    name: {
                        $ifNull: [{ $arrayElemAt: ["$userDetails.name", 0] }, "$_id.nickname"]
                    },
                    profileUrl: {
                        $ifNull: [{ $arrayElemAt: ["$userDetails.profileUrl", 0] }, null]
                    }
                }
            },
            // Stage 8: Add a rank to the final output
            {
                $group: {
                    _id: null,
                    players: { $push: "$$ROOT" }
                }
            },
            {
                $unwind: {
                    path: "$players",
                    includeArrayIndex: "players.rank"
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$players"
                }
            },
            {
                $addFields: {
                    "rank": { $add: ["$rank", 1] }
                }
            }
        ]);

        return leaderboard;
    }
}
