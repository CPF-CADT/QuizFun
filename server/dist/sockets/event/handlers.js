"use strict";
// FILE: src/socket/handlers/handlers.ts
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
exports.handleUpdateSettings = handleUpdateSettings;
exports.handleCreateRoom = handleCreateRoom;
exports.handleJoinRoom = handleJoinRoom;
exports.startGame = startGame;
exports.handleSubmitAnswer = handleSubmitAnswer;
exports.handleRequestNextQuestion = handleRequestNextQuestion;
exports.handlePlayAgain = handlePlayAgain;
exports.handleRejoinGame = handleRejoinGame;
exports.handleDisconnect = handleDisconnect;
const GameSession_1 = require("../../config/data/GameSession");
const shared_1 = require("./shared");
const game_repositories_1 = require("../../repositories/game.repositories");
const Quiz_1 = require("../../model/Quiz");
const generateRandomNumber_1 = require("../../service/generateRandomNumber");
const GameSession_2 = require("../../model/GameSession");
const TeamRepository_1 = require("../../repositories/TeamRepository");
function handleUpdateSettings(socket, io, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { roomId, settings } = data;
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        const host = room === null || room === void 0 ? void 0 : room.participants.find(p => p.role === 'host');
        if (!room || !host || host.socket_id !== socket.id) {
            return;
        }
        console.log(`[Settings] Host updated settings for room ${roomId}:`, settings);
        room.settings = settings;
        yield (0, shared_1.broadcastGameState)(io, roomId);
    });
}
function handleCreateRoom(socket, io, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomId = (0, generateRandomNumber_1.generateRandomNumber)(6);
        console.log(`[Lobby] Attempting to create room ${roomId} for quiz ${data.quizId}. Team: ${data.teamId || 'None'}`);
        try {
            const newGameSession = new GameSession_2.GameSessionModel({
                quizId: data.quizId,
                hostId: data.userId,
                teamId: data.teamId,
                joinCode: roomId,
                status: 'waiting',
                mode: 'multiplayer'
            });
            yield newGameSession.save();
            const uniqueSessionId = newGameSession._id.toString();
            yield GameSession_1.GameSessionManager.addSession(roomId, {
                sessionId: uniqueSessionId,
                quizId: data.quizId,
                teamId: data.teamId, // <-- This ensures teamId is stored in memory
                hostId: data.userId,
                settings: data.settings,
            });
            const room = yield GameSession_1.GameSessionManager.getSession(roomId);
            if (!room)
                throw new Error("Failed to create session in memory.");
            const hostParticipant = {
                socket_id: socket.id,
                user_id: data.userId,
                user_name: data.hostName,
                isOnline: true,
                score: 0,
                role: 'host',
                hasAnswered: false,
            };
            room.participants.push(hostParticipant);
            socket.join(roomId.toString());
            yield (0, shared_1.broadcastGameState)(io, roomId, socket.id);
            console.log(`[Lobby] Room ${roomId} created successfully. Host has been notified.`);
        }
        catch (error) {
            console.error(`[Lobby] FAILED to create room ${roomId}:`, error);
            socket.emit("error-message", "A server error prevented the room from being created.");
        }
    });
}
function handleJoinRoom(socket, io, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { roomId, username, userId } = data;
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room) {
            socket.emit("error-message", `Room "${roomId}" does not exist.`);
            return;
        }
        if (room.gameState === 'end') {
            socket.emit("error-message", `Game in room "${roomId}" has already finished.`);
            return;
        }
        if (room.participants.some(p => p.user_id === userId)) {
            return handleRejoinGame(socket, io, { roomId, userId });
        }
        if (room.participants.length >= 50) {
            socket.emit("error-message", `Room "${roomId}" is full.`);
            return;
        }
        if (room.teamId) {
            const isMember = yield TeamRepository_1.TeamRepository.isUserMemberOfTeam(room.teamId, userId);
            if (!isMember) {
                socket.emit("error-message", "You are not a member of the team for this private quiz.");
                return;
            }
        }
        const player = {
            socket_id: socket.id,
            user_id: userId,
            user_name: username,
            isOnline: true,
            score: 0,
            role: 'player',
            hasAnswered: false,
        };
        room.participants.push(player);
        socket.join(roomId.toString());
        yield (0, shared_1.broadcastGameState)(io, roomId);
    });
}
function startGame(socket, io, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room)
            return;
        const host = room.participants.find(p => p.role === 'host');
        if (!host || host.socket_id !== socket.id)
            return;
        if (room.participants.filter(p => p.role === 'player' && p.isOnline).length === 0) {
            socket.emit('error-message', "Cannot start the game with no players.");
            return;
        }
        ;
        try {
            const quiz = yield Quiz_1.QuizModel.findById(room.quizId).lean();
            if (!quiz || !quiz.questions || quiz.questions.length === 0) {
                (0, shared_1.broadcastGameState)(io, roomId, "Error: This quiz has no questions.");
                return;
            }
            room.questions = quiz.questions;
            yield game_repositories_1.GameRepository.updateSessionStatus(room.sessionId, 'in_progress');
            yield (0, shared_1.nextQuestion)(io, roomId);
            // ✅ **FIX: Notify team members that the game has started**
            // This tells the TeamQuizList to update the button to "In Progress".
            if (room.teamId) {
                io.to(`team-${room.teamId}`).emit("team-game-started", {
                    sessionId: room.sessionId,
                });
                console.log(`[Game] Team ${room.teamId} notified: game for session ${room.sessionId} has started.`);
            }
        }
        catch (error) {
            console.error(`[Game] Error starting game for room ${roomId}:`, error);
            (0, shared_1.broadcastGameState)(io, roomId, "A server error occurred while starting the game.");
        }
    });
}
function handleSubmitAnswer(socket, io, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { roomId, userId, optionIndex } = data;
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room)
            return;
        const player = room.participants.find(p => p.user_id === userId);
        if (!room || !player || player.role !== 'player' || room.gameState !== 'question' || !room.questions)
            return;
        if (!room.settings.allowAnswerChange && player.hasAnswered)
            return;
        const currentQuestion = room.questions[room.currentQuestionIndex];
        if (!currentQuestion) {
            console.error(`Room ${roomId} has no valid current question.`);
            return;
        }
        const elapsedMs = Date.now() - ((_a = room.questionStartTime) !== null && _a !== void 0 ? _a : Date.now());
        const remainingSec = currentQuestion.timeLimit - Math.max(0, currentQuestion.timeLimit - elapsedMs / 1000);
        const playerAnswer = {
            optionIndex: optionIndex,
            remainingTime: remainingSec,
            isCorrect: false,
        };
        const userAnswers = room.answers.get(userId) || [];
        userAnswers.push(playerAnswer);
        room.answers.set(userId, userAnswers);
        player.hasAnswered = true;
        console.log(`[Game] Player ${player.user_name} in room ${roomId} submitted answer ${optionIndex}.`);
        if (room.settings.allowAnswerChange) {
            (0, shared_1.broadcastGameState)(io, roomId);
        }
        const activePlayers = room.participants.filter(p => p.role === 'player' && p.isOnline);
        if (!room.settings.allowAnswerChange && activePlayers.every(p => p.hasAnswered)) {
            yield (0, shared_1.endRound)(io, roomId);
        }
    });
}
function handleRequestNextQuestion(socket, io, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room)
            return;
        const host = room.participants.find(p => p.role === 'host');
        if (!host || !host.socket_id)
            return;
        if (room && host.socket_id === socket.id && room.gameState === 'results') {
            if (room.autoNextTimer) {
                clearTimeout(room.autoNextTimer);
                room.autoNextTimer = undefined;
            }
            yield (0, shared_1.nextQuestion)(io, roomId);
        }
    });
}
function handlePlayAgain(socket, io, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room)
            return;
        const host = room.participants.find(p => p.role === 'host');
        if (!host || !host.socket_id)
            return;
        if (room && host.socket_id === socket.id && room.gameState === 'end') {
            console.log(`[Lobby] Host is restarting game in room ${roomId}`);
            room.gameState = 'lobby';
            room.currentQuestionIndex = -1;
            room.answers.clear();
            room.answerCounts = [];
            room.isFinalResults = false;
            room.participants.forEach(p => {
                p.score = 0;
                p.hasAnswered = false;
            });
            (0, shared_1.broadcastGameState)(io, roomId);
        }
    });
}
function handleRejoinGame(socket, io, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const { roomId, userId } = data;
        const room = yield GameSession_1.GameSessionManager.getSession(roomId);
        if (!room) {
            socket.emit('error-message', 'The game you tried to rejoin does not exist.');
            return;
        }
        const participant = room.participants.find(p => p.user_id === userId);
        if (participant) {
            console.log(`[Connection] Participant ${participant.user_name} reconnected.`);
            participant.socket_id = socket.id;
            participant.isOnline = true;
            socket.join(roomId.toString());
            if (participant.hasAnswered) {
                socket.emit('your-selected', { reconnect: true, option: (_b = (_a = room.answers.get(userId)) === null || _a === void 0 ? void 0 : _a.at(-1)) === null || _b === void 0 ? void 0 : _b.optionIndex, questionNo: room.currentQuestionIndex });
            }
            console.log(participant.hasAnswered, (_d = (_c = room.answers.get(userId)) === null || _c === void 0 ? void 0 : _c.at(-1)) === null || _d === void 0 ? void 0 : _d.optionIndex, room.currentQuestionIndex);
            (0, shared_1.broadcastGameState)(io, roomId);
        }
        else {
            socket.emit('error-message', 'Could not find your session in this game.');
        }
    });
}
function handleDisconnect(socket, io) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessionInfo = GameSession_1.GameSessionManager.findSessionBySocketId(socket.id);
        if (!sessionInfo)
            return;
        const { roomId, session } = sessionInfo;
        const disconnectedUser = session.participants.find(p => p.socket_id === socket.id);
        if (disconnectedUser) {
            console.log(`[Connection] User ${disconnectedUser.user_name} disconnected.`);
            disconnectedUser.isOnline = false;
            if (disconnectedUser.role === 'host') {
                (0, shared_1.broadcastGameState)(io, roomId, "The host has disconnected. The game has ended.");
                // ✅ **FIX: Notify team members that the lobby is now closed**
                // This resets the quiz card on the TeamQuizList page back to "Waiting for Host".
                if (session.teamId) {
                    io.to(`team-${session.teamId}`).emit("team-lobby-closed", {
                        sessionId: session.sessionId,
                    });
                    console.log(`[Disconnect] Team ${session.teamId} notified: lobby for session ${session.sessionId} has closed.`);
                }
            }
            else {
                const activePlayers = session.participants.filter(p => p.role === 'player' && p.isOnline);
                if (session.gameState === 'question' && !session.settings.allowAnswerChange && activePlayers.length > 0 && activePlayers.every(p => p.hasAnswered)) {
                    yield (0, shared_1.endRound)(io, roomId);
                }
                else {
                    (0, shared_1.broadcastGameState)(io, roomId);
                }
            }
        }
    });
}
