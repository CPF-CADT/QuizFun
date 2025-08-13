import { Server, Socket } from "socket.io";
import http from "http";
import {
    handleCreateRoom,
    handleJoinRoom,
    startGame,
    handleSubmitAnswer,
    handleRequestNextQuestion,
    handleRejoinGame,
    handleDisconnect,
    handlePlayAgain
} from "../sockets/event/handlers";
import { GameSessionManager } from "./data/GameSession";

/**
 * Sets up all Socket.IO event listeners and routing.
 */
export default function socketSetup(server: http.Server) {
    const io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket: Socket) => {
        console.log(`[Connection] User connected with socket ID: ${socket.id}`);
        
        const { roomId, userId } = socket.handshake.query;
        if (roomId && userId && typeof roomId === 'string' && typeof userId === 'string') {
             const room = GameSessionManager.getSession(parseInt(roomId, 10));
             if (room && room.participants.some(p => p.user_id === userId)) {
                handleRejoinGame(socket, io, { roomId: parseInt(roomId, 10), userId });
             }
        }

        // --- Lobby Events ---
        socket.on("create-room", (data) => handleCreateRoom(socket, io, data));
        socket.on("join-room", (data) => handleJoinRoom(socket, io, data));
        socket.on("start-game", (roomId) => startGame(socket, io, roomId));

        // --- Game Events ---
        socket.on("submit-answer", (data) => handleSubmitAnswer(socket, io, data));
        socket.on("request-next-question", (roomId) => handleRequestNextQuestion(socket, io, roomId));
        socket.on("play-again", (roomId) => handlePlayAgain(socket, io, roomId));
        
        // --- Disconnect Event ---
        socket.on("disconnect", () => handleDisconnect(socket, io));
    });
}
