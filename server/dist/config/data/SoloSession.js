"use strict";
// src/config/data/SoloSession.ts 
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
exports.soloSessionManager = void 0;
const redis_1 = __importDefault(require("../redis"));
const SOLO_SESSION_TTL = 20 * 60; // 2 hours
class SoloSessionManager {
    getCacheKey(sessionId) {
        return `solo-session:${sessionId}`;
    }
    addSession(sessionId, gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.getCacheKey(sessionId);
            yield redis_1.default.set(key, JSON.stringify(gameState), {
                EX: SOLO_SESSION_TTL,
            });
            console.log(`[SoloCache] Started and cached session ${sessionId}`);
        });
    }
    getSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.getCacheKey(sessionId);
            const data = yield redis_1.default.get(key);
            return data ? JSON.parse(data) : null;
        });
    }
    updateSession(sessionId, updatedState) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.getCacheKey(sessionId);
            // Use SET with KEEPTTL to update without changing the expiration time
            yield redis_1.default.set(key, JSON.stringify(updatedState), {
                KEEPTTL: true,
            });
        });
    }
    removeSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.getCacheKey(sessionId);
            yield redis_1.default.del(key);
            console.log(`[SoloCache] Removed session ${sessionId}`);
        });
    }
}
exports.soloSessionManager = new SoloSessionManager();
