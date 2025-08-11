import { Server } from "socket.io";
import http from "http";

// --- Unified Imports ---
// All handlers are now imported from a single, consolidated file,
// which represents the logic in your "game.handlers.ts" Canvas.
// You will also need to move your lobby handlers into this file.
import {
    handleCreateRoom,
    handleJoinRoom,
    startGame,
    handleRejoinGame,
    handleSubmitAnswer,
    handleRequestNextQuestion,
    handleDisconnect
} from "../sockets/event/handlers"; // Assuming a single 'handlers.ts' file now

export default function socketSetup(server: http.Server) {
    const io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("User connected", socket.id);

        // --- Lobby Events ---
        socket.on("create-room", (data) => handleCreateRoom(socket, io, data));
        socket.on("join-room", (data) => handleJoinRoom(socket, io, data));
        socket.on("start-game", (roomId) => startGame(socket, io, roomId));

        // --- Game Events ---
        socket.on("submit-answer", (data) => handleSubmitAnswer(socket, io, data));
        socket.on("request-next-question", (roomId) => handleRequestNextQuestion(socket, io, roomId));
        socket.on("rejoin-game", (data) => handleRejoinGame(socket, io, data));

        // --- Disconnect Event ---
        socket.on("disconnect", () => handleDisconnect(socket, io));
    });
}
