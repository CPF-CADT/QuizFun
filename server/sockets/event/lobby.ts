import { Server, Socket } from "socket.io";
import { GameSessionManager, Participant } from "../../config/data/GameSession";
import { generateRandomNumber } from '../../service/generateRandomNumber';
import { QuizModel } from "../../model/Quiz";
import { broadcastGameState, endRound } from "./shared";
import { nextQuestion } from "./handlers";

// =================================================================================
// LOBBY & GAME SETUP HANDLERS
// =================================================================================

/**
 * Handles the 'create-room' event from a client.
 * Creates a new game session and adds the host.
 * @param data Contains quizId, the host's persistent userId, and their chosen name.
 */
export function handleCreateRoom(socket: Socket, io: Server, data: { quizId: string, userId: string, hostName: string }) {
    const roomId = generateRandomNumber(6);
    // Add the session using only the persistent data required by the manager.
    GameSessionManager.addSession(roomId, {
        quizId: data.quizId,
        hostId: data.userId,
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

    console.log(`[Lobby] Host ${data.hostName} (${data.userId}) created room: ${roomId}`);
    broadcastGameState(io, roomId);
}

/**
 * Handles the 'join-room' event.
 * Adds a new player to an existing lobby or reconnects them if they already exist.
 * @param data Contains roomId, the player's persistent userId, and their chosen name.
 */
export function handleJoinRoom(socket: Socket, io: Server, data: { roomId: number; username: string, userId: string }) {
    const { roomId, username, userId } = data;
    const room = GameSessionManager.getSession(roomId);

    if (!room) return socket.emit("error-message", `Room "${roomId}" does not exist.`);
    if (room.gameState !== 'lobby') return socket.emit("error-message", `Game in room "${roomId}" has already started.`);
    
    // If the user is already in the participants list, treat it as a rejoin.
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

    console.log(`[Lobby] Player ${username} (${userId}) joined room: ${roomId}`);
    broadcastGameState(io, roomId);
}

/**
 * Handles the 'start-game' event from the host.
 * Fetches quiz questions and transitions the game state to 'question'.
 */
export async function startGame(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    // Correctly find the host in the participants array to verify their current socket ID.
    const host = room?.participants.find(p => p.role === 'host');

    if (!room || !host || host.socket_id !== socket.id) {
        return socket.emit("error-message", "Only the host can start the game.");
    }
    if (room.participants.filter(p => p.role === 'player' && p.isOnline).length === 0) {
        return socket.emit("error-message", "Cannot start with no players.");
    }

    try {
        const quiz = await QuizModel.findById(room.quizId).lean();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return broadcastGameState(io, roomId, "Error: This quiz has no questions.");
        }
        room.questions = quiz.questions;
        nextQuestion(io, roomId); // Use the shared function to start the first question
    } catch (error) {
        console.error(`[Game] Error starting game for room ${roomId}:`, error);
        broadcastGameState(io, roomId, "A server error occurred while starting the game.");
    }
}

// =================================================================================
// CORE GAMEPLAY HANDLERS
// =================================================================================

/**
 * Handles a player submitting or changing their answer.
 * @param data Contains roomId, the player's userId, and their chosen optionIndex.
 */
export function handleSubmitAnswer(socket: Socket, io: Server, data: { roomId: number; userId: string, optionIndex: number }) {
    const { roomId, userId, optionIndex } = data;
    const room = GameSessionManager.getSession(roomId);
    const player = room?.participants.find(p => p.user_id === userId);

    if (!room || !player || player.role !== 'player' || room.gameState !== 'question') return;

    room.answers.set(userId, optionIndex);
    if (!player.hasAnswered) {
        player.hasAnswered = true;
    }
    console.log(`[Game] Player ${player.user_name} in room ${roomId} answered with index ${optionIndex}.`);

    const activePlayers = room.participants.filter(p => p.role === 'player' && p.isOnline);
    if (activePlayers.every(p => p.hasAnswered)) {
        endRound(io, roomId);
    } else {
        broadcastGameState(io, roomId);
    }
}

/**
 * Handles the host's request to move to the next question from the results screen.
 */
export function handleRequestNextQuestion(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');
    if (room && host?.socket_id === socket.id && room.gameState === 'results') {
        nextQuestion(io, roomId);
    }
}

// =================================================================================
// CONNECTION & DISCONNECTION HANDLERS
// =================================================================================

/**
 * Handles a user rejoining a game, typically after a disconnection.
 * @param data Contains the roomId and the persistent userId of the rejoining user.
 */
export function handleRejoinGame(socket: Socket, io: Server, data: { roomId: number, userId: string }) {
    const { roomId, userId } = data;
    const room = GameSessionManager.getSession(roomId);
    if (!room) return socket.emit('error-message', 'The game you tried to rejoin does not exist.');

    const participant = room.participants.find(p => p.user_id === userId);
    if (participant) {
        console.log(`[Connection] Participant ${participant.user_name} (${userId}) reconnected to room ${roomId} with new socket ${socket.id}.`);
        participant.socket_id = socket.id;
        participant.isOnline = true;

        socket.join(roomId.toString());
        broadcastGameState(io, roomId);
    } else {
        socket.emit('error-message', 'Could not find your session in this game.');
    }
}

/**
 * Handles a user disconnecting from the socket server.
 */
export function handleDisconnect(socket: Socket, io: Server) {
    const sessionInfo = GameSessionManager.findSessionBySocketId(socket.id);
    if (sessionInfo) {
        const { roomId, session } = sessionInfo;
        const disconnectedUser = session.participants.find(p => p.socket_id === socket.id);

        if (disconnectedUser) {
            console.log(`[Connection] User ${disconnectedUser.user_name} disconnected from room ${roomId}.`);
            disconnectedUser.isOnline = false;

            if (disconnectedUser.role === 'host') {
                console.log(`[Game] Host disconnected. Ending game in room ${roomId}.`);
                broadcastGameState(io, roomId, "The host has disconnected. The game has ended.");
                GameSessionManager.removeSession(roomId);
            } else {
                // If a player disconnects, check if all remaining players have answered
                const activePlayers = session.participants.filter(p => p.role === 'player' && p.isOnline);
                if (session.gameState === 'question' && activePlayers.length > 0 && activePlayers.every(p => p.hasAnswered)) {
                    endRound(io, roomId);
                } else {
                    broadcastGameState(io, roomId);
                }
            }
        }
    }
}
