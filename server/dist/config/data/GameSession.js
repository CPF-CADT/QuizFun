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
            yield redis_1.default.set(`session= ${roomId}`, JSON.stringify(session));
            console.log(`[GameSession] In-memory session created for room ${roomId} (SessionID: ${data.sessionId}).`);
        });
    }
    getSession(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const local = this.sessions.get(roomId);
            if (local)
                return local;
            const redisData = yield redis_1.default.get(`room session${roomId}`);
            if (redisData) {
                return JSON.parse(redisData);
            }
            return undefined;
        });
    }
    removeSession(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const room = this.getSession(roomId);
            if (room) {
                if ((_a = (yield room)) === null || _a === void 0 ? void 0 : _a.questionTimer)
                    clearTimeout((_b = (yield room)) === null || _b === void 0 ? void 0 : _b.questionTimer);
                if ((_c = (yield room)) === null || _c === void 0 ? void 0 : _c.autoNextTimer)
                    clearTimeout((_d = (yield room)) === null || _d === void 0 ? void 0 : _d.autoNextTimer);
                this.sessions.delete(roomId);
                yield redis_1.default.del(`sessionId:${roomId}`);
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
}
exports.GameSessionManager = new Manager();
