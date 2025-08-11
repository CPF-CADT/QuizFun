import { Server, Socket } from "socket.io";
import { GameSessionManager, Participant } from "../../config/data/GameSession";
import { generateRandomNumber } from '../../service/generateRandomNumber';
import { QuizModel } from "../../model/Quiz";
import { broadcastGameState } from "./shared"; // We will use a shared function to send updates

// In your lobby.ts file

export function handleCreateRoom(socket: Socket, io: Server, data: { quizId: string, hostId: string, hostName: string }) {
    const roomId = generateRandomNumber(6);
    GameSessionManager.addSession(roomId, {
        quizId: data.quizId,
        hostId: data.hostId,
        host_socket_id: socket.id,
    });

    const room = GameSessionManager.getSession(roomId)!;

    const hostParticipant: Participant = {
        socket_id: socket.id,
        user_id: data.hostId,
        user_name: data.hostName,
        isOnline: true,
        score: 0,
        role: 'host',
        answered: false,
    };
    room.participants.push(hostParticipant);
    socket.join(roomId.toString());

    console.log(`User ${socket.id} (Host: ${data.hostName}) created and joined room: ${roomId}`);
    
    broadcastGameState(io, roomId); 
}

// --- Join Room Handler ---
export function handleJoinRoom(socket: Socket, io: Server, data: { roomId: number; username: string, user_id: string }) {
    const { roomId, username, user_id } = data;
    const room = GameSessionManager.getSession(roomId);

    if (!room) {
        return socket.emit("error-message", `Room "${roomId}" does not exist.`);
    }
    if (room.gameState !== 'lobby') {
        return socket.emit("error-message", `Game in room "${roomId}" has already started.`);
    }
    if (room.participants.length >= 20) {
        return socket.emit("error-message", `Room "${roomId}" is already full.`);
    }

    const player: Participant = {
        socket_id: socket.id,
        user_id: user_id,
        user_name: username,
        isOnline: true,
        score: 0,
        role: 'player',
        answered: false,
    };
    room.participants.push(player);
    socket.join(roomId.toString());

    console.log(`User ${socket.id} (${username}) joined room: ${roomId}`);
    broadcastGameState(io, roomId);
}

// --- Start Game Handler ---
export async function startGame(socket: Socket, io: Server, roomId: number){
    const room = GameSessionManager.getSession(roomId);

    if (!room || room.host_socket_id !== socket.id) {
        return socket.emit("error-message", "Only the host can start the game.");
    }
    if (room.participants.filter(p => p.role === 'player').length === 0) {
        return socket.emit("error-message", "Cannot start the game with no players.");
    }

    try {
        // Using RAM: For now, we'll use a mock quiz.
        // In your real app, you would uncomment the MongoDB fetch.
        const quiz = await QuizModel.findById(room.quizId).lean();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return broadcastGameState(io, roomId, "This quiz has no questions.");
        }
        room.questions = quiz.questions;

        // // MOCK QUIZ DATA (for RAM usage)
        // room.questions = [
        //     { questionText: 'What is the capital of France?', point: 10, timeLimit: 15, options: [{ text: 'Berlin', isCorrect: false }, { text: 'Madrid', isCorrect: false }, { text: 'Paris', isCorrect: true }, { text: 'Rome', isCorrect: false }] },
        //     { questionText: 'Which planet is known as the Red Planet?', point: 10, timeLimit: 15, options: [{ text: 'Mars', isCorrect: true }, { text: 'Jupiter', isCorrect: false }, { text: 'Venus', isCorrect: false }, { text: 'Saturn', isCorrect: false }] },
        //     { questionText: 'What is 2 + 2?', point: 10, timeLimit: 10, options: [{ text: '3', isCorrect: false }, { text: '4', isCorrect: true }, { text: '5', isCorrect: false }, { text: '6', isCorrect: false }] },
        // ];
        // END MOCK DATA

        room.gameState = 'question';
        room.currentQuestionIndex = 0;

        console.log(`[Game] Game starting in room ${roomId}.`);
        broadcastGameState(io, roomId); // Send the first question
    } catch (error) {
        console.error(`Error starting game for room ${roomId}:`, error);
        broadcastGameState(io, roomId, "A server error occurred while starting the game.");
    }
}
