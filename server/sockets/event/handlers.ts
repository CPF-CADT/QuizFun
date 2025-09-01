// FILE: src/socket/handlers/handlers.ts

import { Server, Socket } from "socket.io";
import { GameSessionManager, Participant, GameSettings, PlayerAnswer } from "../../config/data/GameSession";
import { broadcastGameState, endRound, nextQuestion } from "./shared";
import { GameRepository } from "../../repositories/game.repositories";
import { QuizModel } from "../../model/Quiz";
import { generateRandomNumber } from "../../service/generateRandomNumber";
import { GameSessionModel } from "../../model/GameSession";
import { TeamRepository } from "../../repositories/TeamRepository";
import redisClient from "../../config/redis";

interface CreateRoomData {
    quizId: string;
    userId: string;
    hostName: string;
    settings: GameSettings;
    teamId?: string;
}
interface JoinRoomData { roomId: number; username: string; userId: string; }
interface RejoinGameData { roomId: number; userId: string; }
interface SubmitAnswerData { roomId: number; userId: string; optionIndex: number; }
interface UpdateSettingsData {
    roomId: number;
    settings: GameSettings;
}
export async function handleUpdateSettings(socket: Socket, io: Server, data: UpdateSettingsData): Promise<void> {
    const { roomId, settings } = data;
    const room = await GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');

    if (!room || !host || host.socket_id !== socket.id) {
        return;
    }

    console.log(`[Settings] Host updated settings for room ${roomId}:`, settings);

    room.settings = settings;

    await broadcastGameState(io, roomId);
}

export async function handleCreateRoom(socket: Socket, io: Server, data: CreateRoomData): Promise<void> {
    const roomId = generateRandomNumber(6);
    console.log(`[Lobby] Attempting to create room ${roomId} for quiz ${data.quizId}. Team: ${data.teamId || 'None'}`);

    try {
        const newGameSession = new GameSessionModel({
            quizId: data.quizId,
            hostId: data.userId,
            teamId: data.teamId,
            joinCode: roomId,
            status: 'waiting',
            mode: 'multiplayer'
        });
        await newGameSession.save();
        const uniqueSessionId = newGameSession._id.toString();

        await GameSessionManager.addSession(roomId, {
            sessionId: uniqueSessionId,
            quizId: data.quizId,
            teamId: data.teamId, // <-- This ensures teamId is stored in memory
            hostId: data.userId,
            settings: data.settings,
        });

        const room = await GameSessionManager.getSession(roomId);
        if (!room) throw new Error("Failed to create session in memory.");

        const hostParticipant: Participant = {
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

        await broadcastGameState(io, roomId, socket.id);
        console.log(`[Lobby] Room ${roomId} created successfully. Host has been notified.`);

    } catch (error) {
        console.error(`[Lobby] FAILED to create room ${roomId}:`, error);
        socket.emit("error-message", "A server error prevented the room from being created.");
    }
}

export async function handleJoinRoom(socket: Socket, io: Server, data: JoinRoomData): Promise<void> {
    const { roomId, username, userId } = data;
    const room = await GameSessionManager.getSession(roomId);

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
        const isMember = await TeamRepository.isUserMemberOfTeam(room.teamId, userId);
        if (!isMember) {
            socket.emit("error-message", "You are not a member of the team for this private quiz.");
            return;
        }
    }

    const player: Participant = {
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
    await broadcastGameState(io, roomId);
}


export async function startGame(socket: Socket, io: Server, roomId: number): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);
    if (!room) return;

    const host = room.participants.find(p => p.role === 'host');
    if (!host || host.socket_id !== socket.id) return;

    if (room.participants.filter(p => p.role === 'player' && p.isOnline).length === 0) {
        socket.emit('error-message', "Cannot start the game with no players.");
        return;
    };

    try {
        const quiz = await QuizModel.findById(room.quizId).lean();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            broadcastGameState(io, roomId, "Error: This quiz has no questions.");
            return;
        }
        room.questions = quiz.questions;
        await GameRepository.updateSessionStatus(room.sessionId, 'in_progress');
        await nextQuestion(io, roomId);

        // ✅ **FIX: Notify team members that the game has started**
        // This tells the TeamQuizList to update the button to "In Progress".
        if (room.teamId) {
            io.to(`team-${room.teamId}`).emit("team-game-started", {
                sessionId: room.sessionId,
            });
            console.log(`[Game] Team ${room.teamId} notified: game for session ${room.sessionId} has started.`);
        }

    } catch (error) {
        console.error(`[Game] Error starting game for room ${roomId}:`, error);
        broadcastGameState(io, roomId, "A server error occurred while starting the game.");
    }
}


export async function handleSubmitAnswer(socket: Socket, io: Server, data: SubmitAnswerData): Promise<void> {
    const { roomId, userId, optionIndex } = data;
    const room = await GameSessionManager.getSession(roomId);
    if (!room) return;
    const player = room.participants.find(p => p.user_id === userId);

    if (!room || !player || player.role !== 'player' || room.gameState !== 'question' || !room.questions) return;
    if (!room.settings.allowAnswerChange && player.hasAnswered) return;

    const currentQuestion = room.questions[room.currentQuestionIndex];
    if (!currentQuestion) {
        console.error(`Room ${roomId} has no valid current question.`);
        return;
    }

    const elapsedMs = Date.now() - (room.questionStartTime ?? Date.now());
    const remainingSec = currentQuestion.timeLimit - Math.max(0, currentQuestion.timeLimit - elapsedMs / 1000);

    const playerAnswer: PlayerAnswer = {
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
        broadcastGameState(io, roomId);
    }

    const activePlayers = room.participants.filter(p => p.role === 'player' && p.isOnline);
    if (!room.settings.allowAnswerChange && activePlayers.every(p => p.hasAnswered)) {
        await endRound(io, roomId);
    }
}

export async function handleRequestNextQuestion(socket: Socket, io: Server, roomId: number): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);
    if (!room) return;
    const host = room.participants.find(p => p.role === 'host');
    if (!host || !host.socket_id) return;
    if (room && host.socket_id === socket.id && room.gameState === 'results') {
        if (room.autoNextTimer) {
            clearTimeout(room.autoNextTimer);
            room.autoNextTimer = undefined;
        }
        await nextQuestion(io, roomId);
    }
}

export async function handlePlayAgain(socket: Socket, io: Server, roomId: number): Promise<void> {
    const room = await GameSessionManager.getSession(roomId);
    if (!room) return;
    const host = room.participants.find(p => p.role === 'host');

    if (!host || !host.socket_id) return;

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
        broadcastGameState(io, roomId);
    }
}

export async function handleRejoinGame(socket: Socket, io: Server, data: RejoinGameData): Promise<void> {
    const { roomId, userId } = data;
    const room = await GameSessionManager.getSession(roomId);
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
            socket.emit('your-selected', { reconnect: true, option: room.answers.get(userId)?.at(-1)?.optionIndex, questionNo: room.currentQuestionIndex });
        }
        console.log(participant.hasAnswered, room.answers.get(userId)?.at(-1)?.optionIndex, room.currentQuestionIndex)
        broadcastGameState(io, roomId);
    } else {
        socket.emit('error-message', 'Could not find your session in this game.');
    }
}

export async function handleDisconnect(socket: Socket, io: Server): Promise<void> {
    const sessionInfo = GameSessionManager.findSessionBySocketId(socket.id);
    if (!sessionInfo) return;

    const { roomId, session } = sessionInfo;
    const disconnectedUser = session.participants.find(p => p.socket_id === socket.id);

    if (disconnectedUser) {
        console.log(`[Connection] User ${disconnectedUser.user_name} disconnected.`);
        disconnectedUser.isOnline = false;

        if (disconnectedUser.role === 'host') {
            broadcastGameState(io, roomId, "The host has disconnected. The game has ended.");

            // ✅ **FIX: Notify team members that the lobby is now closed**
            // This resets the quiz card on the TeamQuizList page back to "Waiting for Host".
            if (session.teamId) {
                io.to(`team-${session.teamId}`).emit("team-lobby-closed", {
                    sessionId: session.sessionId,
                });
                console.log(`[Disconnect] Team ${session.teamId} notified: lobby for session ${session.sessionId} has closed.`);
            }

        } else {
            const activePlayers = session.participants.filter(p => p.role === 'player' && p.isOnline);
            if (session.gameState === 'question' && !session.settings.allowAnswerChange && activePlayers.length > 0 && activePlayers.every(p => p.hasAnswered)) {
                await endRound(io, roomId);
            } else {
                broadcastGameState(io, roomId);
            }
        }
    }
}
