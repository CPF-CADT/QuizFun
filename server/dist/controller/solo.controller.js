"use strict";
// src/controllers/solo.controller.ts (FULL REWRITE)
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
exports.soloController = void 0;
const GameSession_1 = require("../model/GameSession");
const Quiz_1 = require("../model/Quiz");
const GameHistory_1 = require("../model/GameHistory");
const SoloSession_1 = require("../config/data/SoloSession");
const calculation_1 = require("../service/calculation");
const redis_1 = __importDefault(require("../config/redis"));
const game_repositories_1 = require("../repositories/game.repositories");
// Helper to sanitize question data sent to the client
const sanitizeQuestion = (q) => {
    if (!q)
        return null;
    return {
        _id: q._id,
        questionText: q.questionText,
        point: q.point,
        timeLimit: q.timeLimit,
        imageUrl: q.imageUrl,
        options: q.options.map((opt) => ({ _id: opt._id, text: opt.text })),
    };
};
const CACHE_EXPIRATION_QUIZZ_RESULT_SECONDS = 20 * 60;
exports.soloController = {
    /**
     * Starts a solo game, fetching the quiz and caching it in Redis.
     */
    startSoloGame: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { quizId, guestNickname } = req.body;
        if (!quizId) {
            return res.status(400).json({ message: "Quiz ID is required." });
        }
        try {
            const quiz = yield Quiz_1.QuizModel.findById(quizId).lean();
            if (!quiz || quiz.questions.length === 0) {
                return res.status(404).json({ message: "Quiz not found or has no questions." });
            }
            // ... (code to create sessionData for guests or users)
            let sessionData;
            let playerNickname;
            if (req.user) {
                playerNickname = req.user.name || "Registered Player";
                sessionData = {
                    quizId,
                    hostId: req.user.id,
                    mode: 'solo',
                    status: 'in_progress',
                    results: [{ userId: req.user.id, nickname: playerNickname, finalScore: 0 }],
                };
            }
            else {
                if (!guestNickname) {
                    return res.status(400).json({ message: "Guest nickname is required." });
                }
                playerNickname = guestNickname;
                sessionData = {
                    quizId,
                    guestNickname: playerNickname,
                    mode: 'solo',
                    status: 'in_progress',
                    results: [{ nickname: playerNickname, finalScore: 0 }],
                };
            }
            const sessionRecord = new GameSession_1.GameSessionModel(sessionData);
            yield sessionRecord.save();
            const sessionId = sessionRecord._id.toString();
            const initialGameState = {
                sessionId,
                userId: req.user ? req.user.id : undefined,
                guestNickname: req.user ? undefined : playerNickname,
                quiz,
                currentQuestionIndex: 0,
                questionStartTime: Date.now(),
                score: 0,
                answers: [],
            };
            yield SoloSession_1.soloSessionManager.addSession(sessionId, initialGameState);
            res.status(201).json({
                message: "Solo game started!",
                sessionId,
                totalQuestions: quiz.questions.length, // <-- ADD THIS LINE
                question: sanitizeQuestion(quiz.questions[0]),
            });
        }
        catch (error) {
            console.error("Error starting solo game:", error);
            res.status(500).json({ message: "Failed to start solo game." });
        }
    }),
    /**
     * Retrieves the current state of a game, useful for page reloads.
     */
    getSoloGameState: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { sessionId } = req.params;
        const gameState = yield SoloSession_1.soloSessionManager.getSession(sessionId);
        if (!gameState) {
            return res.status(404).json({ message: "Solo session not found or has expired." });
        }
        const currentQuestion = gameState.quiz.questions[gameState.currentQuestionIndex];
        const timeLimitMs = currentQuestion.timeLimit * 1000;
        const elapsedTimeMs = Date.now() - gameState.questionStartTime;
        const remainingTimeMs = Math.max(0, timeLimitMs - elapsedTimeMs);
        res.status(200).json({
            sessionId,
            score: gameState.score,
            currentQuestionIndex: gameState.currentQuestionIndex,
            totalQuestions: gameState.quiz.questions.length,
            question: sanitizeQuestion(currentQuestion),
            remainingTimeMs,
            timeLimitMs
        });
    }),
    /**
     * Submits an answer, interacting only with the Redis cache.
     */
    submitSoloAnswer: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { sessionId } = req.params;
        const { questionId, optionId, answerTimeMs } = req.body;
        const gameState = yield SoloSession_1.soloSessionManager.getSession(sessionId);
        if (!gameState)
            return res.status(404).json({ message: "Session expired or not found." });
        const question = gameState.quiz.questions[gameState.currentQuestionIndex];
        if (question._id.toString() !== questionId)
            return res.status(400).json({ message: "Invalid question submission." });
        const correctOption = question.options.find(o => o.isCorrect);
        if (!correctOption)
            return res.status(500).json({ message: "Question configuration error." });
        // --- FIX: Handle the "no answer" case ---
        let isCorrect = false;
        let scoreGained = 0;
        // Only calculate points and save history if an option was chosen
        if (optionId) {
            isCorrect = correctOption._id.toString() === optionId;
            const remainingTime = Math.max(0, (question.timeLimit * 1000) - answerTimeMs) / 1000;
            scoreGained = isCorrect ? (0, calculation_1.calculatePoint)(question.point, question.timeLimit, remainingTime) : 0;
            // Asynchronously save history to DB without blocking the user
            GameHistory_1.GameHistoryModel.create({
                gameSessionId: sessionId,
                quizId: gameState.quiz._id,
                questionId,
                guestNickname: gameState.guestNickname,
                attempts: [{ selectedOptionId: optionId, isCorrect, answerTimeMs }],
                isUltimatelyCorrect: isCorrect,
                finalScoreGained: scoreGained,
            }).catch(err => console.error("Failed to save game history:", err));
        }
        // Update game state in memory (this happens regardless of answer)
        gameState.score += scoreGained;
        gameState.answers.push({ questionId, optionId, isCorrect, scoreGained });
        gameState.currentQuestionIndex++;
        gameState.questionStartTime = Date.now();
        yield SoloSession_1.soloSessionManager.updateSession(sessionId, gameState);
        const isGameOver = gameState.currentQuestionIndex >= gameState.quiz.questions.length;
        res.status(200).json({
            wasCorrect: isCorrect,
            scoreGained,
            correctOptionId: correctOption._id,
            isGameOver,
            nextQuestion: isGameOver ? null : sanitizeQuestion(gameState.quiz.questions[gameState.currentQuestionIndex]),
            totalScore: gameState.score
        });
    }),
    /**
     * Finalizes the game, updating the DB and clearing the Redis cache.
     */
    finishSoloGame: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { sessionId } = req.params;
        const gameState = yield SoloSession_1.soloSessionManager.getSession(sessionId);
        if (!gameState)
            return res.status(404).json({ message: "Session expired or not found." });
        try {
            // 1. Update the main DB record with the final status and score
            yield GameSession_1.GameSessionModel.updateOne({ _id: sessionId }, {
                status: 'completed',
                endedAt: new Date(),
                'results.0.finalScore': gameState.score
            });
            // --- FIX: Fetch and Cache the Full Results ---
            // 2. Fetch the detailed history for this session from the database
            const fullResults = yield game_repositories_1.GameRepository.fetchFullSessionResults(sessionId);
            // 3. If results exist, cache them using the same key structure as multiplayer
            if (fullResults === null || fullResults === void 0 ? void 0 : fullResults.length) {
                const cacheKey = `session-results:${sessionId}`;
                yield redis_1.default.set(cacheKey, JSON.stringify(fullResults), {
                    EX: CACHE_EXPIRATION_QUIZZ_RESULT_SECONDS,
                });
                console.log(`[Cache] Cached SOLO results for session ${sessionId}`);
            }
            yield SoloSession_1.soloSessionManager.removeSession(sessionId);
            res.status(200).json({ message: "Game finished successfully!", finalScore: gameState.score });
        }
        catch (error) {
            console.error("Error finishing solo game:", error);
            res.status(500).json({ message: "Error finishing game." });
        }
    })
};
