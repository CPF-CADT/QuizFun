import { Types } from 'mongoose';
import { GameSessionModel, IGameSession } from '../model/GameSession';
import { GameHistoryModel } from '../model/GameHistory';
import { GameSessionManager } from '../config/data/GameSession';

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

export class GameRepository {

    static async createGameSession(roomId: number): Promise<IGameSession | null> {
        const session = GameSessionManager.getSession(roomId);
        if (!session) {
            return null;
        }

        const newGameSession = await GameSessionModel.create({
            quizId: session.quizId,
            hostId: session.hostId,
            joinCode: roomId,
            status: 'in_progress',
            startedAt: new Date(),
        });

        session.dbId = newGameSession._id;
        return newGameSession;
    }

    static async saveRoundHistory(roomId: number, scoresGained: Map<string, number>): Promise<void> {
        const session = GameSessionManager.getSession(roomId);
        if (!session || !session.dbId || !session.questions) {
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
                    answerTimeMs: (currentQuestion.timeLimit - answer.remainingTime) * 1000,
                };
            });
            
            const lastAttempt = attempts.at(-1)!;

            const historyDoc: GameHistoryCreationData = {
                gameSessionId: session.dbId,
                quizId: new Types.ObjectId(session.quizId),
                questionId: currentQuestion._id,
                attempts: attempts,
                isUltimatelyCorrect: lastAttempt.isCorrect,
                finalScoreGained: scoresGained.get(participant.user_id) || 0,
            };

            if (Types.ObjectId.isValid(participant.user_id)) {
                historyDoc.userId = new Types.ObjectId(participant.user_id);
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
        if (!session || !session.dbId) {
            return;
        }

        const finalResults = session.participants
            .filter(p => p.role === 'player')
            .sort((a, b) => b.score - a.score)
            .map((p, index) => ({
                userId: new Types.ObjectId(p.user_id as string),
                nickname: p.user_name,
                finalScore: p.score,
                finalRank: index + 1,
            }));

        try {
            await GameSessionModel.findByIdAndUpdate(session.dbId, {
                status: 'completed',
                endedAt: new Date(),
                results: finalResults,
            });
        } catch (error) {
            console.error(`Error finalizing game session for room ${roomId}:`, error);
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
}