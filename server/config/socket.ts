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
    handlePlayAgain,
    handleUpdateSettings
} from "../sockets/event/handlers";
import { GameSessionManager } from "./data/GameSession";

/**
 * Sets up all Socket.IO event listeners and routing.
 */
export default function socketSetup(server: http.Server) {
    const io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", async (socket: Socket) => {
        console.log(`[Connection] User connected with socket ID: ${socket.id}`);
        
        // Handle auto-rejoin on connection
        const { roomId, userId } = socket.handshake.query;
        if (roomId && userId && typeof roomId === 'string' && typeof userId === 'string') {
            const room = await GameSessionManager.getSession(parseInt(roomId, 10));
            if (room && room.participants.some(p => p.user_id === userId)) {
                // Using a self-invoking async function to handle the promise safely
                (async () => {
                    try {
                        await handleRejoinGame(socket, io, { roomId: parseInt(roomId, 10), userId });
                    } catch (err) {
                        console.error("[Socket] Error in auto-rejoin:", err);
                    }
                })();
            }
        }

        // --- Lobby Events ---
        socket.on("create-room", async (data) => {
            try {
                await handleCreateRoom(socket, io, data);
            } catch (err) {
                console.error("[Socket] Error in create-room:", err);
            }
        });
        socket.on('update-settings', async (data) => {
            try {
                await handleUpdateSettings(socket, io, data);
            } catch (err) {
                console.error("[Socket] Error in update-settings:", err);
            }
        });
        socket.on("join-room", async (data) => {
            try {
                await handleJoinRoom(socket, io, data);
            } catch (err) {
                console.error("[Socket] Error in join-room:", err);
            }
        });

        socket.on("start-game", async (roomId) => {
            try {
                await startGame(socket, io, roomId);
            } catch (err) {
                console.error("[Socket] Error in start-game:", err);
            }
        });

        // --- Game Events ---
        socket.on("submit-answer", async (data) => {
            try {
                await handleSubmitAnswer(socket, io, data);
            } catch (err) {
                console.error("[Socket] Error in submit-answer:", err);
            }
        });

        socket.on("request-next-question", async (roomId) => {
            try {
                await handleRequestNextQuestion(socket, io, roomId);
            } catch (err) {
                console.error("[Socket] Error in request-next-question:", err);
            }
        });

        socket.on("play-again", async (roomId) => {
            try {
                await handlePlayAgain(socket, io, roomId);
            } catch (err) {
                console.error("[Socket] Error in play-again:", err);
            }
        });

        // --- Disconnect Event ---
        socket.on("disconnect", async () => {
            try {
                await handleDisconnect(socket, io);
            } catch (err) {
                console.error("[Socket] Error in disconnect:", err);
            }
        });
    });
}