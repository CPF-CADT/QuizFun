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
exports.GameSessionManager = void 0;
const redis_1 = __importDefault(require("../redis"));
class Manager {
    constructor() {
        this.sessions = new Map();
    }
    addSession(roomId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = Object.assign(Object.assign({}, data), { participants: [], currentQuestionIndex: -1, answers: new Map(), gameState: 'lobby', isFinalResults: false, answerCounts: [] });
            this.sessions.set(roomId, session);
            yield redis_1.default.set(`session:${roomId}`, JSON.stringify(session));
            console.log(`[GameSession] In-memory session created for room ${roomId} (SessionID: ${data.sessionId}).`);
        });
    }
    getSession(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const local = this.sessions.get(roomId);
            if (local)
                return local;
            const redisData = yield redis_1.default.get(`session=${roomId}`);
            if (redisData) {
                const parsedData = JSON.parse(redisData);
                parsedData.answers = new Map(Object.entries(parsedData.answers));
                return parsedData;
            }
            return undefined;
        });
    }
    removeSession(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.getSession(roomId);
            if (room) {
                if (room.questionTimer)
                    clearTimeout(room.questionTimer);
                if (room.autoNextTimer)
                    clearTimeout(room.autoNextTimer);
                this.sessions.delete(roomId);
                yield redis_1.default.del(`session=${roomId}`); // Note: Fixed key to match
                console.log(`[GameSession] Room ${roomId} removed.`);
            }
        });
    }
    findSessionBySocketId(socketId) {
        for (const [roomId, session] of this.sessions.entries()) {
            if (session.participants.some(p => p.socket_id === socketId)) {
                return { roomId, session };
            }
        }
        return undefined;
    }
    getAllSessions() {
        return Array.from(this.sessions.entries(), ([roomId, session]) => ({
            roomId,
            session,
        }));
    }
}
exports.GameSessionManager = new Manager();
