import { Server, Socket } from "socket.io";
import { GameSessionManager } from "../../config/data/GameSession";
import { broadcastGameState } from "./shared"

/**
 * Ends the current round, calculates scores, and sends results to all players.
 */
export function endRound(io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (!room || room.gameState !== 'question' || !room.questions) return;

    // Clear the timer in case this was triggered by all players answering
    if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = undefined;
    }

    console.log(`[Game] Round over for room ${roomId}. Calculating scores.`);
    const currentQuestion = room.questions[room.currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

    // Calculate scores
    room.participants.forEach(p => {
        if (p.role === 'player') {
            const playerAnswer = room.answers.get(p.socket_id);
            if (playerAnswer !== undefined && playerAnswer === correctAnswerIndex) {
                p.score += currentQuestion.point; // Add points for correct answer
            }
        }
    });

    room.gameState = 'results';
    broadcastGameState(io, roomId);
}

/**
 * Sends the next question to all players or ends the game if no questions are left.
 */
function nextQuestion(io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (!room || !room.questions) return;

    room.currentQuestionIndex++;
    room.answers.clear(); 
    room.participants.forEach(p => p.answered = false);

    if (room.currentQuestionIndex >= room.questions.length) {
        console.log(`[Game] Game over for room ${roomId}.`);
        room.gameState = 'end';
        broadcastGameState(io, roomId);
        setTimeout(() => GameSessionManager.removeSession(roomId), 60000); 
        return;
    }

    room.gameState = 'question';
    console.log(`[Game] Sending question ${room.currentQuestionIndex + 1} to room ${roomId}.`);
    broadcastGameState(io, roomId);
}


// --- SOCKET EVENT HANDLERS ---

export function handleSubmitAnswer(socket: Socket, io: Server, data: { roomId: number; optionIndex: number }) {
    const { roomId, optionIndex } = data;
    const room = GameSessionManager.getSession(roomId);
    const player = room?.participants.find(p => p.socket_id === socket.id);

    if (!room || !player || player.role !== 'player' || room.gameState !== 'question') return;

    // Record the player's answer if they haven't answered yet
    if (!player.answered) {
        player.answered = true;
        room.answers.set(socket.id, optionIndex);
        console.log(`[Game] Player ${socket.id} in room ${roomId} answered with index ${optionIndex}.`);

        // Check if all active players have answered
        const activePlayers = room.participants.filter(p => p.role === 'player' && p.isOnline);
        if (activePlayers.every(p => p.answered)) {
            endRound(io, roomId);
        } else {
            // If not everyone has answered, just update the state to show who has
            broadcastGameState(io, roomId);
        }
    }
}

export function handleRequestNextQuestion(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (room && room.host_socket_id === socket.id && room.gameState === 'results') {
        nextQuestion(io, roomId);
    }
}
export function handleRejoinGame(socket: Socket, io: Server, data: { roomId: number }) {
    const { roomId } = data;
    const room = GameSessionManager.getSession(roomId);

    if (room) {
        console.log(`User ${socket.id} is rejoining room ${roomId}.`);
        // Add the new socket to the Socket.IO room to ensure it receives broadcasts
        socket.join(roomId.toString());
        // Re-broadcast the current state to everyone in the room.
        // This will update the rejoining player and keep everyone else in sync.
        broadcastGameState(io, roomId);
    } else {
        // If the room doesn't exist, send an error back to the client
        socket.emit('error-message', 'The game you tried to join does not exist.');
    }
}
