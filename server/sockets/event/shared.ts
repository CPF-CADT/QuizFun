// src/socket/handlers/shared.ts

import { Server } from "socket.io";
import { GameSessionManager, GameStatePayload, ResultsQuestion, SanitizedQuestion } from "../../config/data/GameSession";
import { IQuestion } from "../../model/Quiz";
import { nextQuestion } from "./handlers";
import { calculatePoint } from "../../service/calculation";
import { GameRepository } from "../../repositories/game.repositories";

const RESULTS_DISPLAY_DURATION = 5000; // 5 seconds

export async function endRound(io: Server, roomId: number): Promise<void> {
    const room = GameSessionManager.getSession(roomId);

    if (!room || room.gameState !== 'question' || !room.questions || room.currentQuestionIndex < 0 || room.currentQuestionIndex >= room.questions.length) {
        console.error(`[Game] endRound called in an invalid state for room ${roomId}.`);
        return;
    }

    if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = undefined;
    }

    console.log(`[Game] Round over for room ${roomId}. Calculating scores.`);
    const currentQuestion: IQuestion = room.questions[room.currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

    const answerCounts = Array(currentQuestion.options.length).fill(0);
    for (const answers of room.answers.values()) {
        const lastAnswerIndex = answers.at(-1)?.optionIndex;
        if (lastAnswerIndex !== undefined && lastAnswerIndex >= 0 && lastAnswerIndex < answerCounts.length) {
            answerCounts[lastAnswerIndex]++;
        }
    }
    room.answerCounts = answerCounts;

    const scoresGained = new Map<string, number>();

    room.participants.forEach(p => {
        if (p.role !== 'player' || !p.user_id) return;

        const playerAnswers = room.answers.get(p.user_id);
        const lastAnswer = playerAnswers?.at(-1); 

        if (!lastAnswer) {
            scoresGained.set(p.user_id, 0); 
            return;
        }

        let scoreGainedThisRound = 0;
        if (lastAnswer.optionIndex === correctAnswerIndex) {
            scoreGainedThisRound = calculatePoint(currentQuestion.point, currentQuestion.timeLimit, lastAnswer.remainingTime);
            p.score += scoreGainedThisRound;
            lastAnswer.isCorrect = true; // Set correctness here
        } else {
            lastAnswer.isCorrect = false;
        }
        scoresGained.set(p.user_id, scoreGainedThisRound);
    });

    room.gameState = 'results';
    await GameRepository.saveRoundHistory(roomId, scoresGained);

    if (room.settings.autoNext) {
        room.autoNextTimer = setTimeout(async () => {
            await nextQuestion(io, roomId);
        }, RESULTS_DISPLAY_DURATION);
    }
    
    broadcastGameState(io, roomId);
}

export function broadcastGameState(io: Server, roomId: number, errorMessage?: string): void {
    const room = GameSessionManager.getSession(roomId);
    if (!room) return;

    const totalQuestions = room.questions?.length ?? 0;
    const currentQuestion = (room.questions && room.currentQuestionIndex >= 0 && room.currentQuestionIndex < room.questions.length)
        ? room.questions[room.currentQuestionIndex]
        : null;

    room.participants.forEach(p => {
        let questionPayload: SanitizedQuestion | ResultsQuestion | null = null;

        if (currentQuestion) {
            const baseQuestionPayload: SanitizedQuestion = {
                questionText: currentQuestion.questionText,
                point: currentQuestion.point,
                timeLimit: currentQuestion.timeLimit,
                imageUrl: currentQuestion.imageUrl,
                options: currentQuestion.options.map(opt => ({ text: opt.text })),
            };

            if (room.gameState === 'results' || room.gameState === 'end') {
                const resultsPayload: ResultsQuestion = {
                    ...baseQuestionPayload,
                    correctAnswerIndex: currentQuestion.options.findIndex(opt => opt.isCorrect),
                };

                if (p.user_id) {
                    const playerAnswers = room.answers.get(p.user_id);
                    const lastAnswer = playerAnswers?.at(-1);

                    if (lastAnswer !== undefined) {
                        resultsPayload.yourAnswer = {
                            optionIndex: lastAnswer.optionIndex,
                            wasCorrect: lastAnswer.isCorrect, 
                        };
                    }
                }
                questionPayload = resultsPayload;
            } else {
                questionPayload = baseQuestionPayload;
            }
        }

        const stateToSend: GameStatePayload = {
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
            question: questionPayload,
            yourUserId: p.user_id,
        };

        io.to(p.socket_id).emit('game-update', stateToSend);
    });

    if (room.gameState === 'question' && !room.questionTimer && currentQuestion) {
        room.questionStartTime = Date.now();
        room.questionTimer = setTimeout(() => endRound(io, roomId), currentQuestion.timeLimit * 1000);
        broadcastGameState(io, roomId);
    }
}