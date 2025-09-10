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
exports.GameRepository = void 0;
const mongoose_1 = require("mongoose");
const GameSession_1 = require("../model/GameSession");
const GameHistory_1 = require("../model/GameHistory");
const GameSession_2 = require("../config/data/GameSession");
const Quiz_1 = require("../model/Quiz");
const Team_1 = require("../model/Team");
class GameRepository {
    static saveRoundHistory(roomId, scoresGained) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield GameSession_2.GameSessionManager.getSession(roomId);
            // Use the new `sessionId` property which is a required string.
            if (!session || !session.sessionId || !session.questions) {
                return;
            }
            const currentQuestion = session.questions[session.currentQuestionIndex];
            if (!(currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion._id)) {
                return;
            }
            const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
            const historyDocsToCreate = [];
            for (const participant of session.participants) {
                if (participant.role === 'host' || !participant.user_id)
                    continue;
                const playerAnswers = session.answers.get(participant.user_id);
                if (!playerAnswers || playerAnswers.length === 0)
                    continue;
                const attempts = playerAnswers.map(answer => {
                    const selectedOption = currentQuestion.options[answer.optionIndex];
                    return {
                        selectedOptionId: selectedOption._id,
                        isCorrect: answer.optionIndex === correctAnswerIndex,
                        answerTimeMs: Math.round((currentQuestion.timeLimit - answer.remainingTime) * 1000),
                    };
                });
                const lastAttempt = attempts.at(-1);
                const historyDoc = {
                    // Convert the session.sessionId string back to an ObjectId for the DB
                    gameSessionId: new mongoose_1.Types.ObjectId(session.sessionId),
                    quizId: new mongoose_1.Types.ObjectId(session.quizId),
                    questionId: currentQuestion._id,
                    attempts: attempts,
                    isUltimatelyCorrect: lastAttempt.isCorrect,
                    finalScoreGained: scoresGained.get(participant.user_id) || 0,
                };
                if (mongoose_1.Types.ObjectId.isValid(participant.user_id)) {
                    historyDoc.userId = new mongoose_1.Types.ObjectId(participant.user_id);
                    historyDoc.username = participant.user_name;
                }
                else {
                    historyDoc.guestNickname = participant.user_name;
                }
                historyDocsToCreate.push(historyDoc);
            }
            if (historyDocsToCreate.length > 0) {
                try {
                    yield GameHistory_1.GameHistoryModel.insertMany(historyDocsToCreate, { ordered: false });
                }
                catch (error) {
                    console.error(`Error batch inserting history for room ${roomId}:`, error);
                }
            }
        });
    }
    static finalizeGameSession(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield GameSession_2.GameSessionManager.getSession(roomId);
            if (!session || !session.sessionId) {
                return;
            }
            const finalResults = session.participants
                .filter(p => p.role !== 'host')
                .sort((a, b) => b.score - a.score)
                .map((p, index) => ({
                userId: (p.user_id && mongoose_1.Types.ObjectId.isValid(p.user_id))
                    ? new mongoose_1.Types.ObjectId(p.user_id)
                    : null,
                nickname: p.user_name,
                finalScore: p.score,
                finalRank: index + 1,
            }));
            try {
                // Use session.sessionId to find the document to update
                yield GameSession_1.GameSessionModel.findByIdAndUpdate(session.sessionId, {
                    status: 'completed',
                    endedAt: new Date(),
                    results: finalResults,
                });
            }
            catch (error) {
                console.error(`Error finalizing game session for room ${roomId}:`, error);
            }
        });
    }
    static updateSessionStatus(sessionId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield GameSession_1.GameSessionModel.findByIdAndUpdate(sessionId, { status });
            }
            catch (error) {
                console.error(`Error updating session ${sessionId} status to ${status}:`, error);
            }
        });
    }
    static fetchGameSessions(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const [data, total] = yield Promise.all([
                GameSession_1.GameSessionModel.find().sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
                GameSession_1.GameSessionModel.countDocuments()
            ]);
            return { total, limit, totalPages: Math.ceil(total / limit), currentPage: page, data };
        });
    }
    static fetchUserGameHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId))
                return [];
            return GameHistory_1.GameHistoryModel.aggregate([
                { $match: { userId: new mongoose_1.Types.ObjectId(userId) } },
                { $lookup: { from: 'gamesessions', localField: 'gameSessionId', foreignField: '_id', as: 'gameSession' } },
                { $unwind: '$gameSession' },
                { $sort: { 'gameSession.startedAt': -1 } }
            ]);
        });
    }
    static findSessionById(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(sessionId))
                return null;
            return GameSession_1.GameSessionModel.findById(sessionId).lean();
        });
    }
    static fetchHistoryForSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(sessionId))
                return [];
            return GameHistory_1.GameHistoryModel.find({ gameSessionId: new mongoose_1.Types.ObjectId(sessionId) })
                .populate('userId', 'name email')
                .lean();
        });
    }
    static findSessionByQuizAndHost(quizId, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(quizId) || !mongoose_1.Types.ObjectId.isValid(hostId))
                return null;
            return GameSession_1.GameSessionModel.find({
                quizId: new mongoose_1.Types.ObjectId(quizId),
                hostId: new mongoose_1.Types.ObjectId(hostId)
            }).lean();
        });
    }
    static fetchGuestPerformanceInSession(sessionId, guestName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(sessionId))
                return null;
            return GameHistory_1.GameHistoryModel.aggregate([
                {
                    $match: {
                        guestNickname: guestName,
                        gameSessionId: new mongoose_1.Types.ObjectId(sessionId),
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
                }
            ]);
        });
    }
    static fetchUserPerformanceInSession(userId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(sessionId)) {
                return null;
            }
            return GameHistory_1.GameHistoryModel.aggregate([
                // Stage 1 & 2: Match records and join with 'gamesessions' (No changes here)
                {
                    $match: {
                        userId: new mongoose_1.Types.ObjectId(userId),
                        gameSessionId: new mongoose_1.Types.ObjectId(sessionId)
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
        });
    }
    static addFeedback(sessionId, rating, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const feedback = {
                rating: rating,
                comment: comment,
            };
            return GameSession_1.GameSessionModel.updateOne({ _id: new mongoose_1.Types.ObjectId(sessionId) }, { $push: { feedback } });
        });
    }
    static fetchFinalResults(sessionId, identifier, view) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const sessionObjectId = new mongoose_1.Types.ObjectId(sessionId);
            const session = yield GameSession_1.GameSessionModel.findById(sessionObjectId).lean();
            if (!session)
                return null;
            if (!session.hostId)
                return null;
            const isHost = !!(identifier.userId && session.hostId.equals(identifier.userId));
            const viewType = isHost ? 'host' : (identifier.guestName ? 'guest' : 'player');
            // This is the core change: conditionally fetch detailed answers.
            // We only need detailed answers if the view is not 'summary' AND the user is a host or the player themselves.
            const shouldFetchDetailedAnswers = view !== 'summary';
            const pipeline = [
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
            let allResults = yield GameHistory_1.GameHistoryModel.aggregate(pipeline);
            if (shouldFetchDetailedAnswers) {
                for (const result of allResults) {
                    const isSelf = (identifier.userId && ((_a = result.participantId) === null || _a === void 0 ? void 0 : _a.toString()) === identifier.userId) || (identifier.guestName && result.name === identifier.guestName);
                    if (isHost || isSelf) {
                        const query = result.participantId ? { userId: result.participantId } : { guestNickname: result.name };
                        const historyDocs = yield GameHistory_1.GameHistoryModel.find(Object.assign({ gameSessionId: sessionObjectId }, query)).lean();
                        if (historyDocs.length === 0) {
                            result.detailedAnswers = [];
                            continue;
                        }
                        const quiz = yield Quiz_1.QuizModel.findById(historyDocs[0].quizId)
                            .select('questions')
                            .lean();
                        const questionsMap = new Map(quiz === null || quiz === void 0 ? void 0 : quiz.questions.map(q => [q._id.toString(), q]));
                        result.detailedAnswers = historyDocs.map((doc) => {
                            const question = questionsMap.get(doc.questionId.toString());
                            const detailedAttempts = doc.attempts.map(attempt => {
                                const selectedOption = question === null || question === void 0 ? void 0 : question.options.find(opt => opt._id.equals(attempt.selectedOptionId));
                                return {
                                    selectedOptionText: (selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.text) || "N/A",
                                    answerTimeMs: attempt.answerTimeMs,
                                    isCorrect: attempt.isCorrect
                                };
                            });
                            return {
                                _id: doc._id.toString(),
                                isUltimatelyCorrect: doc.isUltimatelyCorrect,
                                questionId: {
                                    questionText: (question === null || question === void 0 ? void 0 : question.questionText) || "Question not found",
                                },
                                attempts: detailedAttempts
                            };
                        });
                    }
                }
            }
            const finalResults = isHost ? allResults : allResults.filter(r => {
                var _a;
                return (identifier.userId && ((_a = r.participantId) === null || _a === void 0 ? void 0 : _a.toString()) === identifier.userId) ||
                    (identifier.guestName && r.name === identifier.guestName);
            });
            return { viewType, results: finalResults };
        });
    }
    static getLeaderboardForQuiz(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(quizId)) {
                throw new Error("Invalid quiz ID");
            }
            const leaderboard = yield GameSession_1.GameSessionModel.aggregate([
                // Stage 1: Filter for completed game sessions for the specific quiz.
                {
                    $match: {
                        quizId: new mongoose_1.Types.ObjectId(quizId),
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
        });
    }
    static fetchFullSessionResults(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(sessionId)) {
                return [];
            }
            const sessionObjectId = new mongoose_1.Types.ObjectId(sessionId);
            const results = yield GameHistory_1.GameHistoryModel.aggregate([
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
            return results.map((result, index) => (Object.assign(Object.assign({}, result), { rank: index + 1 })));
        });
    }
    static getSessionResults(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!mongoose_1.Types.ObjectId.isValid(sessionId))
                return null;
            const session = yield GameSession_1.GameSessionModel.findById(sessionId)
                .populate({
                path: 'results.userId',
                select: 'name profileUrl'
            })
                .populate('quizId', 'title')
                .lean();
            if (!session)
                return null;
            const participants = session.results
                .sort((a, b) => (a.finalRank || 999) - (b.finalRank || 999))
                .map(p => {
                var _a, _b, _c, _d;
                return ({
                    // @ts-ignore
                    userId: (_b = (_a = p.userId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(), // Ensure userId is a string
                    // @ts-ignore
                    name: ((_c = p.userId) === null || _c === void 0 ? void 0 : _c.name) || p.nickname,
                    // @ts-ignore
                    profileUrl: (_d = p.userId) === null || _d === void 0 ? void 0 : _d.profileUrl,
                    score: p.finalScore,
                    rank: p.finalRank
                });
            });
            return {
                // @ts-ignore
                quizTitle: (_a = session.quizId) === null || _a === void 0 ? void 0 : _a.title,
                endedAt: session.endedAt,
                participants
            };
        });
    }
    /**
     * ✅ NEW: Fetches all completed sessions for a team.
     */
    static getCompletedSessionsForTeam(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(teamId))
                return [];
            return GameSession_1.GameSessionModel.find({ teamId: new mongoose_1.Types.ObjectId(teamId), status: 'completed' })
                .populate('quizId', 'title')
                .select('_id quizId endedAt results')
                .sort({ endedAt: -1 })
                .lean();
        });
    }
    /**
     * ✅ FIXED: Correctly aggregates total scores for each member and excludes the owner.
     */
    static getOverallTeamLeaderboard(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!mongoose_1.Types.ObjectId.isValid(teamId))
                return [];
            const team = yield Team_1.TeamModel.findById(teamId).lean();
            if (!team)
                return [];
            const ownerId = (_a = team.members.find(m => m.role === 'owner')) === null || _a === void 0 ? void 0 : _a.userId;
            return GameSession_1.GameSessionModel.aggregate([
                { $match: { teamId: new mongoose_1.Types.ObjectId(teamId), status: 'completed', 'results.0': { $exists: true } } },
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
        });
    }
    static formatSessionToQuizHistory(session, userId) {
        var _a;
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
            const userResult = session.results.find((r) => { var _a; return ((_a = r.userId) === null || _a === void 0 ? void 0 : _a.toString()) === userId; });
            score = (userResult === null || userResult === void 0 ? void 0 : userResult.finalScore) || 0;
        }
        // Fallbacks for quiz info
        const quiz = session.quiz || {};
        const title = quiz.title || "Untitled Quiz";
        const category = Array.isArray(quiz.categories) && quiz.categories.length > 0
            ? quiz.categories[0]
            : (quiz.category || "General");
        const totalQuestions = ((_a = quiz.questions) === null || _a === void 0 ? void 0 : _a.length) || 0;
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
    }
    ;
    static fetchUserQuizHistoryByQuizId(userId, quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(quizId))
                return [];
            // Find all sessions for this user and quiz
            const sessions = yield GameSession_1.GameSessionModel.find({
                quizId: new mongoose_1.Types.ObjectId(quizId),
                'hostId': new mongoose_1.Types.ObjectId(userId)
            })
                .populate('quizId')
                .sort({ startedAt: -1 })
                .lean();
            return sessions;
        });
    }
    ;
}
exports.GameRepository = GameRepository;
