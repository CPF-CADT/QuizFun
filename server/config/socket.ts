import { Server, Socket } from "socket.io";
import http from "http";
import {
    handleCreateRoom,
    handleJoinRoom,
    startGame,
    handleSubmitAnswer,
    handleRequestNextQuestion,
    handleRejoinGame,
    handleDisconnect
} from "../sockets/event/handlers"; // Assuming a single 'handlers.ts' file now
import { GameSessionManager } from "../config/data/GameSession";

/**
 * Sets up all Socket.IO event listeners and routing.
 * @param server The HTTP server instance.
 */
export default function socketSetup(server: http.Server) {
    const io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket: Socket) => {
        console.log(`[Connection] User connected with socket ID: ${socket.id}`);
        
        // --- Reconnection Logic ---
        // The client sends its stored IDs in the connection query.
        const { roomId, userId } = socket.handshake.query;
        if (roomId && userId && typeof roomId === 'string' && typeof userId === 'string') {
            // If a user has session data, attempt to rejoin them to the game.
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
        
        // Note: 'rejoin-game' is now handled on initial connection, but we can keep this
        // as a fallback for manual rejoin attempts if needed.
        socket.on("rejoin-game", (data) => handleRejoinGame(socket, io, data));

        // --- Disconnect Event ---
        socket.on("disconnect", () => handleDisconnect(socket, io));
    });
}
