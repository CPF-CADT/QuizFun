import { Server } from "socket.io";
import { GameSessionManager } from "../../config/data/GameSession";
import { IQuestion } from "../../model/Quiz";

/**
 * Ends the current question round, calculates scores, and transitions to the 'results' state.
 */
export function endRound(io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    // Ensure the round hasn't already ended
    if (!room || room.gameState !== 'question' || !room.questions) return;

    // Clear the question timer if it's running
    if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = undefined;
    }

    console.log(`[Game] Round over for room ${roomId}. Calculating scores.`);
    const currentQuestion = room.questions[room.currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

    // Calculate scores for players who answered correctly
    room.participants.forEach(p => {
        if (p.role === 'player') {
            const playerAnswer = room.answers.get(p.user_id);
            if (playerAnswer !== undefined && playerAnswer === correctAnswerIndex) {
                p.score += currentQuestion.point;
            }
        }
    });

    room.gameState = 'results';
    broadcastGameState(io, roomId);
}


/**
 * Broadcasts a tailored game state to every participant in the room.
 * - Hosts get the full question data (including correct answers).
 * - Players get sanitized question data (without correct answers until the results phase).
 * This is the single source of truth for all client-side updates.
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
        error: errorMessage,
    };

    const currentQuestion = (room.questions && room.currentQuestionIndex >= 0)
        ? room.questions[room.currentQuestionIndex]
        : null;

    // Send a specific state to each participant
    room.participants.forEach(p => {
        let questionPayload: IQuestion | object | null = null;

        if (currentQuestion) {
            if (p.role === 'host') {
                // Host sees everything
                questionPayload = currentQuestion;
            } else {
                // Player sees a sanitized version
                const sanitizedQuestion: any = {
                    questionText: currentQuestion.questionText,
                    point: currentQuestion.point,
                    timeLimit: currentQuestion.timeLimit,
                    imageUrl: currentQuestion.imageUrl,
                    options: currentQuestion.options.map(opt => ({ text: opt.text })), // Remove isCorrect flag
                };

                // During results, reveal the correct answer and the player's own answer
                if (room.gameState === 'results') {
                    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
                    sanitizedQuestion.correctAnswerIndex = correctAnswerIndex;

                    const playerAnswerIndex = room.answers.get(p.user_id);
                    if (playerAnswerIndex !== undefined) {
                        sanitizedQuestion.yourAnswer = {
                            optionIndex: playerAnswerIndex,
                            wasCorrect: playerAnswerIndex === correctAnswerIndex,
                        };
                    }
                }
                questionPayload = sanitizedQuestion;
            }
        }

        const stateToSend = {
            ...baseState,
            question: questionPayload,
            yourUserId: p.user_id, // Tell the client who they are
        };
        io.to(p.socket_id).emit('game-update', stateToSend);
    });

    // If we just entered the 'question' state, start the server-side timer
    if (room.gameState === 'question' && !room.questionTimer && currentQuestion) {
        const timeLimit = currentQuestion.timeLimit;
        room.questionTimer = setTimeout(() => endRound(io, roomId), timeLimit * 1000);
    }
}
