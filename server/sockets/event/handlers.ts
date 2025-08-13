import { Server, Socket } from "socket.io";
import { GameSessionManager, Participant, GameSettings } from "../../config/data/GameSession";
import { generateRandomNumber } from '../../service/generateRandomNumber';
import { QuizModel } from "../../model/Quiz";
import { broadcastGameState, endRound } from "./shared";
import { PlayerAnswer } from "../../config/data/GameSession";

// =================================================================================
// LOBBY & GAME SETUP HANDLERS
// =================================================================================

export function handleCreateRoom(socket: Socket, io: Server, data: { quizId: string, userId: string, hostName: string, settings: GameSettings }) {
    const roomId = generateRandomNumber(6);
    GameSessionManager.addSession(roomId, {
        quizId: data.quizId,
        hostId: data.userId,
        settings: data.settings,
    });

    const room = GameSessionManager.getSession(roomId)!;
    const hostParticipant: Participant = {
        socket_id: socket.id,
        user_id: data.userId,
        user_name: data.hostName,
        isOnline: true,
        score: 0,
        role: 'host',
        hasAnswered: false,
    };
    room.participants.push(hostParticipant);
    socket.join(roomId.toString());
    broadcastGameState(io, roomId);
}

export function handleJoinRoom(socket: Socket, io: Server, data: { roomId: number; username: string, userId: string }) {
    const { roomId, username, userId } = data;
    const room = GameSessionManager.getSession(roomId);

    if (!room) return socket.emit("error-message", `Room "${roomId}" does not exist.`);
    if (room.gameState !== 'lobby') return socket.emit("error-message", `Game in room "${roomId}" has already started.`);
    if (room.participants.some(p => p.user_id === userId)) {
        return handleRejoinGame(socket, io, { roomId, userId });
    }
    if (room.participants.length >= 50) return socket.emit("error-message", `Room "${roomId}" is full.`);

    const player: Participant = {
        socket_id: socket.id,
        user_id: userId,
        user_name: username,
        isOnline: true,
        score: 0,
        role: 'player',
        hasAnswered: false,
    };
    room.participants.push(player);
    socket.join(roomId.toString());
    broadcastGameState(io, roomId);
}

export async function startGame(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');

    if (!room || !host || host.socket_id !== socket.id) return;
    if (room.participants.filter(p => p.role === 'player' && p.isOnline).length === 0) return;

    try {
        const quiz = await QuizModel.findById(room.quizId).lean();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return broadcastGameState(io, roomId, "Error: This quiz has no questions.");
        }
        room.questions = quiz.questions;
        nextQuestion(io, roomId);
    } catch (error) {
        console.error(`[Game] Error starting game for room ${roomId}:`, error);
        broadcastGameState(io, roomId, "A server error occurred while starting the game.");
    }
}

// =================================================================================
// CORE GAMEPLAY HANDLERS
// =================================================================================

export function nextQuestion(io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (!room || !room.questions) return;

    room.currentQuestionIndex++;
    room.answers.clear();
    room.answerCounts = [];
    room.participants.forEach(p => p.hasAnswered = false);

    if (room.currentQuestionIndex >= room.questions.length) {
        console.log(`[Game] Final question answered for room ${roomId}.`);
        room.gameState = 'end';
        room.isFinalResults = true;
        broadcastGameState(io, roomId);
        return;
    }

    room.gameState = 'question';
    console.log(`[Game] Sending question ${room.currentQuestionIndex + 1} to room ${roomId}.`);
    broadcastGameState(io, roomId);
}

export function handleSubmitAnswer(socket: Socket, io: Server, data: { roomId: number; userId: string, optionIndex: number }) {
    const { roomId, userId, optionIndex } = data;
    const room = GameSessionManager.getSession(roomId);
    const player = room?.participants.find(p => p.user_id === userId);

    if (!room || !player || player.role !== 'player' || room.gameState !== 'question') return;

    // If answer changes are disallowed and player has already answered, do nothing.
    if (!room.settings.allowAnswerChange && player.hasAnswered) {
        return;
    }
    // Calculate elapsed and remaining time in milliseconds
    if (!room.questions) {
        console.error(`Room ${roomId} has no questions.`);
        return;
    }

    const elapsedMs = Date.now() - (room.questionStartTime ?? Date.now());
    const timeLimitSec = room.questions?.[room.currentQuestionIndex]?.timeLimit ?? 0;
    const remainingSec = Math.max(0, timeLimitSec - elapsedMs / 1000);

    // Ensure user's answer array exists
    let userAnswer = room.answers.get(userId);
    if (!userAnswer) {
        userAnswer = [];
    }

    // Create PlayerAnswer object
    const playerAnswer: PlayerAnswer = {
        optionIndex: optionIndex,
        remainingTime: remainingSec,
        isCorrect: false,
    };

    // Push the answer to the user's stack
    userAnswer.push(playerAnswer);

    room.answers.set(userId, userAnswer);


    if (!player.hasAnswered) {
        player.hasAnswered = true;
    }
    console.log(`[Game] Player ${player.user_name} in room ${roomId} submitted answer ${optionIndex}.`);

    // Only broadcast state back if answer changes are allowed.
    // Otherwise, the UI locks and we wait for the round to end.
    if (room.settings.allowAnswerChange) {
        broadcastGameState(io, roomId);
    }

    // If answer changes are NOT allowed, we only end the round when all players have answered.
    // If they ARE allowed, we wait for the timer.
    const activePlayers = room.participants.filter(p => p.role === 'player' && p.isOnline);
    if (!room.settings.allowAnswerChange && activePlayers.every(p => p.hasAnswered)) {
        endRound(io, roomId);
    }
}

export function handleRequestNextQuestion(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');
    if (room && host?.socket_id === socket.id && room.gameState === 'results') {
        if (room.autoNextTimer) {
            clearTimeout(room.autoNextTimer);
            room.autoNextTimer = undefined;
        }
        nextQuestion(io, roomId);
    }
}

export function handlePlayAgain(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');

    if (room && host?.socket_id === socket.id && room.gameState === 'end') {
        console.log(`[Lobby] Host is restarting game in room ${roomId}`);
        room.gameState = 'lobby';
        room.currentQuestionIndex = -1;
        room.answers.clear();
        room.answerCounts = [];
        room.isFinalResults = false;
        room.participants.forEach(p => {
            p.score = 0;
            p.hasAnswered = false;
        });
        broadcastGameState(io, roomId);
    }
}

// =================================================================================
// CONNECTION & DISCONNECTION HANDLERS
// =================================================================================

export function handleRejoinGame(socket: Socket, io: Server, data: { roomId: number, userId: string }) {
    const { roomId, userId } = data;
    const room = GameSessionManager.getSession(roomId);
    if (!room) return socket.emit('error-message', 'The game you tried to rejoin does not exist.');

    const participant = room.participants.find(p => p.user_id === userId);
    if (participant) {
        console.log(`[Connection] Participant ${participant.user_name} reconnected.`);
        participant.socket_id = socket.id;
        participant.isOnline = true;
        socket.join(roomId.toString());
        broadcastGameState(io, roomId);
    } else {
        socket.emit('error-message', 'Could not find your session in this game.');
    }
}

export function handleDisconnect(socket: Socket, io: Server) {
    const sessionInfo = GameSessionManager.findSessionBySocketId(socket.id);
    if (sessionInfo) {
        const { roomId, session } = sessionInfo;
        const disconnectedUser = session.participants.find(p => p.socket_id === socket.id);

        if (disconnectedUser) {
            console.log(`[Connection] User ${disconnectedUser.user_name} disconnected.`);
            disconnectedUser.isOnline = false;

            if (disconnectedUser.role === 'host') {
                broadcastGameState(io, roomId, "The host has disconnected. The game has ended.");
                GameSessionManager.removeSession(roomId);
            } else {
                const activePlayers = session.participants.filter(p => p.role === 'player' && p.isOnline);
                if (session.gameState === 'question' && !session.settings.allowAnswerChange && activePlayers.length > 0 && activePlayers.every(p => p.hasAnswered)) {
                    endRound(io, roomId);
                } else {
                    broadcastGameState(io, roomId);
                }
            }
        }
    }
}
