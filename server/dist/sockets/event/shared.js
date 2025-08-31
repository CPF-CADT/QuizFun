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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextQuestion = nextQuestion;
exports.endRound = endRound;
exports.broadcastGameState = broadcastGameState;
const GameSession_1 = require("../../config/data/GameSession");
const calculation_1 = require("../../service/calculation");
const game_repositories_1 = require("../../repositories/game.repositories");
const redis_1 = __importDefault(require("../../config/redis"));
const RESULTS_DISPLAY_DURATION = 8000; // 8 seconds
const CACHE_EXPIRATION_QUIZZ_RESULT_SECONDS = 20 * 60;
function nextQuestion(io, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!(room === null || room === void 0 ? void 0 : room.questions))
            return;
        room.currentQuestionIndex++;
        room.answers.clear();
        room.answerCounts = [];
        room.participants.forEach(p => (p.hasAnswered = false));
        // Game ended
        if (room.currentQuestionIndex >= room.questions.length) {
            console.log(`[Game] Final question answered for room ${roomId}.`);
            room.gameState = "end";
            room.isFinalResults = true;
            yield game_repositories_1.GameRepository.finalizeGameSession(roomId);
            try {
                const fullResults = yield game_repositories_1.GameRepository.fetchFullSessionResults(room.sessionId);
                if (fullResults === null || fullResults === void 0 ? void 0 : fullResults.length) {
                    const cacheKey = `session-results:${room.sessionId}`;
                    yield redis_1.default.set(cacheKey, JSON.stringify(fullResults), {
                        EX: CACHE_EXPIRATION_QUIZZ_RESULT_SECONDS,
                    });
                    console.log(`[Cache] Cached results for session ${room.sessionId}`);
                }
            }
            catch (err) {
                console.error(`[Cache] Failed caching results for session ${room.sessionId}:`, err);
            }
            yield broadcastGameState(io, roomId);
            return;
        }
        // Start new question
        room.gameState = "question";
        const currentQuestion = room.questions[room.currentQuestionIndex];
        room.questionStartTime = Date.now();
        if (room.questionTimer)
            clearTimeout(room.questionTimer);
        room.questionTimer = setTimeout(() => endRound(io, roomId), currentQuestion.timeLimit * 1000);
        console.log(`[Game] Sending question ${room.currentQuestionIndex + 1} to room ${roomId}`);
        yield broadcastGameState(io, roomId);
    });
}
function endRound(io, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room ||
            room.gameState !== "question" ||
            !room.questions ||
            room.currentQuestionIndex < 0 ||
            room.currentQuestionIndex >= room.questions.length) {
            console.error(`[Game] endRound invalid state for room ${roomId}`);
            return;
        }
        if (room.questionTimer) {
            clearTimeout(room.questionTimer);
            room.questionTimer = undefined;
        }
        console.log(`[Game] Round over for room ${roomId}. Calculating scores.`);
        const currentQuestion = room.questions[room.currentQuestionIndex];
        const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
        // Count answers
        const answerCounts = Array(currentQuestion.options.length).fill(0);
        for (const answers of room.answers.values()) {
            const lastAnswerIndex = (_a = answers.at(-1)) === null || _a === void 0 ? void 0 : _a.optionIndex;
            if (lastAnswerIndex != null && lastAnswerIndex >= 0 && lastAnswerIndex < answerCounts.length) {
                answerCounts[lastAnswerIndex]++;
            }
        }
        room.answerCounts = answerCounts;
        // Update scores
        const scoresGained = new Map();
        for (const p of room.participants) {
            if (p.role !== "player" || !p.user_id)
                continue;
            const lastAnswer = (_b = room.answers.get(p.user_id)) === null || _b === void 0 ? void 0 : _b.at(-1);
            if (!lastAnswer) {
                scoresGained.set(p.user_id, 0);
                continue;
            }
            let gained = 0;
            if (lastAnswer.optionIndex === correctAnswerIndex) {
                gained = (0, calculation_1.calculatePoint)(currentQuestion.point, currentQuestion.timeLimit, lastAnswer.remainingTime);
                p.score += gained;
                lastAnswer.isCorrect = true;
            }
            else {
                lastAnswer.isCorrect = false;
            }
            scoresGained.set(p.user_id, gained);
        }
        room.gameState = "results";
        try {
            yield game_repositories_1.GameRepository.saveRoundHistory(roomId, scoresGained);
        }
        catch (err) {
            console.error(`[CRITICAL] Failed to save round history for room ${roomId}:`, err);
            const host = room.participants.find(p => p.role === "host");
            if (host) {
                io.to(host.socket_id).emit("error-message", "A critical error occurred while saving game history.");
            }
        }
        if (room.settings.autoNext) {
            room.autoNextTimer = setTimeout(() => nextQuestion(io, roomId), RESULTS_DISPLAY_DURATION);
        }
        yield broadcastGameState(io, roomId);
    });
}
function broadcastGameState(io, roomId, errorMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room)
            return;
        const totalQuestions = (_b = (_a = room.questions) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        const currentQuestion = room.questions &&
            room.currentQuestionIndex >= 0 &&
            room.currentQuestionIndex < room.questions.length
            ? room.questions[room.currentQuestionIndex]
            : null;
        let baseQuestionPayload = null;
        let correctAnswerIndex = null;
        if (currentQuestion) {
            baseQuestionPayload = {
                questionText: currentQuestion.questionText,
                point: currentQuestion.point,
                timeLimit: currentQuestion.timeLimit,
                imageUrl: currentQuestion.imageUrl,
                options: currentQuestion.options.map((opt) => ({ text: opt.text })),
            };
            if (room.gameState === "results" || room.gameState === "end") {
                correctAnswerIndex = currentQuestion.options.findIndex((opt) => opt.isCorrect);
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
            if (!p.isOnline)
                continue;
            let questionPayload = null;
            if (baseQuestionPayload) {
                if (correctAnswerIndex != null) {
                    const resultsPayload = Object.assign(Object.assign({}, baseQuestionPayload), { correctAnswerIndex });
                    const lastAnswer = p.user_id
                        ? (_c = room.answers.get(p.user_id)) === null || _c === void 0 ? void 0 : _c.at(-1)
                        : undefined;
                    if (lastAnswer) {
                        resultsPayload.yourAnswer = {
                            optionIndex: lastAnswer.optionIndex,
                            wasCorrect: lastAnswer.isCorrect,
                        };
                    }
                    questionPayload = resultsPayload;
                }
                else {
                    questionPayload = baseQuestionPayload;
                }
            }
            const stateToSend = Object.assign(Object.assign({}, sharedState), { question: questionPayload, yourUserId: p.user_id });
            io.to(p.socket_id).emit("game-update", stateToSend);
        }
    });
}
