import { GameSessionManager } from "../config/data/GameSession"; 

async function runTest() {
    // 1. Add a session
    GameSessionManager.addSession(123, {
        sessionId: "sess1",
        quizId: "quiz101",
        hostId: "hostA",
        settings: { autoNext: true, allowAnswerChange: false },
    });

    // 2. Get session
    const session = GameSessionManager.getSession(123);
    console.log("Get session:", session);
}
runTest()