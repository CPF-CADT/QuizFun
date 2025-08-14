import { Server, Socket } from "socket.io";
import { GameSessionManager, Participant, GameSettings, PlayerAnswer } from "../../config/data/GameSession";
import { generateRandomNumber } from '../../service/generateRandomNumber';
import { QuizModel } from "../../model/Quiz";
import { broadcastGameState, endRound } from "./shared";
import { GameRepository } from "../../repositories/game.repositories";

interface CreateRoomData { quizId: string; userId: string; hostName: string; settings: GameSettings; }
interface JoinRoomData { roomId: number; username: string; userId: string; }
interface RejoinGameData { roomId: number; userId: string; }
interface SubmitAnswerData { roomId: number; userId: string; optionIndex: number; }

export async function handleCreateRoom(socket: Socket, io: Server, data: CreateRoomData): Promise<void> {
    const roomId = generateRandomNumber(6);
    GameSessionManager.addSession(roomId, {
        quizId: data.quizId,
        hostId: data.userId,
        settings: data.settings,
    });

    const room = GameSessionManager.getSession(roomId);
    
    if (!room) {
        console.error(`[Lobby] CRITICAL: Failed to create or retrieve session for room ${roomId}.`);
        socket.emit("error-message", "Failed to create the room due to a server error.");
        return;
    }

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
    broadcastGameState(io, roomId);
}

export async function handleJoinRoom(socket: Socket, io: Server, data: JoinRoomData): Promise<void> {
    const { roomId, username, userId } = data;
    const room = GameSessionManager.getSession(roomId);

    if (!room) {
        socket.emit("error-message", `Room "${roomId}" does not exist.`);
        return;
    }
    if (room.gameState !== 'lobby') {
        socket.emit("error-message", `Game in room "${roomId}" has already started.`);
        return;
    }
    if (room.participants.some(p => p.user_id === userId)) {
        await handleRejoinGame(socket, io, { roomId, userId });
        return;
    }
    if (room.participants.length >= 50) {
        socket.emit("error-message", `Room "${roomId}" is full.`);
        return;
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
    broadcastGameState(io, roomId);
}

export async function startGame(socket: Socket, io: Server, roomId: number): Promise<void> {
    const room = GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');

    if (!room || !host || host.socket_id !== socket.id) return;
    if (room.participants.filter(p => p.role === 'player' && p.isOnline).length === 0) return;

    try {
        const quiz = await QuizModel.findById(room.quizId).lean();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            broadcastGameState(io, roomId, "Error: This quiz has no questions.");
            return;
        }
        room.questions = quiz.questions;
        await GameRepository.createGameSession(roomId);
        await nextQuestion(io, roomId);
    } catch (error) {
        console.error(`[Game] Error starting game for room ${roomId}:`, error);
        broadcastGameState(io, roomId, "A server error occurred while starting the game.");
    }
}

export async function nextQuestion(io: Server, roomId: number): Promise<void> {
    const room = GameSessionManager.getSession(roomId);
    if (!room || !room.questions) return;

    room.currentQuestionIndex++;
    room.answers.clear();
    room.answerCounts = [];
    room.participants.forEach(p => p.hasAnswered = false);

    if (room.currentQuestionIndex >= room.questions.length) {
        console.log(`[Game] Final question answered for room ${roomId}.`);
        room.gameState = 'end';
        room.isFinalResults = true;
        await GameRepository.finalizeGameSession(roomId);
        broadcastGameState(io, roomId);
        return;
    }

    room.gameState = 'question';
    console.log(`[Game] Sending question ${room.currentQuestionIndex + 1} to room ${roomId}.`);
    broadcastGameState(io, roomId);
}

export async function handleSubmitAnswer(socket: Socket, io: Server, data: SubmitAnswerData): Promise<void> {
    const { roomId, userId, optionIndex } = data;
    const room = GameSessionManager.getSession(roomId);
    const player = room?.participants.find(p => p.user_id === userId);
    
    if (!room || !player || player.role !== 'player' || room.gameState !== 'question' || !room.questions) return;
    if (!room.settings.allowAnswerChange && player.hasAnswered) return;

    const currentQuestion = room.questions[room.currentQuestionIndex];
    if (!currentQuestion) {
        console.error(`Room ${roomId} has no valid current question.`);
        return;
    }
    
    const elapsedMs = Date.now() - (room.questionStartTime ?? Date.now());
    const remainingSec = Math.max(0, currentQuestion.timeLimit - elapsedMs / 1000);

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
    const room = GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');
    if (room && host?.socket_id === socket.id && room.gameState === 'results') {
        if (room.autoNextTimer) {
            clearTimeout(room.autoNextTimer);
            room.autoNextTimer = undefined;
        }
        await nextQuestion(io, roomId);
    }
}

export async function handlePlayAgain(socket: Socket, io: Server, roomId: number): Promise<void> {
    const room = GameSessionManager.getSession(roomId);
    const host = room?.participants.find(p => p.role === 'host');

    if (room && host?.socket_id === socket.id && room.gameState === 'end') {
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
    const room = GameSessionManager.getSession(roomId);
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
            GameSessionManager.removeSession(roomId);
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