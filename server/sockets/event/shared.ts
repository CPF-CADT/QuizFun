import { Server } from "socket.io";
import { GameSessionManager } from "../../config/data/GameSession";
import { IQuestion } from "../../model/Quiz";
import { nextQuestion } from "./handlers";
import { calculatePoint } from "../../service/calculation";
const RESULTS_DISPLAY_DURATION = 5000;

/**
 * Ends the current question round, calculates scores, and transitions to the 'results' state.
 */
export function endRound(io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (!room || room.gameState !== 'question' || !room.questions) return;

    if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = undefined;
    }

    console.log(`[Game] Round over for room ${roomId}. Calculating scores.`);
    const currentQuestion = room.questions[room.currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

    // Tally answers for statistics
    const answerCounts = Array(currentQuestion.options.length).fill(0);

    for (const answers of room.answers.values()) {
        const lastAnswerIndex = answers.at(-1)?.optionIndex; // cleaner way to get last element
        if (lastAnswerIndex !== undefined && lastAnswerIndex >= 0 && lastAnswerIndex < answerCounts.length) {
            answerCounts[lastAnswerIndex]++;
        }
    }
    room.answerCounts = answerCounts;

    // Calculate scores
    room.participants.forEach(p => {
        if (p.role !== 'player' || !p.user_id) return;  // ✅ ensure user_id exists

        const playerAnswers = room.answers.get(p.user_id);
        if (!playerAnswers || playerAnswers.length === 0) return;

        const lastAnswer = playerAnswers.at(-1)!;
        if (lastAnswer.optionIndex === correctAnswerIndex) {
            p.score += calculatePoint(currentQuestion.point, currentQuestion.timeLimit, lastAnswer.remainingTime);
            lastAnswer.isCorrect = true;
        } else {
            lastAnswer.isCorrect = false;
        }
    });

    room.gameState = 'results';
    console.log(room.answers);

    // If auto-next is enabled, set a timer to advance automatically
    if (room.settings.autoNext) {
        room.autoNextTimer = setTimeout(() => {
            nextQuestion(io, roomId);
        }, RESULTS_DISPLAY_DURATION);
    }

    broadcastGameState(io, roomId);
}

/**
 * Broadcasts a tailored game state to every participant in the room.
 */
export function broadcastGameState(io: Server, roomId: number, errorMessage?: string) {
    const room = GameSessionManager.getSession(roomId);
    if (!room) return;

    const baseState = {
        roomId: roomId,
        gameState: room.gameState,
        participants: room.participants,
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions: room.questions?.length || 0,
        isFinalResults: room.isFinalResults,
        settings: room.settings,
        questionStartTime: room.questionStartTime,
        answerCounts: room.answerCounts,
        error: errorMessage,
    };

    const currentQuestion = (room.questions && room.currentQuestionIndex >= 0)
        ? room.questions[room.currentQuestionIndex]
        : null;

    room.participants.forEach(p => {
        let questionPayload: IQuestion | object | null = null;
        if (currentQuestion) {
            const sanitizedQuestion: any = {
                questionText: currentQuestion.questionText,
                point: currentQuestion.point,
                timeLimit: currentQuestion.timeLimit,
                imageUrl: currentQuestion.imageUrl,
                options: currentQuestion.options.map(opt => ({ text: opt.text })),
            };

            if (room.gameState === 'results' || room.gameState === 'end') {
                sanitizedQuestion.correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

                if (p.user_id) {   // ✅ ensure user_id exists
                    const playerAns = room.answers.get(p.user_id);
                    const playerAnswerIndex = playerAns?.at(-1)?.optionIndex;
                    if (playerAnswerIndex !== undefined) {
                        sanitizedQuestion.yourAnswer = {
                            optionIndex: playerAnswerIndex,
                            wasCorrect: playerAnswerIndex === sanitizedQuestion.correctAnswerIndex,
                        };
                    }
                }
            }
            questionPayload = sanitizedQuestion;
        }

        const stateToSend = { ...baseState, question: questionPayload, yourUserId: p.user_id };
        io.to(p.socket_id).emit('game-update', stateToSend);
    });

    if (room.gameState === 'question' && !room.questionTimer && currentQuestion) {
        room.questionStartTime = Date.now();
        room.questionTimer = setTimeout(() => endRound(io, roomId), currentQuestion.timeLimit * 1000);
        // We need to broadcast again immediately to send the startTime
        broadcastGameState(io, roomId);
    }
}
