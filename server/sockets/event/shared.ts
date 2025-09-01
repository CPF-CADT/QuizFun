// FILE: src/socket/handlers/shared.ts
import { Server } from "socket.io";
import { GameSessionManager, GameStatePayload, ResultsQuestion, SanitizedQuestion } from "../../config/data/GameSession";
import { IQuestion } from "../../model/Quiz";
import { calculatePoint } from "../../service/calculation";
import { GameRepository } from "../../repositories/game.repositories";
import redisClient from "../../config/redis";

const RESULTS_DISPLAY_DURATION = 8000; // 8 seconds
const CACHE_EXPIRATION_QUIZZ_RESULT_SECONDS = 20 * 60;

export async function nextQuestion(io: Server, roomId: number): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);
    if (!room?.questions) return;

    room.currentQuestionIndex++;
    room.answers.clear();
    room.answerCounts = [];
    room.participants.forEach(p => (p.hasAnswered = false));

    // Game ended
    if (room.currentQuestionIndex >= room.questions.length) {
        console.log(`[Game] Final question answered for room ${roomId}.`);
        room.gameState = "end";
        room.isFinalResults = true;

        await GameRepository.finalizeGameSession(roomId);

        try {
            const fullResults = await GameRepository.fetchFullSessionResults(room.sessionId);
            if (fullResults?.length) {
                const cacheKey = `session-results:${room.sessionId}`;
                await redisClient.set(cacheKey, JSON.stringify(fullResults), {
                    EX: CACHE_EXPIRATION_QUIZZ_RESULT_SECONDS,
                });
                console.log(`[Cache] Cached results for session ${room.sessionId}`);
            }
        } catch (err) {
            console.error(`[Cache] Failed caching results for session ${room.sessionId}:`, err);
        }

        await broadcastGameState(io, roomId);
        return;
    }

    // Start new question
    room.gameState = "question";
    const currentQuestion = room.questions[room.currentQuestionIndex];
    room.questionStartTime = Date.now();

    if (room.questionTimer) clearTimeout(room.questionTimer);
    room.questionTimer = setTimeout(() => endRound(io, roomId), currentQuestion.timeLimit * 1000);

    console.log(`[Game] Sending question ${room.currentQuestionIndex + 1} to room ${roomId}`);
    await broadcastGameState(io, roomId);
}

export async function endRound(io: Server, roomId: number): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);
    if (
        !room ||
        room.gameState !== "question" ||
        !room.questions ||
        room.currentQuestionIndex < 0 ||
        room.currentQuestionIndex >= room.questions.length
    ) {
        console.error(`[Game] endRound invalid state for room ${roomId}`);
        return;
    }

    if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = undefined;
    }

    console.log(`[Game] Round over for room ${roomId}. Calculating scores.`);
    const currentQuestion: IQuestion = room.questions[room.currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

    // Count answers
    const answerCounts = Array(currentQuestion.options.length).fill(0);
    for (const answers of room.answers.values()) {
        const lastAnswerIndex = answers.at(-1)?.optionIndex;
        if (lastAnswerIndex != null && lastAnswerIndex >= 0 && lastAnswerIndex < answerCounts.length) {
            answerCounts[lastAnswerIndex]++;
        }
    }
    room.answerCounts = answerCounts;

    // Update scores
    const scoresGained = new Map<string, number>();
    for (const p of room.participants) {
        if (p.role !== "player" || !p.user_id) continue;

        const lastAnswer = room.answers.get(p.user_id)?.at(-1);
        if (!lastAnswer) {
            scoresGained.set(p.user_id, 0);
            continue;
        }

        let gained = 0;
        if (lastAnswer.optionIndex === correctAnswerIndex) {
            gained = calculatePoint(currentQuestion.point, currentQuestion.timeLimit, lastAnswer.remainingTime);
            p.score += gained;
            lastAnswer.isCorrect = true;
        } else {
            lastAnswer.isCorrect = false;
        }
        scoresGained.set(p.user_id, gained);
    }

    room.gameState = "results";

    try {
        await GameRepository.saveRoundHistory(roomId, scoresGained);
    } catch (err) {
        console.error(`[CRITICAL] Failed to save round history for room ${roomId}:`, err);
        const host = room.participants.find(p => p.role === "host");
        if (host) {
            io.to(host.socket_id).emit("error-message", "A critical error occurred while saving game history.");
        }
    }

    if (room.settings.autoNext) {
        room.autoNextTimer = setTimeout(() => nextQuestion(io, roomId), RESULTS_DISPLAY_DURATION);
    }

    await broadcastGameState(io, roomId);
}
export async function broadcastGameState(
    io: Server,
    roomId: number,
    errorMessage?: string
): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);
    if (!room) return;

    const totalQuestions = room.questions?.length ?? 0;
    const currentQuestion =
        room.questions &&
            room.currentQuestionIndex >= 0 &&
            room.currentQuestionIndex < room.questions.length
            ? room.questions[room.currentQuestionIndex]
            : null;

    let baseQuestionPayload: SanitizedQuestion | null = null;
    let correctAnswerIndex: number | null = null;

    if (currentQuestion) {
        baseQuestionPayload = {
            questionText: currentQuestion.questionText,
            point: currentQuestion.point,
            timeLimit: currentQuestion.timeLimit,
            imageUrl: currentQuestion.imageUrl,
            options: currentQuestion.options.map((opt) => ({ text: opt.text })),
        };
        if (room.gameState === "results" || room.gameState === "end") {
            correctAnswerIndex = currentQuestion.options.findIndex(
                (opt) => opt.isCorrect
            );
        }
    }

    const sharedState = {
        sessionId: room.sessionId,
        roomId,
        gameState: room.gameState,
        participants: room.participants,
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions,
        isFinalResults: room.isFinalResults,
        settings: room.settings,
        questionStartTime: room.questionStartTime,
        answerCounts: room.answerCounts,
        error: errorMessage,
    };

    for (const p of room.participants) {
        if (!p.isOnline) continue;

        let questionPayload: SanitizedQuestion | ResultsQuestion | null = null;

        if (baseQuestionPayload) {
            if (correctAnswerIndex != null) {
                const resultsPayload: ResultsQuestion = {
                    ...baseQuestionPayload,
                    correctAnswerIndex,
                };
                const lastAnswer = p.user_id
                    ? room.answers.get(p.user_id)?.at(-1)
                    : undefined;
                if (lastAnswer) {
                    resultsPayload.yourAnswer = {
                        optionIndex: lastAnswer.optionIndex,
                        wasCorrect: lastAnswer.isCorrect,
                    };
                }
                questionPayload = resultsPayload;
            } else {
                questionPayload = baseQuestionPayload;
            }
        }

        const stateToSend: GameStatePayload = {
            ...sharedState,
            question: questionPayload,
            yourUserId: p.user_id,
        };

        io.to(p.socket_id).emit("game-update", stateToSend);
    }
}
