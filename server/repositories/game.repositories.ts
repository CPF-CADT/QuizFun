import { Types } from 'mongoose';
import { GameSessionModel, IGameSession, IGameSessionParticipant } from '../model/GameSession';
import { GameHistoryModel, IGameHistory } from '../model/GameHistory';
import { GameSessionManager, SessionData } from '../config/data/GameSession'; 
export class GameRepository {

    static async createGameSession(roomId: number, joinCode: string): Promise<IGameSession | null> {
        const session = GameSessionManager.getSession(roomId) as SessionData;
        if (!session) {
            console.error('[GameRepository] In-memory session not found for room:', roomId);
            return null;
        }

        const newGameSession = await GameSessionModel.create({
            quizId: session.quizId,
            hostId: session.hostId,
            joinCode: joinCode,
            status: 'in_progress',
            startedAt: new Date(),
        });

        session.dbId = newGameSession._id as Types.ObjectId;  
        return newGameSession;
    }

        static async saveRoundHistory(roomId: number, questionDurationSec: number): Promise<void> {
        const session = GameSessionManager.getSession(roomId);

        if (!session || !session.dbId || !session.questions) {
            console.error(`[GameRepository] Cannot save history, invalid session for room ${roomId}.`);
            return;
        }

        const currentQuestionIndex = session.currentQuestionIndex;
        const currentQuestion = session.questions[currentQuestionIndex];
        if (!currentQuestion?._id) return;

        const historyDocsToCreate = [];

        for (const participant of session.participants) {
            const playerAnswers = session.answers.get(participant.socket_id);
            const answer = playerAnswers?.at(-1);

            if (!answer) continue;

            if (!currentQuestion.options[answer.optionIndex]?._id) {
                console.error("Critical error: Option ID is missing.");
                continue;
            }

            const timeTakenMs = (questionDurationSec - answer.remainingTime) * 1000;
            const scoreGained = answer.isCorrect ? 500 + Math.round(answer.remainingTime * 25) : 0;

            const historyDoc: any = {
                gameSessionId: session.dbId,
                quizId: new Types.ObjectId(session.quizId), // Make sure session.quizId is valid
                questionId: currentQuestion._id,
                selectedOptionId: currentQuestion.options[answer.optionIndex]._id,
                isCorrect: answer.isCorrect,
                scoreGained,
                answerTimeMs: Math.max(0, timeTakenMs),
            };

            if (participant.user_id) {
                historyDoc.userId = new Types.ObjectId(participant.user_id);
            } else {
                historyDoc.guestNickname = participant.user_name;
            }

            historyDocsToCreate.push(historyDoc);
        }

        if (historyDocsToCreate.length > 0) {
            try {
                await GameHistoryModel.insertMany(historyDocsToCreate);
            } catch (error) {
                console.error(`[GameRepository] Error batch inserting history for room ${roomId}:`, error);
            }
        }
    }

    static async finalizeGameSession(roomId: number): Promise<void> {
        const session = GameSessionManager.getSession(roomId) as SessionData;
        if (!session || !session.dbId) return;

        const finalResults = session.participants
            .sort((a, b) => b.score - a.score) // Ensure ranks are correct
            .map((p, index) => ({
                userId: p.user_id ? new Types.ObjectId(p.user_id) : undefined,
                nickname: p.user_name,
                finalScore: p.score,
                finalRank: index + 1,
            }));

        await GameSessionModel.findByIdAndUpdate(session.dbId, {
            status: 'completed',
            endedAt: new Date(),
            results: finalResults,
        });
    }

    static async fetchGameSessions(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            GameSessionModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            GameSessionModel.countDocuments()
        ]);

        return {
            total,
            limit,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data
        };
    }

    static async fetchUserGameHistory(userId: string) {
        return GameHistoryModel.aggregate([
            {
                $match: { userId: new Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: 'gamesessions',
                    localField: 'gameSessionId', 
                    foreignField: '_id',
                    as: 'gameSession',
                },
            },
            {
                $unwind: '$gameSession' 
            }
        ]);
    }
}