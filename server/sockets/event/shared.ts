
// FILE: src/socket/handlers/shared.ts
import { Server } from "socket.io";
import { GameSessionManager, GameStatePayload, ResultsQuestion, SanitizedQuestion } from "../../config/data/GameSession";
import { IQuestion } from "../../model/Quiz";
import { calculatePoint } from "../../service/calculation";
import { GameRepository } from "../../repositories/game.repositories";

const RESULTS_DISPLAY_DURATION = 5000; // 5 seconds

/**
 * **FIXED LOGIC**
 * The nextQuestion function is now in this shared file to avoid circular dependencies.
 * It correctly sets the game state and timer *before* broadcasting.
 */
export async function nextQuestion(io: Server, roomId: number): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);
    if (!room || !room.questions) return;

    // Reset state for the new round
    room.currentQuestionIndex++;
    room.answers.clear();
    room.answerCounts = [];
    room.participants.forEach(p => p.hasAnswered = false);

    // Check if the game has ended
    if (room.currentQuestionIndex >= room.questions.length) {
        console.log(`[Game] Final question answered for room ${roomId}.`);
        room.gameState = 'end';
        room.isFinalResults = true;
        await GameRepository.finalizeGameSession(roomId);
        await broadcastGameState(io, roomId);
        return;
    }

    // Set the game state to 'question'
    room.gameState = 'question';
    const currentQuestion = room.questions[room.currentQuestionIndex];

    // Set the start time and the round timer before broadcasting the state.
    room.questionStartTime = Date.now();
    if (room.questionTimer) clearTimeout(room.questionTimer); // Clear any residual timer
    room.questionTimer = setTimeout(() => endRound(io, roomId), currentQuestion.timeLimit * 1000);

    console.log(`[Game] Sending question ${room.currentQuestionIndex + 1} to room ${roomId}.`);
    
    // Broadcast the complete and correct state once.
    await broadcastGameState(io, roomId);
}

export async function endRound(io: Server, roomId: number): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);

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
            lastAnswer.isCorrect = true; 
        } else {
            lastAnswer.isCorrect = false;
        }
        scoresGained.set(p.user_id, scoreGainedThisRound);
    });

    room.gameState = 'results';
    try {
        console.log(`[Game] Attempting to save history for room ${roomId}...`);
        await GameRepository.saveRoundHistory(roomId, scoresGained);
        console.log(`[Game] Successfully saved history for room ${roomId}.`);
    } catch (error) {
        console.error(`[CRITICAL] Failed to save round history for room ${roomId}:`, error);
        const host = room.participants.find(p => p.role === 'host');
        if (host) {
            io.to(host.socket_id).emit('error-message', 'A critical error occurred while saving game history.');
        }
    }
    room.answers.clear();

    if (room.settings.autoNext) {
        room.autoNextTimer = setTimeout(async () => {
            await nextQuestion(io, roomId);
        }, RESULTS_DISPLAY_DURATION);
    }
    
    await broadcastGameState(io, roomId);
}


export async function broadcastGameState(io: Server, roomId: number, errorMessage?: string): Promise<void>{
    const room = await GameSessionManager.getSession(roomId);
    if (!room) return;

    const totalQuestions = room.questions?.length ?? 0;
    const currentQuestion = (room.questions && room.currentQuestionIndex >= 0 && room.currentQuestionIndex < room.questions.length)
        ? room.questions[room.currentQuestionIndex]
        : null;

    room.participants.forEach(p => {
        if (!p.isOnline) return;

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
            question: questionPayload,
            yourUserId: p.user_id,
        };

        io.to(p.socket_id).emit('game-update', stateToSend);
    });
}






