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
const GameSession_1 = require("../config/data/GameSession");
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Add a session
        GameSession_1.GameSessionManager.addSession(123, {
            sessionId: "sess1",
            quizId: "quiz101",
            hostId: "hostA",
            settings: { autoNext: true, allowAnswerChange: false },
        });
        // 2. Get session
        const session = GameSession_1.GameSessionManager.getSession(123);
        console.log("Get session:", session);
    });
}
runTest();
