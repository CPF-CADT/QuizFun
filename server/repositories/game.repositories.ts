import { Types } from 'mongoose';
import { GameSessionModel, IGameSession } from '../model/GameSession';
import { GameHistoryModel } from '../model/GameHistory';
import { GameSessionManager } from '../config/data/GameSession';
import { FinalResultData, DetailedAnswer } from '../sockets/type';
import { QuizModel } from '../model/Quiz';
import { TeamModel } from '../model/Team';
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
export interface IDetailedAnswer {
    questionId?: string; // Adding questionId for Excel export
    questionText: string;
    wasUltimatelyCorrect: boolean;
    finalScoreGained: number;
    thinkingTimeSeconds: number;
    selectedOptionText?: string; // Adding selected option text
    attempts: {
        selectedOptionText: string;
        isCorrect: boolean;
        answerTimeMs: number;
    }[];
}

export interface IParticipantResult {
    rank?: number; // Will be added in the controller
    participantId: string | null;
    name: string;
    profileUrl?: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    averageTime: number; // in seconds
    detailedPerformance: IDetailedAnswer[];
}



export class GameRepository {

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
     static async findSessionByQuizAndHost(quizId: string, hostId: string): Promise<IGameSession[] | null> {
        if (!Types.ObjectId.isValid(quizId) || !Types.ObjectId.isValid(hostId)) return null;
        return GameSessionModel.find({
            quizId: new Types.ObjectId(quizId),
            hostId: new Types.ObjectId(hostId)
        }).lean();}

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


    static async addFeedback(sessionId: string, rating: number, comment: string) {
        const feedback = {
            rating: rating,
            comment: comment,
        };
        return GameSessionModel.updateOne(
            { _id: new Types.ObjectId(sessionId) },
            { $push: { feedback } }
        );
    }

    static async fetchFinalResults(sessionId: string, identifier: { userId?: string; guestName?: string }, view?: 'summary'): Promise<ResultsPayload | null> {
        const sessionObjectId = new Types.ObjectId(sessionId);

        const session = await GameSessionModel.findById(sessionObjectId).lean();
        if (!session) return null;
        if (!session.hostId) return null;
        const isHost = !!(identifier.userId && session.hostId.equals(identifier.userId));
        const viewType: 'host' | 'player' | 'guest' = isHost ? 'host' : (identifier.guestName ? 'guest' : 'player');

        // This is the core change: conditionally fetch detailed answers.
        // We only need detailed answers if the view is not 'summary' AND the user is a host or the player themselves.
        const shouldFetchDetailedAnswers = view !== 'summary';

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

        if (shouldFetchDetailedAnswers) {
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
                    result.detailedAnswers = historyDocs.map((doc): any => { // Adjust with your actual type
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

    static async fetchFullSessionResults(sessionId: string): Promise<IParticipantResult[]> {
        if (!Types.ObjectId.isValid(sessionId)) {
            return [];
        }
        const sessionObjectId = new Types.ObjectId(sessionId);

        const results = await GameHistoryModel.aggregate([
            // 1. Match all history records for the given session
            { $match: { gameSessionId: sessionObjectId } },

            // 2. Sort by creation time to process answers in chronological order
            { $sort: { createdAt: 1 } },

            // 3. Group by participant to build their complete profile in one go
            {
                $group: {
                    _id: { userId: "$userId", guestNickname: "$guestNickname" },
                    userId: { $first: "$userId" },
                    name: { $first: { $ifNull: ["$username", "$guestNickname"] } },
                    score: { $sum: "$finalScoreGained" },
                    correctAnswers: { $sum: { $cond: ["$isUltimatelyCorrect", 1, 0] } },
                    totalTimeMs: { $sum: { $last: "$attempts.answerTimeMs" } },
                    totalQuestions: { $sum: 1 },
                    // Push all documents for this user to process later
                    historyDocs: { $push: "$$ROOT" }
                }
            },

            // 4. Lookup quiz data once for all participants
            {
                $lookup: {
                    from: "quizzes",
                    let: { quizId: { $first: "$historyDocs.quizId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$quizId"] } } },
                        { $project: { questions: 1 } }
                    ],
                    as: "quizInfo"
                }
            },
            { $unwind: "$quizInfo" },

            // 5. Lookup user details (for profile pics, etc.)
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            
            // 6. Project the final, detailed shape for each participant
            {
                $project: {
                    _id: 0,
                    participantId: "$userId",
                    name: { $ifNull: [{ $first: "$userDetails.name" }, "$name"] },
                    profileUrl: { $ifNull: [{ $first: "$userDetails.profileUrl" }, null] },
                    score: "$score",
                    correctAnswers: "$correctAnswers",
                    totalQuestions: "$totalQuestions",
                    percentage: {
                        $cond: {
                            if: { $gt: ["$totalQuestions", 0] },
                            then: { $round: [{ $multiply: [{ $divide: ["$correctAnswers", "$totalQuestions"] }, 100] }, 2] },
                            else: 0
                        }
                    },
                    averageTime: {
                         $cond: {
                            if: { $gt: ["$totalQuestions", 0] },
                            then: { $round: [{ $divide: ["$totalTimeMs", { $multiply: ["$totalQuestions", 1000] }] }, 2] },
                            else: 0
                        }
                    },
                    detailedPerformance: {
                        $map: {
                            input: "$historyDocs",
                            as: "doc",
                            in: {
                                $let: {
                                    vars: {
                                        question: { $first: { $filter: { input: "$quizInfo.questions", as: "q", cond: { $eq: ["$$q._id", "$$doc.questionId"] } } } }
                                    },
                                    in: {
                                        questionId: { $toString: "$$doc.questionId" },
                                        questionText: "$$question.questionText",
                                        wasUltimatelyCorrect: "$$doc.isUltimatelyCorrect",
                                        finalScoreGained: "$$doc.finalScoreGained",
                                        thinkingTimeSeconds: { $round: [{ $divide: [{ $last: "$$doc.attempts.answerTimeMs" }, 1000] }, 2] },
                                        selectedOptionText: { $first: { $map: { input: "$$doc.attempts", as: "attempt", in: { $let: { vars: { option: { $first: { $filter: { input: "$$question.options", as: "opt", cond: { $eq: ["$$opt._id", "$$attempt.selectedOptionId"] } } } } }, in: "$$option.text" } } } } },
                                        attempts: {
                                            $map: {
                                                input: "$$doc.attempts",
                                                as: "attempt",
                                                in: {
                                                    $let: {
                                                        vars: {
                                                            option: { $first: { $filter: { input: "$$question.options", as: "opt", cond: { $eq: ["$$opt._id", "$$attempt.selectedOptionId"] } } } }
                                                        },
                                                        in: {
                                                            selectedOptionText: "$$option.text",
                                                            isCorrect: "$$attempt.isCorrect",
                                                            answerTimeMs: "$$attempt.answerTimeMs"
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
             // 7. Sort final results by score to prepare for ranking
            { $sort: { score: -1 } }
        ]);

        // 8. Add ranking to each result
        return results.map((result, index) => ({
            ...result,
            rank: index + 1
        }));
    }
    static async getSessionResults(sessionId: string) {
        if (!Types.ObjectId.isValid(sessionId)) return null;

        const session = await GameSessionModel.findById(sessionId)
            .populate({
                path: 'results.userId',
                select: 'name profileUrl'
            })
            .populate('quizId', 'title')
            .lean();

        if (!session) return null;

        const participants = session.results
            .sort((a, b) => (a.finalRank || 999) - (b.finalRank || 999))
            .map(p => ({
                // @ts-ignore
                userId: p.userId?._id?.toString(), // Ensure userId is a string
                // @ts-ignore
                name: p.userId?.name || p.nickname,
                // @ts-ignore
                profileUrl: p.userId?.profileUrl,
                score: p.finalScore,
                rank: p.finalRank
            }));

        return {
             // @ts-ignore
            quizTitle: session.quizId?.title,
            endedAt: session.endedAt,
            participants
        };
    }

    /**
     * ✅ NEW: Fetches all completed sessions for a team.
     */
    static async getCompletedSessionsForTeam(teamId: string) {
        if (!Types.ObjectId.isValid(teamId)) return [];
        return GameSessionModel.find({ teamId: new Types.ObjectId(teamId), status: 'completed' })
            .populate('quizId', 'title')
            .select('_id quizId endedAt results')
            .sort({ endedAt: -1 })
            .lean();
    }

    /**
     * ✅ FIXED: Correctly aggregates total scores for each member and excludes the owner.
     */
    static async getOverallTeamLeaderboard(teamId: string) {
        if (!Types.ObjectId.isValid(teamId)) return [];

        const team = await TeamModel.findById(teamId).lean();
        if (!team) return [];
        
        const ownerId = team.members.find(m => m.role === 'owner')?.userId;

        return GameSessionModel.aggregate([
            { $match: { teamId: new Types.ObjectId(teamId), status: 'completed', 'results.0': { $exists: true } } },
            { $unwind: "$results" },
            { $match: { "results.userId": { $ne: ownerId } } },
            {
                $group: {
                    _id: "$results.userId",
                    totalScore: { $sum: "$results.finalScore" },
                    quizzesPlayed: { $sum: 1 }
                }
            },
            { $sort: { totalScore: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    _id: 0,
                    userId: "$userDetails._id",
                    name: "$userDetails.name",
                    profileUrl: "$userDetails.profileUrl",
                    totalScore: "$totalScore",
                    quizzesPlayed: "$quizzesPlayed"
                }
            }
        ]);
    }
static formatSessionToQuizHistory(
  session: IGameSession & { quiz?: any },
  userId?: string
): {
  id: string;
  title: string;
  category: string;
  date: string;
  score: number;
  totalQuestions: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: string;
  rating: number;
  participants: number;
  lastUpdated: string;
  description: string;
} {
  const startedAt = session.startedAt ? new Date(session.startedAt) : null;
  const endedAt = session.endedAt ? new Date(session.endedAt) : null;

  // Calculate duration
  let duration = "N/A";
  if (startedAt && endedAt) {
    const diffMs = endedAt.getTime() - startedAt.getTime();
    const minutes = Math.floor(diffMs / 60000);
    duration = `${minutes} min`;
  }

  // Find the user's score if available
  let score = 0;
  if (userId && Array.isArray(session.results)) {
    const userResult = session.results.find(
      (r: any) => r.userId?.toString() === userId
    );
    score = userResult?.finalScore || 0;
  }

  // Fallbacks for quiz info
  const quiz = session.quiz || {};
  const title = quiz.title || "Untitled Quiz";
  const category = Array.isArray(quiz.categories) && quiz.categories.length > 0
    ? quiz.categories[0]
    : (quiz.category || "General");
  const totalQuestions = quiz.questions?.length || 0;
  const difficulty = quiz.difficulty || "Medium";
  const rating = quiz.rating || 0; // Mocked or fallback
  const description = quiz.description || "";
  const lastUpdated = quiz.updatedAt
    ? `${Math.round((Date.now() - new Date(quiz.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
    : "Recently";
  const participants = Array.isArray(session.results) ? session.results.length : 0;

  return {
    id: session._id.toString(),
    title,
    category,
    date: startedAt
      ? startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "N/A",
    score,
    totalQuestions,
    duration,
    difficulty,
    status: session.status === "in_progress" ? "In Progress" : "Completed",
    rating,
    participants,
    lastUpdated,
    description,
  };
};
static async fetchUserQuizHistoryByQuizId(userId: string, quizId: string) {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(quizId)) return [];
    // Find all sessions for this user and quiz
    const sessions = await GameSessionModel.find({
        quizId: new Types.ObjectId(quizId),
        'hostId': new Types.ObjectId(userId)
    })
    .populate('quizId')
    .sort({ startedAt: -1 })
    .lean();

    return sessions;
};
}
