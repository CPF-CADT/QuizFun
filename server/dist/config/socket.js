"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = socketSetup;
const socket_io_1 = require("socket.io");
const handlers_1 = require("../sockets/event/handlers"); // Adjust path if necessary
const GameSession_1 = require("../config/data/GameSession"); // Adjust path if necessary
/**
 * Sets up all Socket.IO event listeners and routing.
 */
function socketSetup(server) {
    const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
    io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log(`[Connection] User connected with socket ID: ${socket.id}`);
        // Handle auto-rejoin on page refresh
        const { roomId, userId } = socket.handshake.query;
        if (roomId && userId && typeof roomId === 'string' && typeof userId === 'string') {
            const room = yield GameSession_1.GameSessionManager.getSession(parseInt(roomId, 10));
            if (room && room.participants.some(p => p.user_id === userId)) {
                (() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield (0, handlers_1.handleRejoinGame)(socket, io, { roomId: parseInt(roomId, 10), userId });
                    }
                    catch (err) {
                        console.error("[Socket] Error in auto-rejoin:", err);
                    }
                }))();
            }
        }
        // --- Core Game Event Listeners ---
        socket.on("create-room", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleCreateRoom)(socket, io, data);
            }
            catch (err) {
                console.error("[Socket] Error in create-room:", err);
            }
        }));
        socket.on('update-settings', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleUpdateSettings)(socket, io, data);
            }
            catch (err) {
                console.error("[Socket] Error in update-settings:", err);
            }
        }));
        socket.on("join-room", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleJoinRoom)(socket, io, data);
            }
            catch (err) {
                console.error("[Socket] Error in join-room:", err);
            }
        }));
        socket.on("start-game", (roomId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.startGame)(socket, io, roomId);
            }
            catch (err) {
                console.error("[Socket] Error in start-game:", err);
            }
        }));
        socket.on("end-game", (roomId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield GameSession_1.GameSessionManager.removeSession(parseInt(roomId));
            }
            catch (err) {
                console.error("[Socket] Error in start-game:", err);
            }
        }));
        socket.on("submit-answer", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleSubmitAnswer)(socket, io, data);
            }
            catch (err) {
                console.error("[Socket] Error in submit-answer:", err);
            }
        }));
        socket.on("request-next-question", (roomId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleRequestNextQuestion)(socket, io, roomId);
            }
            catch (err) {
                console.error("[Socket] Error in request-next-question:", err);
            }
        }));
        socket.on("play-again", (roomId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handlePlayAgain)(socket, io, roomId);
            }
            catch (err) {
                console.error("[Socket] Error in play-again:", err);
            }
        }));
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleDisconnect)(socket, io);
            }
            catch (err) {
                console.error("[Socket] Error in disconnect:", err);
            }
        }));
    }));
}
