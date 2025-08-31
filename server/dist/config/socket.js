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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = socketSetup;
// server/sockets/socketSetup.ts
const socket_io_1 = require("socket.io");
const redis_1 = __importDefault(require("./redis"));
const handlers_1 = require("../sockets/event/handlers");
function socketSetup(server) {
    const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
    io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log(`[Connection] User connected: ${socket.id}`);
        const { teamId, userId, roomId } = socket.handshake.query;
        // --- Join team room if teamId exists in query parameters ---
        if (teamId && typeof teamId === "string") {
            const teamRoom = `team-${teamId}`;
            socket.join(teamRoom);
            console.log(`[Team] Socket ${socket.id} auto-joined team room: ${teamRoom}`);
            // Fetch pending events for offline members
            socket.emit("fetch-pending-events", (callback) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const redisKey = `team:${teamId}:pendingEvents`;
                    const events = (yield redis_1.default.lRange(redisKey, 0, -1)) || [];
                    const parsed = events.map(e => JSON.parse(e));
                    callback(parsed);
                    if (events.length)
                        yield redis_1.default.del(redisKey);
                }
                catch (err) {
                    console.error("[Socket] Failed to fetch pending events:", err);
                    callback([]);
                }
            }));
        }
        // --- Handle manual team room joining (from frontend joinTeamRoom function) ---
        socket.on("join-team-room", (teamId) => {
            if (!teamId)
                return;
            const teamRoom = `team-${teamId}`;
            socket.join(teamRoom);
            console.log(`[Team] Socket ${socket.id} manually joined team room: ${teamRoom}`);
            // Send immediate confirmation to the client
            socket.emit("team-room-joined", { teamId, teamRoom });
            // Fetch pending events when manually joining
            socket.emit("fetch-pending-events", (callback) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const redisKey = `team:${teamId}:pendingEvents`;
                    const events = (yield redis_1.default.lRange(redisKey, 0, -1)) || [];
                    const parsed = events.map(e => JSON.parse(e));
                    console.log(`[Team] Sending ${parsed.length} pending events to ${socket.id}`);
                    callback(parsed);
                    if (events.length)
                        yield redis_1.default.del(redisKey);
                }
                catch (err) {
                    console.error("[Socket] Failed to fetch pending events:", err);
                    callback([]);
                }
            }));
        });
        // Add a test event handler
        socket.on("test-connection", (data) => {
            console.log(`[Test] Received test-connection from ${socket.id}:`, data);
            socket.emit("test-response", { message: "Backend received your test", data });
        });
        // Store lobby events in Redis and notify online members
        socket.on("host-activated-lobby", (data) => __awaiter(this, void 0, void 0, function* () {
            const { sessionId, roomId, teamId } = data;
            if (!sessionId || !roomId)
                return;
            console.log(`[Team] Host activated lobby - SessionID: ${sessionId}, RoomID: ${roomId}, TeamID: ${teamId}`);
            if (teamId) {
                const teamRoom = `team-${teamId}`;
                const redisKey = `team:${teamId}:pendingEvents`;
                const eventData = { sessionId, joinCode: roomId, timestamp: Date.now() };
                // Check how many sockets are in the team room
                const socketsInRoom = yield io.in(teamRoom).fetchSockets();
                console.log(`[Team] Sockets in room ${teamRoom}:`, socketsInRoom.map(s => s.id));
                try {
                    yield redis_1.default.rPush(redisKey, JSON.stringify(eventData));
                    yield redis_1.default.expire(redisKey, 3600); // TTL 1 hour
                    // Emit to team room
                    io.to(teamRoom).emit("team-lobby-activated", eventData);
                    console.log(`[Team] Lobby activation event sent to ${teamRoom} (${socketsInRoom.length} sockets) and stored in Redis`);
                    // Also send to individual socket for testing
                    socketsInRoom.forEach(s => {
                        console.log(`[Team] Sending team-lobby-activated directly to socket ${s.id}`);
                        s.emit("team-lobby-activated", eventData);
                    });
                }
                catch (err) {
                    console.error("[Socket] Failed to store lobby event:", err);
                }
            }
        }));
        // --- Lobby & Game Events ---
        socket.on("create-room", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleCreateRoom)(socket, io, data);
            }
            catch (err) {
                console.error(err);
            }
        }));
        socket.on("join-room", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleJoinRoom)(socket, io, data);
            }
            catch (err) {
                console.error(err);
            }
        }));
        socket.on("start-game", (roomId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.startGame)(socket, io, roomId);
            }
            catch (err) {
                console.error(err);
            }
        }));
        // --- Disconnect ---
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, handlers_1.handleDisconnect)(socket, io);
            }
            catch (err) {
                console.error(err);
            }
        }));
    }));
}
